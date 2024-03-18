/* eslint-disable react/no-unescaped-entities */
import Navbar from "@/components/layouts/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex  min-h-screen container  max-w-4xl lg:max-w-6xl 2xl:max-w-7xl flex-col spac-y-2">
      <Navbar />
      <div className="flex flex-col lg:px-24 space-y-3 lg:-space-y-20 p-8">
        <div className="space-y-6">
          <h1 className="lg:text-6xl font-bold text-center text-4xl text-slate-80 ">
            Convertissez n'importe quel{" "}
            <span className="text-third"> fichier </span>
          </h1>
          <p className="opacity-80 text-center">
            Libérez votre créativité avec Bersek- l'outil en ligne ultime pour
            une conversion multimédia illimitée et gratuite. Transformez vos
            images, vos fichiers audio et vos vidéos sans effort et sans
            restriction. Commencez à convertir dès maintenant et améliorez votre
            contenu comme jamais auparavant !
          </p>
        </div>

        <div className=""></div>
        <Image
          src="/images/hero.png"
          width={1200}
          height={1200}
          className="w-full lg:order-1 order-2 h-full object-cover mx-auto"
          alt=""
        />
        <Link
          href="/dashboard"
          className="py-3 justify-center lg:order-2 order-1 px-6 mx-auto group transition-all cursor-pointer p-4 text-white flex my-auto rounded-md space-x-3  bg-gradient-to-tr from-primary to-third"
        >
          <p className=" font-bold">Commencer</p>
          <ArrowRight
            className="-translate-x-12 my-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0 duration-300 transition-all"
            size={"20"}
          />
        </Link>
      </div>
    </main>
  );
}
