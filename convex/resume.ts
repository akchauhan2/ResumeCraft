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

    if(identity.subject !== resume.userId) {
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
      createSection(section.type, section.fields)
    );
    console.log(initialSections)


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
          workingHere: v.boolean()
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

    if(identity.subject !== resume.userId) {
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
          studyingHere: v.boolean()
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

    if(identity.subject !== resume.userId) {
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
  args:{
    id: v.id("resumes"),
    content: v.object({
      allSections: v.array(
        v.object({
          sectionTitle: v.string(),
          sectionDescription: v.string(),
          isVisible: v.boolean(),
        })
      ),
    }),
  },
  handler: async(ctx,args)=>{
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new Error("Something went wrong");
    }
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if(identity.subject !== resume.userId) {
      throw new Error("Unauthorized");
    }

    const resumeSections = resume?.sections;
    let index = resumeSections?.findIndex((item) => item.type === "custom")
    if(index === -1){
      throw new Error("Something went wrong index");
    }else{
      resumeSections[index].content = args.content
    }

    await ctx.db.patch(args.id, {
      sections : resumeSections,
    });

  }
})


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

    if(identity.subject !== resume.userId) {
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

    if(identity.subject !== resume.userId) {
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

    if(identity.subject !== resume.userId) {
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

    if(identity.subject !== resume.userId) {
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

    if(identity.subject !== resume.userId) {
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
    sections: v.array(
      v.object({
        type: SectionType,
        title: v.string(),
      })
    ),
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

    console.log(args.sections)

    // const resumeSections = resume.sections;

    // // Create a map of existing sections for quick lookup
    // const sectionMap = new Map(
    //   resumeSections.map((section) => [section.type, section])
    // );

    // // Create the new array based on the user's order
    // const rearrangedSections = args.sections
    //   .map((inputSection) => {
    //     const existingSection = sectionMap.get(inputSection.type);
    //     if (!existingSection) {
    //       console.warn(`Section type "${inputSection.type}" not found in resumeSections`);
    //       return null;
    //     }
        
    //     // For custom sections, update the title
    //     if (inputSection.type === "custom") {
    //       return {
    //         ...existingSection,
    //         content: {
    //           ...existingSection.content,
    //           sectionTitle: inputSection.title
    //         }
    //       };
    //     }
        
    //     // For standard sections, keep the existing section data
    //     return existingSection;
    //   })
    //   .filter((section): section is NonNullable<typeof section> => section !== null);

    // // Add any sections that were in resumeSections but not in the input order
    // resumeSections.forEach((section) => {
    //   if (!args.sections.some(inputSection => inputSection.type === section.type)) {
    //     rearrangedSections.push(section);
    //   }
    // });

    // console.log(rearrangedSections)

    // const newResume = await ctx.db.patch(args.id, {
    //   sections: rearrangedSections,
    // });

    // return newResume;
  },
});
