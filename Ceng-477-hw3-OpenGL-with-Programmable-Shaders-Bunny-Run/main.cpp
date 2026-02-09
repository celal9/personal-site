#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <fstream>
#include <iostream>
#include <sstream>
#include <vector>
#define _USE_MATH_DEFINES
#include <math.h>
#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#include <GLES3/gl3.h>
#else
#include <GL/glew.h>
#include <GL/gl.h>   // The GL Header File
#endif
#include <GLFW/glfw3.h> // The GLFW header
#include <glm/glm.hpp>	// GL Math library header
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#define STB_IMAGE_IMPLEMENTATION
#include <stb/stb_image.h>
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <stb/stb_image_write.h>
#define BUFFER_OFFSET(i) ((char *)NULL + (i))


using namespace std;
struct Vertex
{   glm::vec3 Position; // Vertex position
    glm::vec3 Normal;   // Vertex normal
    glm::vec2 TexCoords; // Texture coordinates

	Vertex(GLfloat inX, GLfloat inY, GLfloat inZ) : x(inX), y(inY), z(inZ) {}
	GLfloat x, y, z;
};
GLuint gProgram[5];
static bool gDebugLogs = false;



// Define the vertices of the road (two triangles to form a rectangle)

float vertices[] = {
    // positions          // colors           // texture coords
     0.5f,  0.5f, 0.0f,   1.0f, 0.0f, 0.0f,   1.0f, 1.0f,   // top right
     0.5f, -0.5f, 0.0f,   0.0f, 1.0f, 0.0f,   1.0f, 0.0f,   // bottom right
    -0.5f, -0.5f, 0.0f,   0.0f, 0.0f, 1.0f,   0.0f, 0.0f,   // bottom left
    -0.5f,  0.5f, 0.0f,   1.0f, 1.0f, 0.0f,   0.0f, 1.0f    // top left
};

float bgVertices[] = {
    // positions    // texture coords
    -1.0f,  1.0f,    0.0f, 1.0f,
    -1.0f, -1.0f,    0.0f, 0.0f,
     1.0f, -1.0f,    1.0f, 0.0f,

    -1.0f,  1.0f,    0.0f, 1.0f,
     1.0f, -1.0f,    1.0f, 0.0f,
     1.0f,  1.0f,    1.0f, 1.0f
};

float angleDegrees = 60.0f; // Angle in degrees
float angleRadians = glm::radians(angleDegrees); // Convert to radians

// Assuming rotation around the Y-axis3
glm::mat4 rotationMatrix = glm::rotate(glm::mat4(1.0f), angleRadians, glm::vec3(0.0f, 1.0f, 0.0f));


#ifdef __EMSCRIPTEN__
const GLchar* bgVertexShaderSrc = R"glsl(#version 300 es
layout (location = 0) in vec2 position;
layout (location = 1) in vec2 texCoords;
out vec2 TexCoords;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    TexCoords = texCoords;
}
)glsl";

const GLchar* bgFragmentShaderSrc = R"glsl(#version 300 es
precision highp float;
in vec2 TexCoords;
out vec4 color;
uniform sampler2D bgTexture;
void main() {
    color = texture(bgTexture, TexCoords);
}
)glsl";

const GLchar* VertexShaderForObject = R"glsl(#version 300 es
uniform mat4 modelingMatrix;
uniform mat4 viewingMatrix;
uniform mat4 projectionMatrix;

layout(location=0) in vec3 inVertex;
layout(location=1) in vec3 inNormal;

out vec4 fragWorldPos;
out vec3 fragWorldNor;

void main(void)
{
    fragWorldPos = modelingMatrix * vec4(inVertex, 1);
    fragWorldNor = inverse(transpose(mat3x3(modelingMatrix))) * inNormal;

    gl_Position = projectionMatrix * viewingMatrix * modelingMatrix * vec4(inVertex, 1);
}
)glsl";

const GLchar* FragmentShaderForObject = R"glsl(#version 300 es
precision highp float;

vec3 I = vec3(1, 1, 1);
vec3 Iamb = vec3(0.8, 0.8, 0.8);
vec3 kd = vec3(1, 0.2, 0.2);
vec3 ka = vec3(0.3, 0.3, 0.3);
vec3 ks = vec3(0.8, 0.8, 0.8);
vec3 lightPos = vec3(5, 5, 5);

uniform vec3 eyePos;
uniform vec4 objectColor;
in vec4 fragWorldPos;
in vec3 fragWorldNor;

out vec4 fragColor;

void main(void)
{
    fragColor = objectColor;
}
)glsl";
#else
const GLchar* bgVertexShaderSrc = R"glsl(
    #version 330 core
    layout (location = 0) in vec2 position;
    layout (location = 1) in vec2 texCoords;
    out vec2 TexCoords;

    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        TexCoords = texCoords;
    }
)glsl";

const GLchar* bgFragmentShaderSrc = R"glsl(
    #version 330 core
    in vec2 TexCoords;
    out vec4 color;
    uniform sampler2D bgTexture;
    void main() {
        color = texture(bgTexture, TexCoords);
    }
)glsl";

const GLchar* VertexShaderForObject = R"glsl(
    #version 330 core

    uniform mat4 modelingMatrix;
    uniform mat4 viewingMatrix;
    uniform mat4 projectionMatrix;

    layout(location=0) in vec3 inVertex;
    layout(location=1) in vec3 inNormal;

    out vec4 fragWorldPos;
    out vec3 fragWorldNor;

    void main(void)
    {
        // Compute the world coordinates of the vertex and its normal.
        // These coordinates will be interpolated during the rasterization
        // stage and the fragment shader will receive the interpolated
        // coordinates.

        fragWorldPos = modelingMatrix * vec4(inVertex, 1);
        fragWorldNor = inverse(transpose(mat3x3(modelingMatrix))) * inNormal;

        gl_Position = projectionMatrix * viewingMatrix * modelingMatrix * vec4(inVertex, 1);
    }
)glsl";

