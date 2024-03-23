"use client";

// imports
import { FiUploadCloud } from "react-icons/fi";
import { LuFileSymlink } from "react-icons/lu";
import { MdClose } from "react-icons/md";
import ReactDropzone from "react-dropzone";
import bytesToSize from "@/utils/bytes-to-size";
import fileToIcon from "@/utils/file-to-icon";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import compressFileName from "@/utils/compress-file-name";
import { Skeleton } from "@/components/ui/skeleton";
import convertFile from "@/utils/convert";
import { ImSpinner3 } from "react-icons/im";
import { MdDone } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { HiOutlineDownload } from "react-icons/hi";
import { BiError } from "react-icons/bi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import loadFfmpeg from "@/utils/load-ffmpeg";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Action } from "../../../../type";
import { Download, ImageUp, RefreshCcw, Smile, Trash2 } from "lucide-react";
import Image from "next/image";

const extensions = {
  image: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "ico",
    "tif",
    "tiff",
    "svg",
    "raw",
    "tga",
  ],
  video: [
    "mp4",
    "m4v",
    "mp4v",
    "3gp",
    "3g2",
    "avi",
    "mov",
    "wmv",
    "mkv",
    "flv",
    "ogv",
    "webm",
    "h264",
    "264",
    "hevc",
    "265",
  ],
  audio: ["mp3", "wav", "ogg", "aac", "wma", "flac", "m4a"],
};

