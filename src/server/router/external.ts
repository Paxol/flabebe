import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createShortLink } from "../../utils/createShortLink";
import { createRouter } from "./context";

export const externalRouter = createRouter()
	.mutation("create-link", {
		input: z.object({
			api_key: z.string(),
			url: z.string()
		}),

		async resolve({ input: { api_key, url }, ctx }) {
			const verification = await ctx.prisma.verificationToken.findFirst({
				where: {
					token: api_key
				}
			});

			if (!verification) throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'API key not found'
			})

			if (verification.expires.getTime() < new Date().getTime()) throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'API key expired'
			})

			return await createShortLink({ url, expiresAt: null, slug: null }, ctx.prisma)
		}
	})