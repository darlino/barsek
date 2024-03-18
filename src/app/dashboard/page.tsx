/* eslint-disable react/no-unescaped-entities */
"use client";
import Dropzone from "./_/dropzone";

type Props = {};

const DashboardPage = (props: Props) => {
  return (
    <div className="bg-slate-50   lg:w-2/3 w-full lg:p-8 p-8 mx-auto flex flex-col space-y-6">
      <div className="bg-white shadow-md flex p-4 rounded-md">
        <Dropzone />
      </div>
    </div>
  );
};

export default DashboardPage;
