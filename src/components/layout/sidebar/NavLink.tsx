import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  icon: JSX.Element;
  lbl: string;
  href: string;
}

const NavLink: FC<NavLinkProps> = ({ icon, lbl, href }) => {
  const pathname = usePathname();

  // Extracting the last word of href
  const lastWord = href.slice(href.lastIndexOf("/") + 1);

  // Checking the conditions
  const isActive =
    pathname === href || pathname.toLowerCase().includes(lastWord);

  return (
    <Link href={href} className="flex w-full">
      <div
        className={`w-full  flex items-center duration-300 space-x-3 hover:text-[#4540e1] p-2 rounded-lg overflow-hidden hover:bg-[#4540e133] ${
          isActive && "text-[#4540e1] bg-[#4540e133] text-base font-medium"
        }`}
      >
        <div className="icon flex items-start justify-center">{icon}</div>
        <div>{lbl}</div>
      </div>
    </Link>
  );
};

export default NavLink;
