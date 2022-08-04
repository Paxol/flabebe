import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { resolveSlug } from "../../utils/resolveSlug";

export const slugRouter = createRouter()
  .query("get-url", {
    input: z.object({
      slug: z.string(),
    }),
    async resolve({ input: { slug }, ctx }) {
      const url = await resolveSlug(ctx.prisma, slug);

      if (!url) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Slug not found",
        });
      }

      return url;
    },
  });