const GLchar* FragmentShaderForObject = R"glsl(
#version 330 core

// All of the following variables could be defined in the OpenGL
// program and passed to this shader as uniform variables. This
// would be necessary if their values could change during runtim.
// However, we will not change them and therefore we define them
// here for simplicity.

vec3 I = vec3(1, 1, 1);          // point light intensity
vec3 Iamb = vec3(0.8, 0.8, 0.8); // ambient light intensity
vec3 kd = vec3(1, 0.2, 0.2);     // diffuse reflectance coefficient
vec3 ka = vec3(0.3, 0.3, 0.3);   // ambient reflectance coefficient
vec3 ks = vec3(0.8, 0.8, 0.8);   // specular reflectance coefficient
vec3 lightPos = vec3(5, 5, 5);   // light position in world coordinates

uniform vec3 eyePos;
uniform vec4 objectColor;
in vec4 fragWorldPos;
in vec3 fragWorldNor;

out vec4 fragColor;

void main(void)
{
	// Compute lighting. We assume lightPos and eyePos are in world
	// coordinates. fragWorldPos and fragWorldNor are the interpolated
	// coordinates by the rasterizer.

	vec3 L = normalize(lightPos - vec3(fragWorldPos));
	vec3 V = normalize(eyePos - vec3(fragWorldPos));
	vec3 H = normalize(L + V);
	vec3 N = normalize(fragWorldNor);

	float NdotL = dot(N, L); // for diffuse component
	float NdotH = dot(N, H); // for specular component

	vec3 diffuseColor = I * kd * max(0.0, NdotL);
	vec3 specularColor = I * ks * pow(max(0.0, NdotH), 100.0);
	vec3 ambientColor = Iamb * ka;

	fragColor = objectColor;
}
)glsl";
#endif


int gWidth, gHeight;
float leftBound= -4.5f;
float rightBound= 3.0f;
float translationX = -0.9f; // Initialize it to 0.0 initially
float rotateX = -90;	   // Initialize it to 0.0 initially
float rotateZ = 0;	   // Initialize it to 0.0 initially
float speed= 0.45f;
bool isJumping = false;
bool up_down= true;
bool isAPressed = false;
bool isDPressed = false;
bool isxPressed=false;
bool useMouseControls = true;
float jumpHeight = -5.0f; // Adjust the jump height as needed
float jumpVelocity = -0.045f;
float roadVelocity = +0.4f;
GLint modelingMatrixLoc[5];
GLint viewingMatrixLoc[5];
GLint projectionMatrixLoc[5];
GLint eyePosLoc[5];
GLuint quadVAO, quadVBO;
GLuint bgVAO, bgVBO;       // Global variable for background Vertex Array Object
GLuint bgShaderProgram, bgTexture;
GLuint shaderProgram;
GLint myTexture;
bool first=false;
GLuint textureID=1;
GLuint textureID2=2;

bool isYellowTouch=true; //Implement here! unutma, false yappmalısın bu sadece test etmek için
float rotate_velocity=+10.0f;
bool isLoop=false;
float temp;

glm::mat4 projectionMatrix;
glm::mat4 viewingMatrix;
glm::mat4 modelingMatrix;

glm::mat4 projectionMatrix2;
glm::mat4 viewingMatrix2;
glm::mat4 modelingMatrix2;
glm::vec3 eyePos(5, 5, -60);

static float clampf(float v, float minV, float maxV) {
    if (v < minV) return minV;
    if (v > maxV) return maxV;
    return v;
}



int activeProgramIndex = 0;

struct Texture
{
	Texture(GLfloat inU, GLfloat inV) : u(inU), v(inV) {}
	GLfloat u, v;
};

struct Normal
{
	Normal(GLfloat inX, GLfloat inY, GLfloat inZ) : x(inX), y(inY), z(inZ) {}
	GLfloat x, y, z;
};

struct Face
{
	Face(int v[], int t[], int n[])
	{
		vIndex[0] = v[0];
		vIndex[1] = v[1];
		vIndex[2] = v[2];
		tIndex[0] = t[0];
		tIndex[1] = t[1];
		tIndex[2] = t[2];
		nIndex[0] = n[0];
		nIndex[1] = n[1];
		nIndex[2] = n[2];
	}
	GLuint vIndex[3], tIndex[3], nIndex[3];
};

vector<Vertex> gVertices;
vector<Texture> gTextures;
vector<Normal> gNormals;
vector<Face> gFaces;
int gamefinish=0;
int variable=5;
vector<Vertex> gVertices2;
vector<Texture> gTextures2;
vector<Normal> gNormals2;
vector<Face> gFaces2;
int obstacleIndex;
int score=0;
GLuint gVertexAttribBuffer, gIndexBuffer;
GLint gInVertexLoc, gInNormalLoc;
int gVertexDataSizeInBytes, gNormalDataSizeInBytes;
int gVertexDataSizeInBytes2, gNormalDataSizeInBytes2;
GLuint gVertexAttribBuffer2, gIndexBuffer2;
GLint gInVertexLoc2, gInNormalLoc2;
GLuint vao, vao2;

const char* getGLErrorString(GLenum error) {
    switch (error) {
        case GL_NO_ERROR:
            return "No error";
        case GL_INVALID_ENUM:
            return "Invalid enum";
        case GL_INVALID_VALUE:
            return "Invalid value";
        case GL_INVALID_OPERATION:
            return "Invalid operation";
        case GL_INVALID_FRAMEBUFFER_OPERATION:
            return "Invalid framebuffer operation";
        case GL_OUT_OF_MEMORY:
            return "Out of memory";
        default:
            return "Unknown error";
    }
}

void checkGLError(string here) {
    if (!gDebugLogs) return;
    while (GLenum error = glGetError()) {
        std::cerr << "OpenGL Error: " << getGLErrorString(error) << here << std::endl;
    }
}

void checkShaderCompilation(GLuint shader) {
    GLint success;
    GLchar infoLog[1024];
    glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(shader, 1024, NULL, infoLog);
        if (gDebugLogs) {
            std::cerr << "ERROR::SHADER_COMPILATION_ERROR: " << infoLog << std::endl;
        }
    }
}

