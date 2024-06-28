import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { SectionTypes } from "@/types/templateTypes";
import { temp1Obj } from "@/templates/template1/temp1obj";
import { useMutation } from "convex/react";

// export const insertResumeData = mutation({
//     args: {},
//     handler: async(ctx,args)=>{
//         const resume  = await ctx.db.insert("resumes",temp1Obj)
//         return resume
//     }
// })

export const getTemplates = query({
  args: {},
  handler: async (ctx, args) => {
    const resumes = await ctx.db
      .query("resumes")
      .filter((q) => q.eq(q.field("isTemplate"), true))
      .collect();

    return resumes;
  },
});

export const getTemplateDetails = query({
  args: {
    id: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    return resume;
  },
});

export const updateHeader = mutation({
  args: {
    id: v.id("resumes"),
    content: v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
      github: v.string(),
      linkedin: v.string(),
      location: v.string(),
      summary: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }
    const resumeSections = resume?.sections;
    let index = resumeSections.findIndex((obj) => obj.type === "header");

    if (index === -1) {
      throw new Error("Somethign went wrong index");
    } else {
      resumeSections[index].content = {
        ...resumeSections[index].content,
        ...args.content,
      };
    }

    const newResume = await ctx.db.patch(args.id, {
      sections: resumeSections,
    });

    return resumeSections;
  },
});

export const createUserResume = mutation({
  args: {
    id: v.id("resumes"),
    userId: v.string(),
    templateName: v.string(),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);

    if (!args.userId) {
      throw new Error("Something went wrong...no userId");
    }

    if (!resume) {
      throw new Error("Something went wrong");
    }

    const initialSections: SectionTypes[] = [
      {
        type: "header",
        content: {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          github: "",
          linkedin: "",
          summary: "",
          location: "",
          photo: undefined,
        },
        style: {},
      },
      {
        type: "experience",
        content: {
          experience: [
            {
              companyName: "",
              role: "",
              jobDescription: "",
              location: "",
              startDate: "",
              endDate: "",
            },
          ],
        },
        style: {},
      },
      {
        type: "education",
        content: {
          education: [
            {
              courseName: "",
              instituteName: "",
              startDate: "",
              endDate: "",
              location: "",
            },
          ],
        },
        style: {},
      },
      {
        type: "skills",
        content: {
          type: "list",
          content: {
            skills: [],
          },
        },
        style: {
          columns: 2,
        },
      },
      {
        type: "projects",
        content: {
          projects: [
            {
              name: "",
              description: "",
              githuburl: "",
              liveurl: "",
            },
          ],
        },
        style: {},
      },
    ];

    const newResume = await ctx.db.insert("resumes", {
      isTemplate: false,
      userId: args.userId,
      globalStyles: resume?.globalStyles!,
      templateName: args?.templateName,
      sections: initialSections,
    });

    return newResume;
  },
});

export const updateExperience = mutation({
  args: {
    id: v.id("resumes"),
    content: v.object({
      experience: v.array(
        v.object({
          companyName: v.string(),
          role: v.string(),
          jobDescription: v.string(),
          location: v.optional(v.string()),
          startDate: v.string(),
          endDate: v.string(),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }
    const resumeSections = resume?.sections;
    let index = resumeSections.findIndex((item) => item.type === "experience");
    if (index === -1) {
      throw new Error("Something went wrong index");
    } else {
      resumeSections[index].content = {
        ...resumeSections[index]?.content,
        ...args.content,
      };
    }

    const newResume = await ctx.db.patch(args.id, {
      sections: resumeSections,
    });
    return newResume;
  },
});

export const updateEducation = mutation({
  args: {
    id: v.id("resumes"),
    content: v.object({
      education: v.array(
        v.object({
          courseName: v.string(),
          instituteName: v.string(),
          startDate: v.string(),
          endDate: v.string(),
          location: v.optional(v.string()),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }
    const resumeSections = resume?.sections;
    let index = resumeSections.findIndex((item) => item.type === "education");
    if (index === -1) {
      throw new Error("Something went wrong index");
    } else {
      resumeSections[index].content = {
        ...resumeSections[index]?.content,
        ...args.content,
      };
    }
    const newResume = await ctx.db.patch(args.id, {
      sections: resumeSections,
    });
  },
});

export const updateSkills = mutation({
  args: {
    id: v.id("resumes"),
    content: v.object({
      type: v.literal("list"),
      content: v.object({
        skills: v.array(v.string()),
      }),
    }),
    columns: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }
    const resumeSections = resume?.sections;
    let index = resumeSections.findIndex((item) => item.type === "skills");
    if (index === -1) {
      throw new Error("Something went wrong index");
    } else {
      resumeSections[index].content = {
        ...resumeSections[index].content,
        ...args.content,
      };
      resumeSections[index].style = {
        ...resumeSections[index].style,
        columns: args.columns,
      };
    }
    const newResume = await ctx.db.patch(args.id, {
      sections: resumeSections,
    });

    return newResume;
  },
});

export const updateProjects = mutation({
  args: {
    id: v.id("resumes"),
    content: v.object({
      projects: v.array(
        v.object({
          name: v.string(),
          description: v.string(),
          githuburl: v.optional(v.string()),
          liveurl: v.optional(v.string()),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }
    const resumeSections = resume?.sections;
    let projectsIndex = resumeSections.findIndex(
      (item) => item.type === "projects"
    );
    if (projectsIndex === -1) {
      throw new Error("Projects section not found in resume");
    } else {
      resumeSections[projectsIndex].content = {
        ...resumeSections[projectsIndex].content,
        ...args.content,
      };
    }

    const newResume = await ctx.db.patch(args.id, {
      sections: resumeSections,
    });
    return newResume;
  },
});

export const updateColor = mutation({
  args: {
    id: v.id("resumes"),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }
    const newGlobalStyles = {
      ...resume.globalStyles,
      primaryTextColor: args.color,
    };
    const newResume = await ctx.db.patch(args.id, {
      globalStyles: newGlobalStyles,
    });
    return newResume;
  },
});

export const updateColorPC = mutation({
  args: {
    id: v.id("resumes"),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }
    const newGlobalStyles = {
      ...resume.globalStyles,
      primaryColor: args.color,
    };
    const newResume = await ctx.db.patch(args.id, {
      globalStyles: newGlobalStyles,
    });
    return newResume;
  },
});
