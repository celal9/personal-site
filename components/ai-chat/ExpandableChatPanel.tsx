 "use client";
 
 import * as React from "react";
 import { ChevronRight, Maximize2, Minimize2, X } from "lucide-react";
 
 type ShortcutLink = {
   id: string;
   label: string;
   href: string;
 };
 
 type Props = {
   isOpen: boolean;
   onClose: () => void;
   title?: string;
   shortcuts?: ShortcutLink[];
  sidebarTitle?: string;
  sidebarContent?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
 };
 
 export default function ExpandableChatPanel({
   isOpen,
   onClose,
   title = "AI Assistant",
   shortcuts = [],
  sidebarTitle = "Kisayollar",
  sidebarContent,
  body,
  footer,
 }: Props) {
   const [isExpanded, setIsExpanded] = React.useState(false);
   const containerRef = React.useRef<HTMLDivElement | null>(null);
 
   React.useEffect(() => {
     if (!isOpen) setIsExpanded(false);
   }, [isOpen]);
 
   if (!isOpen) return null;
 
  const containerClassName = [
    "fixed z-9999 flex flex-col overflow-hidden shadow-2xl transition-all duration-500",
    isExpanded
      ? "inset-0 w-screen h-screen max-h-screen rounded-none flex flex-row!"
      : "bottom-6 right-6 h-full max-h-[70vh] w-[420px] rounded-2xl max-sm:bottom-3 max-sm:right-3 max-sm:max-h-[60vh] max-sm:w-[92vw]",
    "border border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/10",
  ].join(" ");

   return (
     <div
       ref={containerRef}
       role="dialog"
       aria-label={title}
      className={containerClassName}
     >
       {isExpanded ? (
        <aside className="h-full w-[320px] shrink-0 border-r border-black/10 bg-white/60 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">
              {sidebarTitle}
            </div>
             <button
               type="button"
               onClick={() => setIsExpanded(false)}
              className="rounded-full p-1 text-zinc-600 transition hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10"
               aria-label="Kisayollari kapat"
             >
               <Minimize2 size={18} />
             </button>
           </div>
          <div className="flex flex-col gap-2 px-4 pb-4">
            {sidebarContent ? (
              sidebarContent
            ) : shortcuts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-black/10 bg-white/70 p-3 text-xs text-zinc-500 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-zinc-300">
                Kisayollar burada listelenecek.
              </div>
            ) : (
              shortcuts.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-xs text-zinc-700 backdrop-blur transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/20"
                >
                  <span className="truncate">{item.label}</span>
                  <ChevronRight size={16} />
                </a>
              ))
            )}
           </div>
         </aside>
       ) : null}
 
       <div className="flex h-full w-full flex-col">
        <header className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
          <div className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</div>
           <div className="flex items-center gap-2">
             <button
               type="button"
               onClick={() => setIsExpanded((prev) => !prev)}
              className="rounded-full p-1 text-zinc-600 transition hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10"
               aria-label={isExpanded ? "Paneli kucult" : "Paneli genislet"}
             >
               {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
             </button>
             <button
               type="button"
               onClick={onClose}
              className="rounded-full p-1 text-zinc-600 transition hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10"
               aria-label="Paneli kapat"
             >
               <X size={18} />
             </button>
           </div>
         </header>
 
        <div className="flex-1 overflow-y-auto px-4 py-4 text-sm text-zinc-700 dark:text-zinc-200">
          {body ?? (
            <div className="rounded-lg border border-dashed border-black/10 bg-white/70 p-4 text-xs text-zinc-500 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-zinc-300">
              Sohbet icerigi burada olacak. (Placeholder)
            </div>
          )}
         </div>
 
        <footer className="border-t border-black/10 px-4 py-3 dark:border-white/10">
          {footer ?? (
            <div className="flex items-center gap-2">
              <input
                placeholder="Mesaj yaz..."
                className="h-10 flex-1 rounded-lg border border-black/10 bg-white/70 px-3 text-sm outline-none backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white"
              />
              <button
                type="button"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-white/90"
              >
                Gonder
              </button>
            </div>
          )}
         </footer>
       </div>
     </div>
   );
 }
