import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createProtectedRouter } from "../protected-router";

export const adminSlugRouter = createProtectedRouter()
  .mutation("create", {
    input: z.object({
      url: z.string().url(),
      slug: z.string().nullable(),
      expiresAt: z.string().nullable(),
    }),
    async resolve({ input, ctx }) {
      const { url, slug } = input;
      let slugToUse = slug ?? generateRandomSlug(5);

      let existingSlug = false;

      do {
        const foundSlug = await ctx.prisma.shortLink.findFirst({
          where: {
            slug: slugToUse,
          },
        });

        console.log("foundSlug?", foundSlug);

        if (foundSlug) {
          if (foundSlug.expiresAt && foundSlug.expiresAt.getTime() < Date.now()) {
            await ctx.prisma.shortLink.delete({
              where: { slug: foundSlug.slug }
            })
            break;
          }

          if (slug) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Slug already exists",
            });
          } else {
            slugToUse = generateRandomSlug(5);
          }
        }
      } while (existingSlug);

      try {
        const slugCreated = await ctx.prisma.shortLink.create({
          data: {
            slug: slugToUse,
            url,
            expiresAt: input.expiresAt,
          },
        });

        return slugCreated;
      } catch (error) {
        console.error(error)

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create slug",
          cause: error,
        });
      }
    }
  });


function generateRandomSlug(length: number) {
  const chars = [];

  for (let i = 0; i < length; i++) {
    let char = Math.floor(Math.random() * 26 + 65);

    if (Math.floor(Math.random() * 2) % 2 == 0) {
      char += 32;
    }

    switch (char) {
      case 73: // I
      case 105: // i
      case 108: // l
        char++;
    }

    chars.push(String.fromCharCode(char));
  }

  return chars.join("");
}
