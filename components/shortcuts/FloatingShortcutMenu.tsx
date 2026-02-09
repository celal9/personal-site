 "use client";
 
 import * as React from "react";
 import { ChevronRight, Menu, X } from "lucide-react";
 
 type ShortcutItem = {
   id: string;
   label: string;
   description?: string;
   href: string;
 };
 
 type Props = {
   items: ShortcutItem[];
   title?: string;
 };
 
 export default function FloatingShortcutMenu({
   items,
   title = "Kisayollar",
 }: Props) {
   const [isOpen, setIsOpen] = React.useState(false);
 
   if (items.length === 0) return null;
 
   return (
     <>
       <button
         type="button"
         onClick={() => setIsOpen(true)}
         aria-label="Kisayol menusunu ac"
         className="fixed bottom-6 right-6 z-9999 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-semibold text-zinc-700 shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200"
       >
         <Menu size={16} />
         Kisayollar
       </button>
 
       {isOpen ? (
         <div className="fixed inset-0 z-9999 flex items-end justify-end bg-black/40 p-4 sm:p-6">
           <aside className="w-full max-w-sm rounded-2xl border border-black/10 bg-white/90 p-4 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-white/10">
             <div className="flex items-center justify-between">
               <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                 {title}
               </div>
               <button
                 type="button"
                 onClick={() => setIsOpen(false)}
                 aria-label="Kisayol menusunu kapat"
                 className="rounded-full p-1 text-zinc-600 transition hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10"
               >
                 <X size={18} />
               </button>
             </div>
 
             <div className="mt-3 flex flex-col gap-2">
               {items.map((item) => (
                 <a
                   key={item.id}
                   href={item.href}
                   onClick={() => setIsOpen(false)}
                   className="group flex items-center justify-between rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-xs text-zinc-700 backdrop-blur transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/20"
                 >
                   <div className="min-w-0">
                     <div className="truncate font-medium text-zinc-900 dark:text-white">
                       {item.label}
                     </div>
                     {item.description ? (
                       <div className="mt-1 truncate text-[11px] text-zinc-500 dark:text-zinc-300">
                         {item.description}
                       </div>
                     ) : null}
                   </div>
                   <ChevronRight size={16} className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200" />
                 </a>
               ))}
             </div>
           </aside>
         </div>
       ) : null}
     </>
   );
 }