void checkProgramLinking(GLuint program) {
    GLint success;
    GLchar infoLog[1024];
    glGetProgramiv(program, GL_LINK_STATUS, &success);
    if (!success) {
        glGetProgramInfoLog(program, 1024, NULL, infoLog);
        if (gDebugLogs) {
            std::cerr << "ERROR::PROGRAM_LINKING_ERROR: " << infoLog << std::endl;
        }
    }
}

void validateShaderProgram(GLuint program) {
    GLint validate = 0;
    glValidateProgram(program);
    glGetProgramiv(program, GL_VALIDATE_STATUS, &validate);
    if (!validate) {
        GLchar infoLog[512];
        glGetProgramInfoLog(program, 512, NULL, infoLog);
        if (gDebugLogs) {
            std::cerr << "Error validating shader program: " << infoLog << std::endl;
        }
    }
}

bool ReadDataFromFile(
	const string &fileName, ///< [in]  Name of the shader file
	string &data)			///< [out] The contents of the file
{
	fstream myfile;

	// Open the input
	myfile.open(fileName.c_str(), std::ios::in);

	if (myfile.is_open())
	{
		string curLine;

		while (getline(myfile, curLine))
		{
			data += curLine;
			if (!myfile.eof())
			{
				data += "\n";
			}
		}

		myfile.close();
	}
	else
	{
		return false;
	}

	return true;
}

#ifdef __EMSCRIPTEN__
static std::string PatchShaderForWebGL(const std::string &source, bool isFragment)
{
	std::string patched = source;
	// Strip UTF-8 BOM if present.
	if (patched.size() >= 3 &&
		static_cast<unsigned char>(patched[0]) == 0xEF &&
		static_cast<unsigned char>(patched[1]) == 0xBB &&
		static_cast<unsigned char>(patched[2]) == 0xBF)
	{
		patched.erase(0, 3);
	}

	const std::string from = "#version 330 core";
	const std::string to = "#version 300 es";
	size_t versionPos = patched.find("#version");
	if (versionPos != std::string::npos && versionPos > 0)
	{
		patched.erase(0, versionPos);
	}
	size_t pos = patched.find(from);
	if (pos != std::string::npos)
	{
		patched.replace(pos, from.size(), to);
	}
	else if (patched.find("#version 300 es") == std::string::npos)
	{
		patched = to + std::string("\n") + patched;
	}

	if (isFragment && patched.find("precision") == std::string::npos)
	{
		size_t newlinePos = patched.find("\n");
		if (newlinePos != std::string::npos)
		{
			patched.insert(
				newlinePos + 1,
				"precision highp float;\nprecision highp int;\n");
		}
	}

	return patched;
}
#endif

GLuint createVS(const char *shaderName)
{
	string shaderSource;

	string filename(shaderName);
	if (!ReadDataFromFile(filename, shaderSource))
	{
		cout << "Cannot find file name: " + filename << endl;
		exit(-1);
	}

	#ifdef __EMSCRIPTEN__
	shaderSource = PatchShaderForWebGL(shaderSource, false);
	#endif

	GLint length = shaderSource.length();
	const GLchar *shader = (const GLchar *)shaderSource.c_str();

	GLuint vs = glCreateShader(GL_VERTEX_SHADER);
	glShaderSource(vs, 1, &shader, &length);
	glCompileShader(vs);

	char output[1024] = {0};
	glGetShaderInfoLog(vs, 1024, &length, output);
	if (gDebugLogs && output[0] != '\0') {
		printf("VS compile log: %s\n", output);
	}

	return vs;
}

GLuint createFS(const char *shaderName)
{
	string shaderSource;

	string filename(shaderName);
	if (!ReadDataFromFile(filename, shaderSource))
	{
		cout << "Cannot find file name: " + filename << endl;
		exit(-1);
	}

	#ifdef __EMSCRIPTEN__
	shaderSource = PatchShaderForWebGL(shaderSource, true);
	#endif

	GLint length = shaderSource.length();
	const GLchar *shader = (const GLchar *)shaderSource.c_str();

	GLuint fs = glCreateShader(GL_FRAGMENT_SHADER);
	glShaderSource(fs, 1, &shader, &length);
	glCompileShader(fs);

	char output[1024] = {0};
	glGetShaderInfoLog(fs, 1024, &length, output);
	if (gDebugLogs && output[0] != '\0') {
		printf("FS compile log: %s\n", output);
	}

	return fs;
}

void initBackgroundShaders() {

    // Compile the vertex shader
    GLuint vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &bgVertexShaderSrc, NULL);
    glCompileShader(vertexShader);
    checkShaderCompilation(vertexShader);

    // Compile the fragment shader
    GLuint fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &bgFragmentShaderSrc, NULL);
    glCompileShader(fragmentShader);
    checkShaderCompilation(fragmentShader);

    // Create a shader program and link shaders
    bgShaderProgram = glCreateProgram();
    glAttachShader(bgShaderProgram, vertexShader);
    glAttachShader(bgShaderProgram, fragmentShader);
    glLinkProgram(bgShaderProgram);
    checkProgramLinking(bgShaderProgram);

    validateShaderProgram(bgShaderProgram);

    // Delete shaders after linking
    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);
    glGetError();
}

void initColoredShaders() {

    // Compile the vertex shader
    GLuint vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &VertexShaderForObject, NULL);
    glCompileShader(vertexShader);
    checkShaderCompilation(vertexShader);

    // Compile the fragment shader
    GLuint fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &FragmentShaderForObject, NULL);
    glCompileShader(fragmentShader);
    checkShaderCompilation(fragmentShader);

    // Create a shader program and link shaders
    shaderProgram = glCreateProgram();
    glAttachShader(shaderProgram, vertexShader);
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);
    checkProgramLinking(bgShaderProgram);

    validateShaderProgram(shaderProgram);

    // Delete shaders after linking
    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);
    glGetError();
}

