import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createShortLink } from "../../utils/createShortLink";
import { createRouter } from "./context";

export const externalRouter = createRouter()
	.query("latest", {
		input: z.object({
			api_key: z.string(),
			n: z.number().default(3)
		}),

		async resolve({ input: { api_key, n }, ctx }) {
			await verifyApiKey(api_key, ctx);

			return await ctx.prisma.shortLink.findMany({
				orderBy: {
					createdAt: "desc"
				},
				take: n
			})
		}
	})
	.mutation("create-link", {
		input: z.object({
			api_key: z.string(),
			url: z.string()
		}),

		async resolve({ input: { api_key, url }, ctx }) {
			await verifyApiKey(api_key, ctx);

			return await createShortLink({ url, expiresAt: null, slug: null }, ctx.prisma)
		}
	})

async function verifyApiKey(api_key: string, ctx: { prisma: any; }) {
	const verification = await ctx.prisma.verificationToken.findFirst({
		where: {
			token: api_key
		}
	});

	if (!verification)
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'API key not found'
		});

	if (verification.expires.getTime() < new Date().getTime())
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'API key expired'
		});
}
