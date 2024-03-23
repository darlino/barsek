import Navbar from "@/components/layouts/Navbar";
import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const DashboardLayout = (props: Props) => {
  return (
    <section className="bg-slate-50 min-h-screen flex flex-col space-y-2 mx-auto overflow-y-scroll">
      <Navbar exit={true} />
      {props.children}
    </section>
  );
};

export default DashboardLayout;