void initBackground() {

    glGenVertexArrays(1, &bgVAO);
    glGenBuffers(1, &bgVBO);
    glBindVertexArray(bgVAO);
    glBindBuffer(GL_ARRAY_BUFFER, bgVBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(bgVertices), bgVertices, GL_STATIC_DRAW);
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)(2 * sizeof(float)));
    glEnableVertexAttribArray(1);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);
    glGetError();
}


GLuint loadTexture(const char* path) {
    GLuint textureID;
    int width, height, nrChannels;
    unsigned char *data = stbi_load(path, &width, &height, &nrChannels, 0);
    if (data) {
        GLenum format;
        if (nrChannels == 1)
            format = GL_RGB;
        else if (nrChannels == 3)
            format = GL_RGB;
        else if (nrChannels == 4)
            format = GL_RGBA;

        glGenTextures(1, &textureID);
        glBindTexture(GL_TEXTURE_2D, textureID);
        glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, GL_UNSIGNED_BYTE, data);
        glGenerateMipmap(GL_TEXTURE_2D);

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

        stbi_image_free(data);
    } else {
        if (gDebugLogs) std::cout << "Failed to load texture" << std::endl;
    }
    if (gDebugLogs) std::cout << "Loaded texture: " << textureID << std::endl;
    return textureID;
}


bool ParseObj(const string &fileName, vector<Vertex> &gVertices,
vector<Texture> &gTextures,
vector<Normal> &gNormals,
vector<Face> &gFaces)
{
	fstream myfile;

	// Open the input
	myfile.open(fileName.c_str(), std::ios::in);

	if (myfile.is_open())
	{
		string curLine;

		while (getline(myfile, curLine))
		{
			stringstream str(curLine);
			GLfloat c1, c2, c3;
			GLuint index[9];
			string tmp;

			if (curLine.length() >= 2)
			{
				if (curLine[0] == 'v')
				{
					if (curLine[1] == 't') // texture
					{
						str >> tmp; // consume "vt"
						str >> c1 >> c2;
						gTextures.push_back(Texture(c1, c2));
					}
					else if (curLine[1] == 'n') // normal
					{
						str >> tmp; // consume "vn"
						str >> c1 >> c2 >> c3;
						gNormals.push_back(Normal(c1, c2, c3));
					}
					else // vertex
					{
						str >> tmp; // consume "v"
						str >> c1 >> c2 >> c3;
						gVertices.push_back(Vertex(c1, c2, c3));
					}
				}
				else if (curLine[0] == 'f') // face
				{
					str >> tmp; // consume "f"
					char c;
					int vIndex[3], nIndex[3], tIndex[3];
					str >> vIndex[0];
					str >> c >> c; // consume "//"
					str >> nIndex[0];
					str >> vIndex[1];
					str >> c >> c; // consume "//"
					str >> nIndex[1];
					str >> vIndex[2];
					str >> c >> c; // consume "//"
					str >> nIndex[2];

					assert(vIndex[0] == nIndex[0] &&
						   vIndex[1] == nIndex[1] &&
						   vIndex[2] == nIndex[2]); // a limitation for now

					// make indices start from 0
					for (int c = 0; c < 3; ++c)
					{
						vIndex[c] -= 1;
						nIndex[c] -= 1;
						tIndex[c] -= 1;
					}

					gFaces.push_back(Face(vIndex, tIndex, nIndex));
				}
				else
				{
					if (gDebugLogs) cout << "Ignoring unidentified line in obj file: " << curLine << endl;
				}
			}

			// data += curLine;
			if (!myfile.eof())
			{
				// data += "\n";
			}
		}

		myfile.close();
	}
	else
	{
		return false;
	}
	assert(gVertices.size() == gNormals.size());

	return true;
}


void initShaders()
{
	// Create the programs

	gProgram[0] = glCreateProgram();
	gProgram[1] = glCreateProgram();
	gProgram[2] = glCreateProgram();
	gProgram[3] = glCreateProgram();
	gProgram[4] = glCreateProgram();

	// Create the shaders for both programs

	GLuint vs1 = createVS("vert.glsl");
	GLuint fs1 = createFS("frag.glsl");

	GLuint vs2 = createVS("vert2.glsl");
	GLuint fs2 = createFS("frag2.glsl");

	GLuint vs3 = createVS("vert3.glsl");
	GLuint fs3 = createFS("frag3.glsl");

	GLuint vs4 = createVS("vert4.glsl");
	GLuint fs4 = createFS("frag4.glsl");


	GLuint vs5 = createVS("vert5.glsl");
	GLuint fs5 = createFS("frag5.glsl");


	// Attach the shaders to the programs

	glAttachShader(gProgram[0], vs1);
	glAttachShader(gProgram[0], fs1);

	glAttachShader(gProgram[1], vs2);
	glAttachShader(gProgram[1], fs2);

	glAttachShader(gProgram[2], vs3);
	glAttachShader(gProgram[2], fs3);

	glAttachShader(gProgram[3], vs4);
	glAttachShader(gProgram[3], fs4);

    glAttachShader(gProgram[4], vs5);
	glAttachShader(gProgram[4], fs5);
	// Link the programs

	glLinkProgram(gProgram[0]);
	GLint status;
	glGetProgramiv(gProgram[0], GL_LINK_STATUS, &status);

	if (status != GL_TRUE)
	{
		if (gDebugLogs) cout << "Program link failed" << endl;
		exit(-1);
	}

	glLinkProgram(gProgram[1]);
	glGetProgramiv(gProgram[1], GL_LINK_STATUS, &status);

	if (status != GL_TRUE)
	{
		if (gDebugLogs) cout << "Program link failed" << endl;
		exit(-1);
	}

	glLinkProgram(gProgram[2]);
	status;
	glGetProgramiv(gProgram[2], GL_LINK_STATUS, &status);

	if (status != GL_TRUE)
	{
		if (gDebugLogs) cout << "Program link failed" << endl;
		exit(-1);
	}

	glLinkProgram(gProgram[3]);
	status;
	glGetProgramiv(gProgram[3], GL_LINK_STATUS, &status);

	if (status != GL_TRUE)
	{
		if (gDebugLogs) cout << "Program link failed" << endl;
		exit(-1);
	}

	glLinkProgram(gProgram[4]);
	status;
	glGetProgramiv(gProgram[4], GL_LINK_STATUS, &status);

	if (status != GL_TRUE)
	{
		if (gDebugLogs) cout << "Program link failed" << endl;
		exit(-1);
	}


	// Get the locations of the uniform variables from both programs

	for (int i = 0; i < 5; ++i)
	{
		modelingMatrixLoc[i] = glGetUniformLocation(gProgram[i], "modelingMatrix");
		viewingMatrixLoc[i] = glGetUniformLocation(gProgram[i], "viewingMatrix");
		projectionMatrixLoc[i] = glGetUniformLocation(gProgram[i], "projectionMatrix");
		eyePosLoc[i] = glGetUniformLocation(gProgram[i], "eyePos");
	}
	glGetError();

    glDeleteShader(vs1);
    glDeleteShader(vs2);
    glDeleteShader(fs1);
    glDeleteShader(fs2);
}

