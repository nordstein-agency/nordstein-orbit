"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrbitRole } from "@/hooks/useOrbitRole";


const items = [
  { href: "/academy", label: "Dashboard", short: "D" },
  { href: "/academy/my-courses", label: "Meine Kurse", short: "M" },
  { href: "/academy/category/entry", label: "Entry", short: "E" },
  { href: "/academy/category/growth", label: "Growth", short: "G" },
  { href: "/academy/category/leader", label: "Leader", short: "L" },
  { href: "/academy/certificates", label: "Zertifikate", short: "Z" },
  
];

const adminItems = [
  { href: "/admin/academy", label: "Admin", short: "A" },
];


export function AcademySidebar() {
  const pathname = usePathname();
  const role = useOrbitRole();


  return (
    <aside
      className="
        group
        fixed top-0 left-0
        h-screen
        w-16 hover:w-60
        bg-black/30
        backdrop-blur-xl
        border-r border-white/10
        shadow-[4px_0_25px_rgba(150,80,140,0.25)]
        transition-all duration-300
        overflow-hidden
        flex flex-col
        z-30
        pt-20   /* Abstand zur Navbar */
      "
    >
      {/* LOGO AREA */}
      <div className="px-4 flex items-center gap-3 mb-8">
        <div
          className="
            h-10 w-10 rounded-2xl 
            bg-gradient-to-br from-[#d8a5d0] to-[#a75692]
            shadow-[0_0_20px_#a7569255]
            flex items-center justify-center text-black 
            font-bold text-lg
          "
        >
          OA
        </div>

        {/* Expandable Text */}
        <div
          className="
            opacity-0 group-hover:opacity-100 
            max-w-0 group-hover:max-w-[160px]
            transition-all duration-300
            overflow-hidden
          "
        >
          <div className="text-sm font-semibold text-white leading-tight">
            Orbit Academy
          </div>
          <div className="text-[11px] text-gray-400">
            Learn • Grow • Lead
          </div>
        </div>
      </div>

      {/* NAVIGATION — jetzt stabil */}
      <nav className="flex flex-col gap-2 px-2">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 
                px-3 py-2 rounded-xl text-sm
                transition-all duration-200
                ${active
                  ? "bg-[#d8a5d0]/20 text-white border border-[#d8a5d0]/40 shadow-[0_0_15px_#a7569255]"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
                }
              `}
            >
              {/* ICON */}
              <div
                className={`
                  h-7 w-7 rounded-xl flex items-center justify-center 
                  text-xs font-semibold shrink-0
                  ${active
                    ? "bg-gradient-to-br from-[#d8a5d0] to-[#a75692] text-black"
                    : "bg-white/5 text-gray-200"
                  }
                `}
              >
                {item.short}
              </div>

              {/* LABEL */}
              <span
                className="
                  opacity-0 group-hover:opacity-100 
                  max-w-0 group-hover:max-w-[150px]
                  transition-all duration-300
                  overflow-hidden whitespace-nowrap
                "
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>





      {role === "Geschäftsführung" && (
  <>
    <div className="border-t border-white/10 my-3 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

    <nav className="flex flex-col gap-2 px-2">
      {adminItems.map((item) => {
        const active =
          pathname === item.href ||
          pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 
              px-3 py-2 rounded-xl text-sm
              transition-all duration-200
              ${active
                ? "bg-[#d8a5d0]/20 text-white border border-[#d8a5d0]/40 shadow-[0_0_15px_#a7569255]"
                : "text-gray-400 hover:text-white hover:bg-white/10"
              }
            `}
          >
            <div
              className={`
                h-7 w-7 rounded-xl flex items-center justify-center 
                text-xs font-semibold shrink-0
                ${active
                  ? "bg-gradient-to-br from-[#d8a5d0] to-[#a75692] text-black"
                  : "bg-white/5 text-gray-200"
                }
              `}
            >
              {item.short}
            </div>

            <span
              className="
                opacity-0 group-hover:opacity-100 
                max-w-0 group-hover:max-w-[150px]
                transition-all duration-300
                overflow-hidden whitespace-nowrap
              "
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  </>
)}


      {/* FOOTER */}
      <div className="flex-1" />
      <div className="px-4 pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs text-gray-500">
        v1.0 — Orbit Academy
      </div>
    </aside>
  );
}
