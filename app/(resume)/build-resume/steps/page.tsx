"use client";
import { Button } from "@/components/ui/button";
import { fontMap } from "@/utils/font";
import { Computer, LayoutTemplate, PencilLine } from "lucide-react";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { container, item } from "@/lib/motion";

const page = () => {
  return (
    <>
      <div
        className={`flex items-center justify-center w-full h-[90vh] ${fontMap.Geologica.className}`}
      >
        <motion.div variants={container} initial="hidden" animate="visible" className="max-w-[70%] mx-auto">
          <h1 className={` text-center text-6xl font-extrabold `}>
            Here's what you need to know
          </h1>
          <div className="flex items-center justify-between gap-16 mt-20">
            <motion.div variants={item} className="flex flex-col gap-2 items-center justify-center">
              <LayoutTemplate size={70} />
              <h1 className="font-semibold text-3xl">Step 1</h1>
              <p className="text-md text-justify">
                Check out our pre-designed templates and guided steps, allowing
                you to create a polished resume faster.
              </p>
            </motion.div>

            <motion.div variants={item} className="flex flex-col gap-2 items-center justify-center">
              <PencilLine size={70} />
              <h1 className="font-semibold text-3xl">Step 2</h1>
              <p className="text-md text-justify">
                Check out our pre-designed templates and guided steps, allowing
                you to create a polished resume faster.
              </p>
            </motion.div>

            <motion.div variants={item} className="flex flex-col gap-2 items-center justify-center">
              <Computer size={70} />
              <h1 className="font-semibold text-3xl">Step 3</h1>
              <p className="text-md text-justify">
                Check out our pre-designed templates and guided steps, allowing
                you to create a polished resume faster.
              </p>
            </motion.div>
          </div>
          <motion.div variants={item}>
            <Button className="block hover:scale-[1.03] active:scale-[0.97] transition duration-300 ease-in-out mx-auto mt-16 px-24 pt-8 pb-8 rounded-xl">
              <Link
                href={"/build-resume/templates"}
                className="w-full h-full flex items-center text-xl justify-center"
              >
                Continue
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default page;