void initVBO(GLuint &vao, GLuint &gVertexAttribBuffer, GLuint &gIndexBuffer, int &gVertexDataSizeInBytes, int &gNormalDataSizeInBytes, vector<Vertex> &gVertices,
vector<Texture> &gTextures,
vector<Normal> &gNormals,
vector<Face> &gFaces)
{
	glGenVertexArrays(1, &vao);
	assert(vao > 0);
	glBindVertexArray(vao);
	if (gDebugLogs) cout << "vao = " << vao << endl;

	glEnableVertexAttribArray(0);
	glEnableVertexAttribArray(1);
	assert(glGetError() == GL_NONE);

	glGenBuffers(1, &gVertexAttribBuffer);
	glGenBuffers(1, &gIndexBuffer);

	assert(gVertexAttribBuffer > 0 && gIndexBuffer > 0);

	glBindBuffer(GL_ARRAY_BUFFER, gVertexAttribBuffer);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, gIndexBuffer);

	gVertexDataSizeInBytes = gVertices.size() * 3 * sizeof(GLfloat);
	gNormalDataSizeInBytes = gNormals.size() * 3 * sizeof(GLfloat);
	int indexDataSizeInBytes = gFaces.size() * 3 * sizeof(GLuint);
	GLfloat *vertexData = new GLfloat[gVertices.size() * 3];
	GLfloat *normalData = new GLfloat[gNormals.size() * 3];
	GLuint *indexData = new GLuint[gFaces.size() * 3];

	float minX = 1e6, maxX = -1e6;
	float minY = 1e6, maxY = -1e6;
	float minZ = 1e6, maxZ = -1e6;

	for (int i = 0; i < gVertices.size(); ++i)
	{
		vertexData[3 * i] = gVertices[i].x;
		vertexData[3 * i + 1] = gVertices[i].y;
		vertexData[3 * i + 2] = gVertices[i].z;

		minX = std::min(minX, gVertices[i].x);
		maxX = std::max(maxX, gVertices[i].x);
		minY = std::min(minY, gVertices[i].y);
		maxY = std::max(maxY, gVertices[i].y);
		minZ = std::min(minZ, gVertices[i].z);
		maxZ = std::max(maxZ, gVertices[i].z);
	}

	if (gDebugLogs) {
		std::cout << "minX = " << minX << std::endl;
		std::cout << "maxX = " << maxX << std::endl;
		std::cout << "minY = " << minY << std::endl;
		std::cout << "maxY = " << maxY << std::endl;
		std::cout << "minZ = " << minZ << std::endl;
		std::cout << "maxZ = " << maxZ << std::endl;
	}

	for (int i = 0; i < gNormals.size(); ++i)
	{
		normalData[3 * i] = gNormals[i].x;
		normalData[3 * i + 1] = gNormals[i].y;
		normalData[3 * i + 2] = gNormals[i].z;
	}

	for (int i = 0; i < gFaces.size(); ++i)
	{
		indexData[3 * i] = gFaces[i].vIndex[0];
		indexData[3 * i + 1] = gFaces[i].vIndex[1];
		indexData[3 * i + 2] = gFaces[i].vIndex[2];
	}

	glBufferData(GL_ARRAY_BUFFER, gVertexDataSizeInBytes + gNormalDataSizeInBytes, 0, GL_STATIC_DRAW);
	glBufferSubData(GL_ARRAY_BUFFER, 0, gVertexDataSizeInBytes, vertexData);
	glBufferSubData(GL_ARRAY_BUFFER, gVertexDataSizeInBytes, gNormalDataSizeInBytes, normalData);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, indexDataSizeInBytes, indexData, GL_STATIC_DRAW);

	// done copying to GPU memory; can free now from CPU memory
	delete[] vertexData;
	delete[] normalData;
	delete[] indexData;

	glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, 0);
	glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, BUFFER_OFFSET(gVertexDataSizeInBytes));
}


void init()
{

    ParseObj("bunny.obj", gVertices,gTextures,gNormals,gFaces);
    glEnable(GL_DEPTH_TEST);

    initVBO(vao, gVertexAttribBuffer, gIndexBuffer, gVertexDataSizeInBytes,gNormalDataSizeInBytes, gVertices,gTextures,gNormals,gFaces);
    glDisable(GL_DEPTH_TEST);

    ParseObj("cube.obj", gVertices2,gTextures2,gNormals2,gFaces2);
    glEnable(GL_DEPTH_TEST);
    initVBO(vao2,gVertexAttribBuffer2, gIndexBuffer2,gVertexDataSizeInBytes2,gNormalDataSizeInBytes2, gVertices2,gTextures2,gNormals2,gFaces2);

    initBackground();        // Initialize background VAO/VBO
    initBackgroundShaders(); // Initialize background shaders
    initShaders();
    glGetError();
}

