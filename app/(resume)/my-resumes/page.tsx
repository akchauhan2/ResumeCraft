"use client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { templateComponents } from "@/templates/templateStructures";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Edit, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const page = () => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  if (!user) return null;

  const templates = useQuery(api.resume.getUserResumes, {
    userId: user?.id,
  });


  if (templates === null || templates?.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center w-full h-[80vh]">
          <h1 className="text-xl font-medium">
            You have not created any resume yet.
          </h1>
        </div>
      </div>
    );
  }

  if (templates === undefined) {
    return (
      <>
        <Navbar />
        <div className="max-w-[80%] mx-auto mt-16">
          <ChooseSkeleton />
        </div>
      </>
    );
  }

  const editResume = (resumeId : Id<"resumes">)=>{
    router.push(`/build-resume/${resumeId}/tips?sec=header`)
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-[80%] mx-auto">
        <h1 className="text-2xl font-semibold">My Resumes</h1>
        <div className="grid grid-cols-3 gap-6 mt-5">
          {templates?.map((item, index) => {
            const TemplateComponent = templateComponents[item?.templateName];

            if (!TemplateComponent) {
              return <div>Something went wronng...</div>;
            }

            return (
              <div
                key={index}
                className="relative group inline-block w-[319px] h-[449px]"
              >
                <TemplateComponent obj={item} isPreview={true} />
                <div className="absolute inset-0 w-full h-full p-10 flex items-center gap-5 rounded-xl cursor-pointer justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50">
                  <Button className="py-2 px-5 flex items-center justify-center gap-2">
                    <p>Preview</p> <Eye />
                  </Button>
                  <Button
                    onClick={() => editResume(item?._id)}
                    variant={"secondary"}
                    className="py-2 px-5 flex items-center justify-center gap-2"
                  >
                    <p>Select</p> <Edit />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ChooseSkeleton = () => {
  return (
    <>
      <div className="grid grid-cols-3 gap-6 mt-5">
        {[0, 1, 2].map((item, index) => (
          <Skeleton
            key={index}
            className=" w-[319px] h-[449px] bg-slate-500/20"
          />
        ))}
      </div>
    </>
  );
};

export default page;