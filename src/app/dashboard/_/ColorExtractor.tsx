import { toast, useToast } from "@/components/ui/use-toast";
import { Copy, ImageUp, Smile } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import ReactDropzone, { useDropzone } from "react-dropzone";
import { ImSpinner3 } from "react-icons/im";

type Props = {};
interface RGBObject {
  r: number;
  g: number;
  b: number;
  [key: string]: number;
}

const ColorExtractor = (props: Props) => {
  const [HexArr, setHexArr] = useState<string[]>([]);
  const RGBArrayToHexArray = (rgbArray: RGBObject[]): string[] => {
    const hexArray: string[] = rgbArray.map((rgb) => {
      // Vérifiez que les valeurs r, g et b sont des nombres entre 0 et 255
      if (
        !isValidRGBValue(rgb.r) ||
        !isValidRGBValue(rgb.g) ||
        !isValidRGBValue(rgb.b)
      ) {
        throw new Error(
          "Chaque composante RGB doit être un nombre entre 0 et 255."
        );
      }

      // Convertir chaque composante RGB en sa représentation hexadécimale
      const hexComponents = ["r", "g", "b"].map((component) => {
        const hexComponent = rgb[component].toString(16).toUpperCase();
        // Assurez-vous que la représentation hexadécimale a deux caractères
        return hexComponent.length === 1 ? "0" + hexComponent : hexComponent;
      });

      // Concaténer les composantes hexadécimales pour former le code hexadécimal complet
      return "#" + hexComponents.join("");
    });

    return hexArray;
  };

  function isValidRGBValue(value: number): boolean {
    return typeof value === "number" && value >= 0 && value <= 255;
  }

  const processFile = (file: File) => {
    const image = new Image();
    const fileReader = new FileReader();

    fileReader.onload = () => {
      image.onload = () => {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(image, 0, 0);

        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        console.log("Image data ", imageData);

        const buildRgb = (imageData: any) => {
          const rgbValues = [];
          for (let i = 0; i < imageData.length; i += 4) {
            const rgb = {
              r: imageData[i],
              g: imageData[i + 1],
              b: imageData[i + 2],
            };
            rgbValues.push(rgb);
          }
          return rgbValues;
        };
        const findBiggestColorRange = (
          rgbValues: { r: number; g: number; b: number }[]
        ) => {
          let rMin = Number.MAX_VALUE;
          let gMin = Number.MAX_VALUE;
          let bMin = Number.MAX_VALUE;

          let rMax = Number.MIN_VALUE;
          let gMax = Number.MIN_VALUE;
          let bMax = Number.MIN_VALUE;

          rgbValues.forEach((pixel: { r: number; g: number; b: number }) => {
            rMin = Math.min(rMin, pixel.r);
            gMin = Math.min(gMin, pixel.g);
            bMin = Math.min(bMin, pixel.b);

            rMax = Math.max(rMax, pixel.r);
            gMax = Math.max(gMax, pixel.g);
            bMax = Math.max(bMax, pixel.b);
          });

          const rRange = rMax - rMin;
          const gRange = gMax - gMin;
          const bRange = bMax - bMin;

          const biggestRange = Math.max(rRange, gRange, bRange);
          if (biggestRange === rRange) {
            return "r";
          } else if (biggestRange === gRange) {
            return "g";
          } else {
            return "b";
          }
        };
        const quantization = (rgbValues: any[], depth: number): any => {
          const MAX_DEPTH = 4;
          if (depth === MAX_DEPTH || rgbValues.length === 0) {
            const color = rgbValues.reduce(
              (prev, curr) => {
                prev.r += curr.r;
                prev.g += curr.g;
                prev.b += curr.b;

                return prev;
              },
              {
                r: 0,
                g: 0,
                b: 0,
              }
            );

            color.r = Math.round(color.r / rgbValues.length);
            color.g = Math.round(color.g / rgbValues.length);
            color.b = Math.round(color.b / rgbValues.length);
            return [color];
          }
          const componentToSortBy = findBiggestColorRange(rgbValues);
          rgbValues.sort((p1, p2) => {
            return p1[componentToSortBy] - p2[componentToSortBy];
          });

          const mid = rgbValues.length / 2;
          return [
            ...quantization(rgbValues.slice(0, mid), depth + 1),
            ...quantization(rgbValues.slice(mid + 1), depth + 1),
          ];
        };
        const rgbArray = buildRgb(imageData?.data);
        const quantColors = quantization(rgbArray, 1);
        setHexArr(RGBArrayToHexArray(quantColors));
        console.log(HexArr[0]);
      };

      image.src = fileReader.result as string;
    };

    if (file) {
      fileReader.readAsDataURL(file);
    }
  };
  const onDrop = useCallback((acceptedFiles: any[]) => {
    const file = acceptedFiles[0];
    processFile(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="flex space-y-4 flex-col">
      <div
        {...getRootProps()}
        className=" bg-gray-50 h-32 lg:h-40 xl:h-48 w-full rounded-xl shadow-sm border-2 border-dashed cursor-pointer flex items-center justify-center"
      >
        <input {...getInputProps()} />
        <div className="space-y-4 text-gray-500">
          <div className="justify-center flex text-6xl">
            <ImageUp size={60} />
          </div>
          <h3 className="text-center opacity-70 text-sm">
            Glisser deposer un fichier ici{" "}
          </h3>
        </div>
      </div>
      <canvas
        id="canvas"
        className="flex mx-auto lg:w-1/2 w-full lg:h-1/2"
      ></canvas>
      <div id="palette" className="grid lg:w-1/2 w-full mx-auto">
        {HexArr.map((hex, id) => (
          <div
            key={id}
            className={`w-full p-4 text-muted border-b border-b-gray-100 flex justify-between`}
            style={{
              backgroundColor: hex.toString(),
            }}
          >
            <p id="myElement"> {hex.toString()}</p>
            <div
              className="flex my-auto cursor-pointer"
              onClick={() => {
                navigator.clipboard
                  .writeText(hex.toString())
                  .then(() => {
                    toast({
                      title: "Text copie avec succes",
                      duration: 5000,
                    });
                  })
                  .catch((error) => {
                    toast({
                      title: "Une erreur s'est produite",
                      duration: 5000,
                    });
                  });
              }}
            >
              <Copy size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorExtractor;
