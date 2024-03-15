// imports
import { FileAudio, FileImage, FileText, FileVideo } from "lucide-react";
import { AiFillFile } from "react-icons/ai";

export default function fileToIcon(file_type: any): any {
  if (file_type.includes("video"))
    return <FileVideo size={24} className="text-red-600" />;
  if (file_type.includes("audio"))
    return <FileAudio size={24} className="text-orange-600" />;
  if (file_type.includes("text"))
    return <FileText size={24} className="text-green-500" />;
  if (file_type.includes("image"))
    return <FileImage size={24} className="text-blue-600" />;
  else return <AiFillFile />;
}
