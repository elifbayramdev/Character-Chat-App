'use client';
import Link from "next/link";
import { MessageCircle, Home, BotIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    // { href: "/", label: "Home", icon: Home },
    { href: "/chat", label: "Chats", icon: MessageCircle },
    { href: "/characters", label: "Characters", icon: BotIcon },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[95%]  bg-[#A3485A] rounded-3xl shadow-2xl flex justify-around items-center p-3 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all ${
              isActive
                ? "text-[#F5DAA7] bg-main-500/20 rounded-xl p-2"
                : "text-[#662222] hover:text-[#F5DAA7] hover:bg-white/10 rounded-xl p-2"
            }`}
          >
            <Icon size={28} />
            <span className="text-xs font-medium mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