void drawModel() {

    glBindVertexArray(gVertexAttribBuffer);
    glBindBuffer(GL_ARRAY_BUFFER, gVertexAttribBuffer);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, gIndexBuffer);

    glEnableVertexAttribArray(0);
    glEnableVertexAttribArray(1);

    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, 0);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, BUFFER_OFFSET(gVertexDataSizeInBytes));

    glDrawElements(GL_TRIANGLES, gFaces.size() * 3, GL_UNSIGNED_INT, 0);
    glGetError();
}

void drawModel2() {

    glBindVertexArray(gVertexAttribBuffer2);
    glBindBuffer(GL_ARRAY_BUFFER, gVertexAttribBuffer2);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, gIndexBuffer2);

    glEnableVertexAttribArray(0);
    glEnableVertexAttribArray(1);

    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, 0);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, BUFFER_OFFSET(gVertexDataSizeInBytes2));

    glDrawElements(GL_TRIANGLES, gFaces2.size() * 3, GL_UNSIGNED_INT, 0);
    glGetError();
}


void display()
{
	glClearColor(0, 0, 0, 1);
	#ifdef __EMSCRIPTEN__
	glClearDepthf(1.0f);
	#else
	glClearDepth(1.0f);
	#endif
	glClearStencil(0);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);

    string here="up";
    checkGLError(here);
    glDisable(GL_DEPTH_TEST);  // Disable depth test for background

    // Draw background
    if (bgShaderProgram != 0) {
        glUseProgram(bgShaderProgram);
        here="Shader";
        checkGLError(here);

        if (bgVAO != 0) {
            glBindVertexArray(bgVAO);
            here="VAO";
            checkGLError(here);
        }

        if (bgTexture != 0) {
            glActiveTexture(GL_TEXTURE0);
            glBindTexture(GL_TEXTURE_2D, bgTexture);
            GLint bgTextureLocation = glGetUniformLocation(bgShaderProgram, "bgTexture");
            if (bgTextureLocation >= 0) {
                glUniform1i(bgTextureLocation, 0);
                here="TextureLocation";
                checkGLError(here);
            }
        }

        glDrawArrays(GL_TRIANGLES, 0, 6);
        here="DrawArrays";
        checkGLError(here);

        glBindVertexArray(0);
        here="BindVertex";
        checkGLError(here);
    }

	static float angle = 0;
	float angleRad = (float)(angle / 180.0) * M_PI;

	// Compute the modeling matrix
	glm::mat4 matT = glm::translate(glm::mat4(1.0), glm::vec3(translationX+1, jumpHeight+4.5, -3));   //(x,y,z)
	glm::mat4 matS = glm::scale(glm::mat4(1.0), glm::vec3(0.4, 0.4, 0.4));
    glm::mat4 matT2 = glm::translate(glm::mat4(1.0), glm::vec3(translationX, 10, -10.f));
    glm::mat4 matR = glm::rotate<float>(glm::mat4(1.0), (rotateX / 180.) * M_PI, glm::vec3(0.0, 1.0, 0.0));
    glm::mat4 matZ = glm::rotate<float>(glm::mat4(1.0), (rotateZ / 180.) * M_PI, glm::vec3(1.0, 0.0, 0.0));
	modelingMatrix = matT *matS* matR*matZ;
    glUseProgram(gProgram[0]);
    glEnable(GL_DEPTH_TEST);
    glUseProgram(gProgram[activeProgramIndex]);
    checkGLError("End of 3D_1");
    glUniformMatrix4fv(projectionMatrixLoc[activeProgramIndex], 1, GL_FALSE, glm::value_ptr(projectionMatrix));
    checkGLError("End of 3D_2");
    glUniformMatrix4fv(viewingMatrixLoc[activeProgramIndex], 1, GL_FALSE, glm::value_ptr(viewingMatrix));
    checkGLError("End of 3D_3");
    glUniformMatrix4fv(modelingMatrixLoc[activeProgramIndex], 1, GL_FALSE, glm::value_ptr(modelingMatrix));
    checkGLError("End of 3D_4");
    glUniform3fv(eyePosLoc[activeProgramIndex], 1, glm::value_ptr(eyePos));
    checkGLError("End of 3D_5");
    drawModel();
    checkGLError("End of 3D_6");
    activeProgramIndex=2;


    for(int i=0;i<4;i++){
        if(activeProgramIndex>=2)
            {
                activeProgramIndex=1;
            }
            else if(activeProgramIndex==1)
            {
                activeProgramIndex=2;
            }

        for(int j=-1;j<30;j++){
            if(j!=-1){
                glUseProgram(gProgram[activeProgramIndex]);
                matT2 = glm::translate(glm::mat4(1.0), glm::vec3(-3 + i * 2, -3, -60 + fmod( 2 * j + roadVelocity, 60.0f) ));

                modelingMatrix2= matT2 ;
                checkGLError("End of 3D_1");
                glUniformMatrix4fv(projectionMatrixLoc[activeProgramIndex], 1, GL_FALSE, glm::value_ptr(projectionMatrix));
                checkGLError("End of 3D_2");
                glUniformMatrix4fv(viewingMatrixLoc[activeProgramIndex], 1, GL_FALSE, glm::value_ptr(viewingMatrix));
                checkGLError("End of 3D_3");
                glUniformMatrix4fv(modelingMatrixLoc[activeProgramIndex], 1, GL_FALSE, glm::value_ptr(modelingMatrix2));
                checkGLError("End of 3D_4");
                glUniform3fv(eyePosLoc[activeProgramIndex], 1, glm::value_ptr(eyePos));
                checkGLError("End of 3D_5");
                drawModel2();
                checkGLError("End of 3D_6");

                if(i<3 && (j==15)){


                    if(obstacleIndex==i){
                        glUseProgram(gProgram[4]);
                        matT2 = glm::translate(glm::mat4(1.0), glm::vec3(-3 + i * 3, -1.5, -60 + fmod( 2 * j + roadVelocity, 60.0f) ));
                        glm::mat4 matS = glm::scale(glm::mat4(1.0), glm::vec3(0.4, 1.10, 0.5));
                        modelingMatrix2= matT2 *matS;
                        checkGLError("End of 3D_1");
                        glUniformMatrix4fv(projectionMatrixLoc[4], 1, GL_FALSE, glm::value_ptr(projectionMatrix));
                        checkGLError("End of 3D_2");
                        glUniformMatrix4fv(viewingMatrixLoc[4], 1, GL_FALSE, glm::value_ptr(viewingMatrix));
                        checkGLError("End of 3D_3");
                        glUniformMatrix4fv(modelingMatrixLoc[4], 1, GL_FALSE, glm::value_ptr(modelingMatrix2));
                        checkGLError("End of 3D_4");
                        glUniform3fv(eyePosLoc[4], 1, glm::value_ptr(eyePos));
                        checkGLError("End of 3D_5");
                        drawModel2();
                        checkGLError("End of 3D_6");

                        float z1 = modelingMatrix[3][2];
                        float z2 = modelingMatrix2[3][2];
                        float y1 = modelingMatrix[3][0];
                        float y2 = modelingMatrix2[3][0];
                        if (z2 - 1 <= z1 && z1 <= z2 + 1 && y2 - 1 <= y1 && y1 <= y2 + 1) {
                            isLoop = true;
                            score+=200;
                        }
                    }
                    else{glUseProgram(gProgram[3]);
                        if(gamefinish==0 || variable!=i){
                            matT2 = glm::translate(glm::mat4(1.0), glm::vec3(-3 + i * 3, -1.5, -60 + fmod( 2 * j + roadVelocity, 60.0f) ));
                            glm::mat4 matS = glm::scale(glm::mat4(1.0), glm::vec3(0.4, 1.10, 0.5));
                            modelingMatrix2= matT2 *matS;
                            checkGLError("End of 3D_1");
                            glUniformMatrix4fv(projectionMatrixLoc[3], 1, GL_FALSE, glm::value_ptr(projectionMatrix));
                            checkGLError("End of 3D_2");
                            glUniformMatrix4fv(viewingMatrixLoc[3], 1, GL_FALSE, glm::value_ptr(viewingMatrix));
                            checkGLError("End of 3D_3");
                            glUniformMatrix4fv(modelingMatrixLoc[3], 1, GL_FALSE, glm::value_ptr(modelingMatrix2));
                            checkGLError("End of 3D_4");
                            glUniform3fv(eyePosLoc[3], 1, glm::value_ptr(eyePos));
                            checkGLError("End of 3D_5");
                            drawModel2();
                            checkGLError("End of 3D_6");


                        }
                        float z1 = modelingMatrix[3][2];
                        float z2 = modelingMatrix2[3][2];
                        float y1 = modelingMatrix[3][0];
                        float y2 = modelingMatrix2[3][0];
                        if (z2 - 0.5 <= z1 && z1 <= z2 + 0.5 && y2 - 0.5 <= y1 && y1 <= y2 + 0.5) {
                            gamefinish+=1;
                            if(gamefinish==1){
                                variable=i;
                            }
                        }}
                }
                if(activeProgramIndex>=2)
                {
                    activeProgramIndex=1;
                }
                else if(activeProgramIndex==1)
                {
                    activeProgramIndex=2;
                }



            }
            else{
                if(-60 + fmod( -2 + roadVelocity, 60.0f)<-31.0 && -60 + fmod( -2 + roadVelocity, 60.0f)>-32){obstacleIndex = rand() % 3;}
            }
        }
    }
    if(gamefinish==0){
        score++;
        roadVelocity+=(score/2500+1)*0.00009f*1000 ;
        jumpVelocity -= 0.00003f;
        if(jumpHeight <= -6.2f)
        up_down=true;
        else if(jumpHeight > -5.6f)
            up_down=false;

        if (isAPressed) {
            // Translate left
            translationX -= speed; // speed is a constant or variable determining movement speed
        }
        if (isDPressed) {
            // Translate right
            translationX += speed ;
        }
        if(up_down==true) //Eðer yukarý dooðru çýkýyorsa.
            jumpHeight -= jumpVelocity;
        else if(up_down==false) //Eðer aþaðý iniyorsa.
            jumpHeight += jumpVelocity;
        translationX = std::max(leftBound, std::min(translationX, rightBound));
        angle += 0.9;

        if(isxPressed)
        {
            isLoop=true;
        }
        if(isLoop)
        {
            rotateX +=rotate_velocity;

        }
        if(rotateX>270)
        {
            rotateX=-90;
            isLoop=false;

        }
    }
    else
    {
        jumpHeight=-6.2f;
        rotateZ =-90;
    }

    if (gDebugLogs) std::cerr << score << std::endl;
    activeProgramIndex=0;
    glBindVertexArray(0);
    checkGLError("End of display");

}

