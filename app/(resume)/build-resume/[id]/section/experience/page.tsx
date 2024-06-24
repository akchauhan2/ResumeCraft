"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { montserrat } from "@/utils/font";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import React, {
  ChangeEvent,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import debounce from "lodash/debounce";
import QuillEditorComponent from "@/components/QuillEditor";
import { Button } from "@/components/ui/button";
import SectionInfo from "@/components/SectionInfo";

interface ExperienceItem {
  companyName: string;
  role: string;
  jobDescription: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface ExperienceContent {
  experience: ExperienceItem[];
}

const emptyExperienceItem: ExperienceItem = {
  companyName: "",
  role: "",
  jobDescription: "",
  location: "",
  startDate: "",
  endDate: "",
};

const Page = () => {
  const [experience, setExperience] = useState<ExperienceContent>({
    experience: [],
  });
  const update = useMutation(api.resume.updateExperience);
  const params = useParams();
  const resumeId = params.id as Id<"resumes">;
  const pendingChangesRef = useRef(false);
  const resume = useQuery(api.resume.getTemplateDetails, { id: resumeId });
  const router = useRouter();

  let sectionArray: string[] = [];
  resume?.sections?.map((item) => sectionArray.push(item.type));
  let experienceIndex = sectionArray.findIndex((item) => item === "experience");

  useEffect(() => {
    if (resume?.sections && !pendingChangesRef.current) {
      const experienceSection = resume.sections.find(
        (item) => item.type === "experience"
      );
      if (experienceSection?.content) {
        const savedExperience = (experienceSection.content as ExperienceContent)
          .experience;
        setExperience({ experience: savedExperience });
      }
    }
  }, [resume?.sections]);

  const debouncedUpdate = useMemo(() => {
    return debounce((newExperience: ExperienceContent) => {
      update({ id: resumeId, content: newExperience });
      pendingChangesRef.current = false;
    }, 400);
  }, [update, resumeId]);

  const handleChange = useCallback(
    (index: number) =>
      (
        e: ChangeEvent<HTMLInputElement> | string,
        field?: keyof ExperienceItem
      ) => {
        pendingChangesRef.current = true;
        setExperience((prevExperience) => {
          const newExperience = { ...prevExperience };
          if (typeof e === "string" && field) {
            newExperience.experience[index][field] = e;
          } else if (typeof e !== "string") {
            const { name, value } = e.target;
            newExperience.experience[index][name as keyof ExperienceItem] =
              value;
          }
          debouncedUpdate(newExperience);
          return newExperience;
        });
      },
    [debouncedUpdate]
  );

  const addExperience = () => {
    setExperience((prev) => ({
      ...prev,
      experience: [...prev.experience, emptyExperienceItem],
    }));
  };

  if (resume === null) {
    return <div>Template not found</div>;
  }

  if (resume === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {resume.sections?.map((item, idx) => {
        if (item?.type === "experience") {
          return (
            <div key={idx} className="mt-24 mx-16">
              <SectionInfo
                heading={"Let's work on your experience."}
                text={"Start with your most recent job first."}
              />

              {experience.experience.map((exp, index) => (
                <form key={index} className="mt-8">
                  <div className="grid grid-cols-2 w-full max-w-[85%] gap-8">
                    <InputField
                      label="Company Name"
                      name="companyName"
                      value={exp.companyName}
                      onChange={handleChange(index)}
                      placeholder="Microsoft"
                    />
                    <InputField
                      label="Role"
                      name="role"
                      value={exp.role}
                      onChange={handleChange(index)}
                      placeholder="Software Developer"
                    />
                    <InputField
                      label="Location"
                      name="location"
                      value={exp.location}
                      onChange={handleChange(index)}
                      placeholder="New York, NY"
                    />
                    <InputField
                      label="Start Date"
                      name="startDate"
                      value={exp.startDate}
                      onChange={handleChange(index)}
                      placeholder="YYYY-MM"
                      type="month"
                    />
                    <InputField
                      label="End Date"
                      name="endDate"
                      value={exp.endDate}
                      onChange={handleChange(index)}
                      placeholder="YYYY-MM or Present"
                      type="month"
                    />
                  </div>
                  <div className="mt-8 w-[85%]">
                    <Label className="text-md">Job Description</Label>
                    <QuillEditorComponent
                      value={exp.jobDescription}
                      onChange={(content) =>
                        handleChange(index)(content, "jobDescription")
                      }
                    />
                  </div>
                </form>
              ))}
              <Button onClick={addExperience} className="mt-4">
                Add Another Experience
              </Button>
              <div className="flex">
                <Button
                  onClick={() => {
                    router.push(
                      `/build-resume/${resumeId}/tips?sec=${sectionArray[experienceIndex + 1]}`
                    );
                  }}
                  className="px-16 py-8 mt-6 text-xl rounded-full"
                >
                  Next
                </Button>
              </div>
            </div>
          );
        }
        return null;
      })}
    </>
  );
};
interface InputFieldProps {
  label: string;
  name: keyof ExperienceItem;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) => (
  <div className="flex flex-col justify-center gap-2">
    <Label htmlFor={name} className="text-md">
      {label}
    </Label>
    <Input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border border-muted-foreground"
    />
  </div>
);

export default Page;
