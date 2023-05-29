import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getUrl } from "../actions/getUrl";

export const slugRouter = createRouter().query("get-url", {
  input: z.object({
    slug: z.string(),
  }),
  async resolve({ input: { slug } }) {
    const url = await getUrl(slug);

    if (!url) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Slug not found",
      });
    }

    return url;
  },
});
