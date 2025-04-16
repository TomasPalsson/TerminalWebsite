import React from "react";
import { Link } from "react-router";

type MainButtonProps = {
  children: React.ReactNode;
  link: string;
};

export function MainButton({ children, link }: MainButtonProps) {
  return (
    <Link to={link}>
<button className="px-4 py-1 text-terminal hover:bg-green-600 hover:text-black transition font-mono text-base rounded-sm inline-flex items-center gap-2">
        {children}
      </button>
    </Link>
  )
}
