import React, { FC } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

type Props = {
  exit?: boolean;
};

const Navbar: FC<Props> = ({ exit = false }) => {
  return (
    <nav className="flex justify-between w-full py-6 lg:px-24 px-1">
      <Image
        alt="logo"
        width={1200}
        height={1200}
        className="lg:w-24 w-16  object-cover"
        src="/images/logo.png"
      />
      {!exit ? (
        <Link
          href="/dashboard"
          className="py-3 px-4 cursor-pointer p-4 text-white flex my-auto rounded-md space-x-3  bg-gradient-to-tr from-primary to-third"
        >
          <User size={"16"} />
          <p className="text-sm font-bold">Dashboard</p>
        </Link>
      ) : (
        <Link
          href="/"
          className="py-3 px-6 cursor-pointer p-4 text-white flex my-auto rounded-md space-x-3   bg-third"
        >
          <LogOut size={"16"} />
          <p className=" font-bold text-sm">Sortir</p>
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
