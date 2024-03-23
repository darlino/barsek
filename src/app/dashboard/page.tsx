/* eslint-disable react/no-unescaped-entities */
"use client";
import { Images, PaintBucket } from "lucide-react";
import Dropzone from "./_/dropzone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ColorExtractor from "./_/ColorExtractor";

type Props = {};

const DashboardPage = (props: Props) => {
  return (
    <Tabs
      defaultValue="dropzone"
      className="bg-slate-50 w-full lg:px-24 p-2 mx-auto grid lg:grid-cols-3 lg:gap-8 gap-y-6 grid-cols-1"
    >
      <TabsList className="col-span-1 w-full h-auto justify-start bg-white rounded-md p-3 flex flex-col space-y-3">
        <TabsTrigger
          className="p-4 w-full bg-slate-50 active:bg-primary space-x-3 flex"
          value="color_palette"
        >
          <Images />
          <p> Convertisseur d'images</p>
        </TabsTrigger>
        <TabsTrigger
          value="dropzone"
          className="p-4 w-full bg-slate-50 space-x-3 flex"
        >
          <PaintBucket />
          <p> Extraction de couleur</p>
        </TabsTrigger>
      </TabsList>
      <div className=" col-span-2 p-4 bg-white rounded-md">
        <TabsContent value="color_palette">
          <Dropzone />
        </TabsContent>
        <TabsContent value="dropzone">
          <ColorExtractor />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default DashboardPage;
