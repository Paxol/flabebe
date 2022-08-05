import { z } from "zod";
import { createProtectedRouter } from "../protected-router";
import { createShortLink } from "../../../utils/createShortLink";

export const adminSlugRouter = createProtectedRouter()
  .mutation("create", {
    input: z.object({
      url: z.string().url(),
      slug: z.string().nullable(),
      expiresAt: z.string().nullable(),
    }),
    async resolve({ input, ctx }) {
      return await createShortLink(input, ctx.prisma)
    }
  });
