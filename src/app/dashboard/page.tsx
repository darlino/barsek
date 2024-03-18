/* eslint-disable react/no-unescaped-entities */
"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { UserButton, useUser } from "@clerk/nextjs";
import { useDropzone } from "react-dropzone";
import React from "react";
import Dropzone from "./_/dropzone";

type Props = {};

const DashboardPage = (props: Props) => {
  const { isLoaded, user } = useUser();

  return (
    <div className="bg-slate-50   lg:w-2/3 w-full lg:p-8 p-8 mx-auto flex flex-col space-y-6">
      <div className="bg-white shadow-md flex p-4 rounded-md">
        <Dropzone />
      </div>
    </div>
  );
};

export default DashboardPage;