export default function Dropzone() {
  // variables & hooks
  const { toast } = useToast();
  const [is_hover, setIsHover] = useState<boolean>(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [is_ready, setIsReady] = useState<boolean>(false);
  const [files, setFiles] = useState<Array<any>>([]);
  const [is_loaded, setIsLoaded] = useState<boolean>(false);
  const [is_converting, setIsConverting] = useState<boolean>(false);
  const [is_done, setIsDone] = useState<boolean>(false);
  const ffmpegRef = useRef<any>(null);
  const [defaultValues, setDefaultValues] = useState<string>("video");
  const [selcted, setSelected] = useState<string>("...");
  const [img_ext, setImgExt] = useState<string[]>([""]);
  const [vid_ext, setVidExt] = useState<string[]>([""]);
  const [aud_ext, setAudExt] = useState<string[]>([""]);
  const accepted_files = {
    "image/*": [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".ico",
      ".tif",
      ".tiff",
      ".raw",
      ".tga",
    ],
    "audio/*": [],
    "video/*": [],
  };

  // functions
  const reset = () => {
    setIsDone(false);
    setActions([]);
    setFiles([]);
    setIsReady(false);
    setIsConverting(false);
  };
  const downloadAll = (): void => {
    for (let action of actions) {
      !action.is_error && download(action);
    }
  };
  const download = (action: Action) => {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = action.url;
    a.download = action.output;

    document.body.appendChild(a);
    a.click();

    // Clean up after download
    URL.revokeObjectURL(action.url);
    document.body.removeChild(a);
  };
  const convert = async (): Promise<any> => {
    let tmp_actions = actions.map((elt) => ({
      ...elt,
      is_converting: true,
    }));
    setActions(tmp_actions);
    setIsConverting(true);
    for (let action of tmp_actions) {
      try {
        const { url, output } = await convertFile(ffmpegRef.current, action);
        tmp_actions = tmp_actions.map((elt) =>
          elt === action
            ? {
                ...elt,
                is_converted: true,
                is_converting: false,
                url,
                output,
              }
            : elt
        );
        setActions(tmp_actions);
      } catch (err) {
        tmp_actions = tmp_actions.map((elt) =>
          elt === action
            ? {
                ...elt,
                is_converted: false,
                is_converting: false,
                is_error: true,
              }
            : elt
        );
        setActions(tmp_actions);
      }
    }
    setIsDone(true);
    setIsConverting(false);
  };
  const handleUpload = (data: Array<any>): void => {
    handleExitHover();
    setFiles(data);
    const tmp: Action[] = [];
    data.forEach((file: any) => {
      const formData = new FormData();
      tmp.push({
        file_name: file.name,
        file_size: file.size,
        from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
        to: null,
        file_type: file.type,
        file,
        is_converted: false,
        is_converting: false,
        is_error: false,
      });
    });
    setActions(tmp);
  };
  const handleHover = (): void => setIsHover(true);
  const handleExitHover = (): void => setIsHover(false);
  const updateAction = (file_name: String, to: String) => {
    setActions(
      actions.map((action): Action => {
        if (action.file_name === file_name) {
          console.log("FOUND");
          return {
            ...action,
            to,
          };
        }

        return action;
      })
    );
  };
  const checkIsReady = (): void => {
    let tmp_is_ready = true;
    actions.forEach((action: Action) => {
      if (!action.to) tmp_is_ready = false;
    });
    setIsReady(tmp_is_ready);
  };
  const deleteAction = (action: Action): void => {
    setActions(actions.filter((elt) => elt !== action));
    setFiles(files.filter((elt) => elt.name !== action.file_name));
  };
  useEffect(() => {
    if (!actions.length) {
      setIsDone(false);
      setFiles([]);
      setIsReady(false);
      setIsConverting(false);
    } else checkIsReady();
  }, [actions]);
  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    const ffmpeg_response: FFmpeg = await loadFfmpeg();
    ffmpegRef.current = ffmpeg_response;
    setIsLoaded(true);
  };

  // returns

  return (
    <div className="flex flex-col w-full space-y-6">
      <ReactDropzone
        onDrop={handleUpload}
        onDragEnter={handleHover}
        onDragLeave={handleExitHover}
        accept={accepted_files}
        onDropRejected={() => {
          handleExitHover();
          toast({
            variant: "destructive",
            title: "Error uploading your file(s)",
            description: "Allowed Files: Audio, Video and Images.",
            duration: 5000,
          });
        }}
        onError={() => {
          handleExitHover();
          toast({
            variant: "destructive",
            title: "Error uploading your file(s)",
            description: "Allowed Files: Audio, Video and Images.",
            duration: 5000,
          });
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            className=" bg-gray-50 h-32 lg:h-40 xl:h-48 w-full rounded-xl shadow-sm border-2 border-dashed cursor-pointer flex items-center justify-center"
          >
            <input {...getInputProps()} />
            <div className="space-y-4 text-gray-500">
              {is_hover ? (
                <>
                  <div className="justify-center flex text-6xl">
                    <Smile size={60} />
                  </div>
                  <h3 className="text-center opacity-70 text-sm">
                    Oui juste ici directeur
                  </h3>
                </>
              ) : (
                <>
                  <div className="justify-center flex text-6xl">
                    <ImageUp size={60} />
                  </div>
                  <h3 className="text-center opacity-70 text-sm">
                    Glisser deposer un fichier ici{" "}
                  </h3>
                </>
              )}
            </div>
          </div>
        )}
      </ReactDropzone>
      <div className="space-y-6 w-full">
        {actions.length === 0 ? (
          <div className="flex flex-col space-y-2 justify-center items-center p-4">
            <Image
              src="/images/empty.svg"
              alt=""
              className="object-cover w-1/2 mx-auto flex"
              width={1200}
              height={1200}
            />
            <p className="text-gray-400"> Aucun fichier uploader</p>
          </div>
        ) : (
          <>
            {actions.map((action: Action, i: any) => (
              <div
                key={i}
                className="w-full rounded cursor-pointer group shadow-md p-3 grid grid-cols-4 lg:grid-cols-5 gap-5"
              >
                {!is_loaded && (
                  <Skeleton className="h-full w-full -ml-10 cursor-progress absolute rounded-xl" />
                )}
                <div className="flex col-span-2 gap-4 items-center">
                  <span className="text-2xl text-orange-600">
                    {fileToIcon(action.file_type)}
                  </span>
                  <div className="flex items-center gap-1 w-96">
                    <span className="text-sm font-medium truncate overflow-x-hidden">
                      {compressFileName(action.file_name)}
                    </span>
                    <span className="text-gray-400 text-xs flex my-auto">
                      ({bytesToSize(action.file_size)})
                    </span>
                  </div>
                </div>
                <div className="col-span-2 lg:justify-normal justify-end  flex my-auto">
                  {action.is_error ? (
                    <Badge
                      variant="destructive"
                      className="flex w-24 justify-center gap-2 p-1"
                    >
                      <span>Erreur </span>
                      <BiError />
                    </Badge>
                  ) : action.is_converted ? (
                    <Badge
                      variant="default"
                      className="flex w-24 my-auto justify-center gap-2 text-center text-white bg-green-500 p-1"
                    >
                      <span>Reussi</span>
                      <MdDone />
                    </Badge>
                  ) : action.is_converting ? (
                    <Badge
                      variant="default"
                      className="flex w-full justify-center gap-2 p-1"
                    >
                      <span>Conversion</span>
                      <span className="animate-spin">
                        <ImSpinner3 />
                      </span>
                    </Badge>
                  ) : (
                    <div className="text-gray-400  p-2 text-md flex items-center gap-4">
                      <Select
                        onValueChange={(value) => {
                          if (extensions.audio.includes(value)) {
                            setDefaultValues("audio");
                          } else if (extensions.video.includes(value)) {
                            setDefaultValues("video");
                          }
                          setSelected(value);
                          updateAction(action.file_name, value);
                        }}
                        value={selcted}
                      >
                        <SelectTrigger className="w-32 p-4 outline-none focus:outline-none focus:ring-0 text-center text-gray-600 bg-gray-50 text-md font-medium">
                          <SelectValue placeholder="Convertir en..." />
                        </SelectTrigger>
                        <SelectContent className="h-fit">
                          {action.file_type.includes("image") && (
                            <div className="grid grid-cols-2 gap-2 w-fit">
                              {extensions.image.map((elt, i) => (
                                <div key={i} className="col-span-1 text-center">
                                  <SelectItem value={elt} className="mx-auto">
                                    {elt}
                                  </SelectItem>
                                </div>
                              ))}
                            </div>
                          )}
                          {action.file_type.includes("video") && (
                            <Tabs
                              defaultValue={defaultValues}
                              className="w-full"
                            >
                              <TabsList className="w-full">
                                <TabsTrigger value="video" className="w-full">
                                  Video
                                </TabsTrigger>
                                <TabsTrigger value="audio" className="w-full">
                                  Audio
                                </TabsTrigger>
                              </TabsList>
                              <TabsContent value="video">
                                <div className="grid grid-cols-3 gap-2 w-fit">
                                  {extensions.video.map((elt, i) => (
                                    <div
                                      key={i}
                                      className="col-span-1 text-center"
                                    >
                                      <SelectItem
                                        value={elt}
                                        className="mx-auto"
                                      >
                                        {elt}
                                      </SelectItem>
                                    </div>
                                  ))}
                                </div>
                              </TabsContent>
                              <TabsContent value="audio">
                                <div className="grid grid-cols-3 gap-2 w-fit">
                                  {extensions.audio.map((elt, i) => (
                                    <div
                                      key={i}
                                      className="col-span-1 text-center"
                                    >
                                      <SelectItem
                                        value={elt}
                                        className="mx-auto"
                                      >
                                        {elt}
                                      </SelectItem>
                                    </div>
                                  ))}
                                </div>
                              </TabsContent>
                            </Tabs>
                          )}
                          {action.file_type.includes("audio") && (
                            <div className="grid grid-cols-2 gap-2 w-fit">
                              {extensions.audio.map((elt, i) => (
                                <div key={i} className="col-span-1 text-center">
                                  <SelectItem value={elt} className="mx-auto">
                                    {elt}
                                  </SelectItem>
                                </div>
                              ))}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex w-full float-right my-auto lg:justify-end group space-x-3 lg:-translate-x-20 duration-200 transition-all lg:opacity-0 group-hover:translate-x-0 group-hover:opacity-100 ">
                  {action.is_converted && (
                    <span
                      onClick={() => download(action)}
                      className="cursor-pointer duration-300 bg-secondary text-white hover:bg-blue-600 rounded-md
                 h-10 w-10 flex items-center justify-center text-2xl"
                    >
                      <Download />
                    </span>
                  )}

                  <span
                    onClick={() => deleteAction(action)}
                    className="cursor-pointer duration-300 bg-red-400 text-white hover:bg-red-500 rounded-md
                 h-10 w-10 flex items-center justify-center text-2xl"
                  >
                    <Trash2 />
                  </span>
                </div>
              </div>
            ))}
            <div className="flex w-full justify-end">
              {is_done ? (
                <div className="grid lg:grid-cols-2 gap-4 grid-cols-1 w-fit">
                  <Button
                    size="lg"
                    className="rounded-md bg-secondary text-white font-semibold relative py-4 text-md flex gap-2 items-center w-full"
                    onClick={downloadAll}
                  >
                    {actions.length > 1 ? "Tout telecharger" : "Telecharger"}
                    <HiOutlineDownload />
                  </Button>
                  <Button
                    size="lg"
                    onClick={reset}
                    variant="outline"
                    className="rounded-md"
                  >
                    Convertir de nouveaux fichiers
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  disabled={!is_ready || is_converting}
                  className="rounded-md bg-primary text-white font-semibold relative py-4 text-md flex items-center w-44"
                  onClick={convert}
                >
                  {is_converting ? (
                    <span className="animate-spin text-lg">
                      <ImSpinner3 />
                    </span>
                  ) : (
                    <span className="flex space-x-2">
                      <RefreshCcw />
                      <p>Convertir</p>
                    </span>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
