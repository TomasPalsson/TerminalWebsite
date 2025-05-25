import React from "react";
import { Link } from "react-router";

type MainButtonProps = {
  children: React.ReactNode;
  link: string;
};

export function MainButton({ children, link }: MainButtonProps) {
  return (
    <Link to={link}>
<button className="inline-flex items-center gap-2 px-4 py-2 font-mono text-sm transition rounded-sm sm:text-base text-terminal hover:bg-green-600 hover:text-black">

        {children}
      </button>
    </Link>
  )
}