void reshape(GLFWwindow *window, int w, int h)
{
	w = w < 1 ? 1 : w;
	h = h < 1 ? 1 : h;

	gWidth = w;
	gHeight = h;

	glViewport(0, 0, w, h);

	// Use perspective projection
	float fovyRad = (float)(90.0 / 180.0) * M_PI;
	projectionMatrix = glm::perspective(fovyRad , w / (float)h, 1.0f, 100.0f);

	// Assume default camera position and orientation (camera is at
	// (0, 0, 0) with looking at -z direction and its up vector pointing
	// at +y direction)
	//
	// viewingMatrix = glm::mat4(1);
	viewingMatrix = glm::lookAt(glm::vec3(0, 0, 0), glm::vec3(0, 0, 0) + glm::vec3(0, 0, -1), glm::vec3(0, 1, 0));
}
void framebuffer_size_callback(GLFWwindow* window, int width, int height) {
    // Adjust the viewport when the window size changes
    glViewport(0, 0, width, height);
}

void cursor_position_callback(GLFWwindow* window, double xpos, double ypos)
{
    if (!useMouseControls || gWidth <= 0) return;
    const float t = static_cast<float>(xpos) / static_cast<float>(gWidth);
    const float mapped = leftBound + t * (rightBound - leftBound);
    translationX = clampf(mapped, leftBound, rightBound);
}
void keyboard(GLFWwindow *window, int key, int scancode, int action, int mods)
{
	if (gDebugLogs) cout << translationX;

	if (key == GLFW_KEY_A )
	{   isAPressed = (action == GLFW_PRESS || action == GLFW_REPEAT);
	}
	else if (key == GLFW_KEY_D )
	{   isDPressed = (action == GLFW_PRESS || action == GLFW_REPEAT);
	}
	else if (key == GLFW_KEY_X )
	{   isxPressed = (action == GLFW_PRESS || action == GLFW_REPEAT);
	}
	else if (key == GLFW_KEY_R )
	{
        obstacleIndex = rand() % 3;
	    score=0;
	    gamefinish=0;
	    gWidth, gHeight;
        leftBound= -4.5f;
        rightBound= 3.0f;
        translationX = -0.9f; // Initialize it to 0.0 initially
        rotateX = -90;	   // Initialize it to 0.0 initially
        rotateZ = 0;	   // Initialize it to 0.0 initially
        speed= 0.45f;
        isJumping = false;
        up_down= true;
        isAPressed = false;
        isDPressed = false;
        isxPressed=false;
        jumpHeight = -6.2f; // Adjust the jump height as needed
        jumpVelocity = -0.045f;
        roadVelocity = +0.4f;
	}
}

