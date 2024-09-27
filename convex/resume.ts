import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  createSection,
  templateStructures,
} from "@/templates/templateStructures";

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
      lastName: v.optional(v.string()),
      email: v.string(),
      phone: v.optional(v.string()),
      github: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      location: v.optional(v.string()),
      summary: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== resume.userId) {
      throw new Error("Unauthorized");
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

    const templateSections: any = templateStructures[args.templateName];
    if (!templateSections) {
      throw new Error("Invalid template name");
    }

    const initialSections = templateSections.map((section: any) =>
      createSection(
        section.type,
        section.fields,
        section.orderNumber,
        section.isVisible
      )
    );

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
          startMonth: v.optional(v.string()),
          startYear: v.string(),
          endMonth: v.optional(v.string()),
          endYear: v.string(),
          workingHere: v.boolean(),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== resume.userId) {
      throw new Error("Unauthorized");
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
          startMonth: v.optional(v.string()),
          startYear: v.optional(v.string()),
          endMonth: v.optional(v.string()),
          endYear: v.optional(v.string()),
          location: v.string(),
          grade: v.optional(v.string()),
          studyingHere: v.boolean(),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== resume.userId) {
      throw new Error("Unauthorized");
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
    await ctx.db.patch(args.id, {
      sections: resumeSections,
    });
  },
});

export const updateCustomSection = mutation({
  args: {
    id: v.id("resumes"),
    content: v.object({
      sectionTitle: v.string(),
      sectionDescription: v.string(),
      sectionNumber: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== resume.userId) {
      throw new Error("Unauthorized");
    }
    const resumeSections = resume?.sections;
    const customSection = resumeSections.filter(
      (item) => item.type === "custom"
    );

    const currentCustomSectionIndex = customSection.findIndex(
      (item) => item.content.sectionNumber === args.content.sectionNumber
    );

    const allOrderNumbers =
      resumeSections?.map((item) => item.orderNumber) || [];
    const maxNumber = Math.max(...allOrderNumbers);

    if (
      args.content.sectionTitle.trim() === "" &&
      (args.content.sectionDescription.trim() === "<p><br></p>" ||
        args.content.sectionDescription.trim() === "")
    ) {
      const updatedSections = resumeSections.filter(
        (item) =>
          !(
            item.type === "custom" &&
            item.content.sectionNumber === args.content.sectionNumber
          )
      );
      return await ctx.db.patch(args.id, {
        sections: updatedSections,
      });
    }

    if (currentCustomSectionIndex === -1) {
      resumeSections.push({
        type: "custom",
        content: {
          sectionTitle: args.content.sectionTitle,
          sectionDescription: args.content.sectionDescription,
          sectionNumber: args.content.sectionNumber,
        },
        orderNumber: maxNumber + 1,
        isVisible: true,
      });
      await ctx.db.patch(args.id, {
        sections: resumeSections,
      });
    } else {
      customSection[currentCustomSectionIndex].content = args.content;
      await ctx.db.patch(args.id, {
        sections: resumeSections,
      });
    }
  },
});

export const removeCustomSection = mutation({
  args: {
    id: v.id("resumes"),
    sectionNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }

    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== resume.userId) {
      throw new Error("Unauthorized");
    }

    const resumeSections = resume?.sections;
    const customSection = resumeSections.filter(
      (item) => item.type === "custom"
    );
    const currentCustomSection = customSection.find(
      (item) => item.content.sectionNumber === args.sectionNumber
    );

    const orderNumberRemoved = currentCustomSection?.orderNumber;

    if (!orderNumberRemoved) {
      throw new Error("Something went wrong");
    }

    const updatedCustomSections = resumeSections.filter(
      (item) => item.orderNumber !== orderNumberRemoved
    );

    await ctx.db.patch(args.id, {
      sections: updatedCustomSections,
    });
  },
});

export const updateSkills = mutation({
  args: {
    id: v.id("resumes"),
    content: v.object({
      description: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== resume.userId) {
      throw new Error("Unauthorized");
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

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== resume.userId) {
      throw new Error("Unauthorized");
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

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== resume.userId) {
      throw new Error("Unauthorized");
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

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== resume.userId) {
      throw new Error("Unauthorized");
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

export const updateFont = mutation({
  args: {
    id: v.id("resumes"),
    font: v.string(),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== resume.userId) {
      throw new Error("Unauthorized");
    }

    const updatedResume = await ctx.db.patch(args.id, {
      globalStyles: {
        ...resume.globalStyles,
        fontFamily: args.font,
      },
    });

    return updatedResume;
  },
});

export const getUserResumes = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const resumes = await ctx.db
      .query("resumes")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    return resumes;
  },
});

export const getCustomSections = query({
  args: {
    id: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Resume not found");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== resume.userId) {
      throw new Error("Unauthorized");
    }

    const resumeSections = resume?.sections;

    const customSection = resumeSections.filter(
      (item) => item.type === "custom"
    );

    return customSection;
  },
});

const SectionType = v.union(
  v.literal("header"),
  v.literal("skills"),
  v.literal("projects"),
  v.literal("experience"),
  v.literal("education"),
  v.literal("custom")
);

export const reorderSections = mutation({
  args: {
    id: v.id("resumes"),
    updatedSections: v.any(),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Resume not found");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== resume.userId) {
      throw new Error("Unauthorized");
    }

    const updatedResume = await ctx.db.patch(args.id, {
      sections: args.updatedSections,
    });
    return updatedResume;
  },
});
