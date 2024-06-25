"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import debounce from "lodash/debounce";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "../ui/button";

interface EducationItem {
  courseName: string;
  instituteName: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface EducationContent {
  education: EducationItem[];
}

interface EducationFormProps {
  item: any;
  resumeId: Id<"resumes">;
}

const EducationForm = ({ item, resumeId }: EducationFormProps) => {
  const emptyEducation: EducationItem = {
    courseName: "",
    instituteName: "",
    location: "",
    startDate: "",
    endDate: "",
  };

  const [education, setEducation] = useState<EducationContent>({
    education: [],
  });
  const pendingChangesRef = useRef(false);
  const update = useMutation(api.resume.updateEducation);

  useEffect(() => {
    if (!pendingChangesRef.current) {
      setEducation(item?.content);
    }
  }, [item?.content?.education]);

  const debouncedUpdate = useMemo(() => {
    return debounce((newEducation: EducationContent) => {
      console.log(newEducation);

      update({ id: resumeId, content: newEducation });
      pendingChangesRef.current = false;
    }, 400);
  }, [update, resumeId]);

  const handleChange = useCallback(
    (index: number) =>
      (
        e: ChangeEvent<HTMLInputElement> | string,
        field?: keyof EducationItem
      ) => {
        pendingChangesRef.current = true;
        setEducation((prev) => {
          let newEducation = { ...prev };
          if (typeof e === "string" && field) {
            newEducation.education[index][field] = e;
          } else if (typeof e !== "string") {
            newEducation.education[index][
              e.target.name as keyof EducationItem
            ] = e.target.value;
          }
          debouncedUpdate(newEducation);
          return newEducation;
        });
      },
    [debouncedUpdate]
  );

  const addEducation = () => {
    setEducation((prev) => ({
      ...prev,
      education: [...prev.education, emptyEducation],
    }));
  };

  return (
    <>
      {education?.education?.map((item, index) => {
        return (
            <form key={index} className="mt-8">
              <div className="grid grid-cols-2 w-full max-w-[85%] gap-8">
                <InputField
                  label="Institue Name"
                  name="instituteName"
                  value={item.instituteName}
                  onChange={handleChange(index)}
                  placeholder="University of California, Berkeley"
                />

                <InputField
                  label="Course Name"
                  name="courseName"
                  value={item.courseName}
                  onChange={handleChange(index)}
                  placeholder="Bachelor of Science"
                />
                <InputField
                  label="Location"
                  name="location"
                  value={item.location}
                  onChange={handleChange(index)}
                  placeholder="California, USA"
                />
                <InputField
                  label="Start Date"
                  name="startDate"
                  value={item.startDate}
                  onChange={handleChange(index)}
                  placeholder="2020"
                />
                <InputField
                  label="End Date"
                  name="endDate"
                  value={item.endDate}
                  onChange={handleChange(index)}
                  placeholder="2024"
                />
              </div>
            </form>
        );
      })}
      <Button onClick={addEducation} className="mt-4">
        Add Another Education
      </Button>
    </>
  );
};

interface InputFieldProps {
  label: string;
  name: keyof EducationItem;
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
}) => {
  return (
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
};

export default EducationForm;