int main(int argc, char **argv)
{

	GLFWwindow *window;
	if (!glfwInit())
	{
		exit(EXIT_FAILURE);
	}
	glfwSetErrorCallback([](int error, const char *description)
						 { if (gDebugLogs) fprintf(stderr, "Error: %s\n", description); });

	#ifdef __EMSCRIPTEN__
	glfwWindowHint(GLFW_CLIENT_API, GLFW_OPENGL_ES_API);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);
	#else
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
	glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE); // This line is necessary for macOS
	#endif

	int width = 1000, height = 800;
	window = glfwCreateWindow(width, height, "Simple Example", NULL, NULL);
    glViewport(0, 0, width, height);
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);

    int channels;
    unsigned char* imgData = stbi_load("sky.jpg", &width, &height, &channels, 0);
    if (!imgData) {
        if (gDebugLogs) std::cerr << "Failed to load image" << std::endl;
        return -1;
    }

	if (!window)
	{   if (gDebugLogs) std::cerr << "Failed to create GLFW window" << std::endl;
		glfwTerminate();
		exit(EXIT_FAILURE);
	}

	glfwMakeContextCurrent(window);
	glfwSwapInterval(1);

	#ifndef __EMSCRIPTEN__
	// Initialize GLEW to setup the OpenGL Function pointers
	glewExperimental = GL_TRUE; // Needed in core profile
	if (GLEW_OK != glewInit())
	{
		if (gDebugLogs) std::cout << "Failed to initialize GLEW" << std::endl;
		return EXIT_FAILURE;
	}
	#endif
    stbi_set_flip_vertically_on_load(true);
    // After initializing GLFW and GLEW
    bgTexture = loadTexture("sky.jpg");

    if (bgTexture == 0) {
        if (gDebugLogs) std::cerr << "Failed to load background texture." << std::endl;
        return -1;
    }

	char rendererInfo[512] = {0};
    std::vector<GLfloat> vertices;
    std::vector<GLfloat> colors;
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            int i = (x + y * width) * channels;
            float r = imgData[i] / 255.0f;
            float g = imgData[i + 1] / 255.0f;
            float b = imgData[i + 2] / 255.0f;

            vertices.push_back(x * 2.0f / width - 1);   // X
            vertices.push_back(1 - y * 2.0f / height);  // Y (flipped)

            colors.push_back(r);  // R
            colors.push_back(g);  // G
            colors.push_back(b);  // B
        }
    }

    stbi_image_free(imgData);

    // Generate and bind VAO and VBOs
    GLuint VAO, VBO_vertices, VBO_colors;
    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO_vertices);
    glGenBuffers(1, &VBO_colors);

    glBindVertexArray(VAO);

    glBindBuffer(GL_ARRAY_BUFFER, VBO_vertices);
    glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizeof(GLfloat), vertices.data(), GL_STATIC_DRAW);
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 0, (void*)0);
    glEnableVertexAttribArray(0);

    glBindBuffer(GL_ARRAY_BUFFER, VBO_colors);
    glBufferData(GL_ARRAY_BUFFER, colors.size() * sizeof(GLfloat), colors.data(), GL_STATIC_DRAW);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, (void*)0);
    glEnableVertexAttribArray(1);

    glBindVertexArray(0);
	snprintf(rendererInfo, sizeof(rendererInfo), "%s - %s", glGetString(GL_RENDERER), glGetString(GL_VERSION));
	glfwSetWindowTitle(window, rendererInfo);

    init();

    glfwSetKeyCallback(window, keyboard);
    glfwSetCursorPosCallback(window, cursor_position_callback);
    glfwSetWindowSizeCallback(window, reshape);
	reshape(window, width, height); // Set up viewport and projection

    checkGLError("inMain");

	#ifdef __EMSCRIPTEN__
	struct LoopState {
		GLFWwindow *window;
	};
	static LoopState state;
	state.window = window;
	emscripten_set_main_loop_arg(
		[](void *arg)
		{
			LoopState *s = reinterpret_cast<LoopState *>(arg);
			display();
			glfwSwapBuffers(s->window);
			glfwPollEvents();
			if (glfwWindowShouldClose(s->window))
			{
				emscripten_cancel_main_loop();
			}
		},
		&state,
		0,
		true);
	return 0;
	#else
	while (!glfwWindowShouldClose(window))
	{

        display();
        glfwSwapBuffers(window);
		glfwPollEvents();

	}
	glfwDestroyWindow(window);
	glfwTerminate();

	return 0;
	#endif
}
