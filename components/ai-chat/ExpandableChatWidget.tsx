 "use client";
 
 import * as React from "react";
 import { MessageCircle } from "lucide-react";
 import ExpandableChatPanel from "./ExpandableChatPanel";
 
 type ShortcutLink = {
   id: string;
   label: string;
   href: string;
 };
 
 type Props = {
   title?: string;
   shortcuts?: ShortcutLink[];
   sidebarTitle?: string;
   sidebarContent?: React.ReactNode;
   body?: React.ReactNode;
   footer?: React.ReactNode;
 };
 
 export default function ExpandableChatWidget({
   title,
   shortcuts,
   sidebarTitle,
   sidebarContent,
   body,
   footer,
 }: Props) {
   const [isOpen, setIsOpen] = React.useState(false);
 
   return (
     <>
       <button
         type="button"
         onClick={() => setIsOpen(true)}
         aria-label="Sohbeti ac"
         className="fixed bottom-6 right-6 z-9999 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-semibold text-zinc-700 shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200"
         data-ai-chat-launcher
       >
         <MessageCircle size={16} />
         Sohbet
       </button>
       <ExpandableChatPanel
         isOpen={isOpen}
         onClose={() => setIsOpen(false)}
         title={title}
         shortcuts={shortcuts}
         sidebarTitle={sidebarTitle}
         sidebarContent={sidebarContent}
         body={body}
         footer={footer}
       />
     </>
   );
 }
