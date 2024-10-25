"use client";

import CustomForm from "@/components/forms/CustomForm";
import SkillsForm from "@/components/forms/SkillsForm";
import HeaderSkeleton from "@/components/HeaderSkeleton";
import SectionInfo from "@/components/SectionInfo";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';

const Page = () => {
  const params = useParams();
  const resumeId = params.id;
  const resume = useQuery(api.resume.getTemplateDetails, {
    id: resumeId as Id<"resumes">,
  });

  if (resume === null) {
    return <div>No Template Found</div>;
  }
  if (resume === undefined) {
    return <HeaderSkeleton />;
  }

  return (
    <div className="mt-24 mx-4 md:mx-16">
      <SectionInfo
        heading="Create a Custom Section"
        text="Use this space to elaborate on specific projects, certifications, or contributions that demonstrate your expertise if you want to."
      />

      <CustomForm
        resumeId={resumeId as Id<"resumes">}
        styles={"sadf"}
        item={"asdf"}
      />
    </div>
  );
};

export default Page;
