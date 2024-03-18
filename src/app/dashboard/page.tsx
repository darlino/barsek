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
      <div className="bg-white shadow-md rounded-md p-4 flex justify-between">
        {isLoaded ? (
          <div className="flex space-x-3">
            <UserButton />
            <div className="my-auto flex-col">
              <p className="text-slate-80 text-sm font-bold">
                {user?.fullName}
              </p>
              <p className="text-slate-80 text-xs opacity-70 ">
                {user?.primaryEmailAddress?.toString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        )}
      </div>
      <div className="bg-white shadow-md flex p-4 rounded-md">
        <Dropzone />
      </div>
    </div>
  );
};

export default DashboardPage;
