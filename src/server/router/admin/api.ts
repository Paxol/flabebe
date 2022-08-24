import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "../protected-router";

const charset = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const getRandomKey = (length: number) => 
	Array.from(Array(length), () => charset[Math.floor(Math.random() * charset.length)]).join('');

export const adminApiRouter = createProtectedRouter()
	.query("get-api-key-identifiers", {
		async resolve({ ctx }) {
			return await ctx.prisma.verificationToken.findMany({
				select: {
					identifier: true
				}
			})
		}
	})
	.mutation("create-api-key", {
		input: z.object({
			identifier: z.string(),
		}),

		async resolve({ input: { identifier }, ctx }) {
			const expiresAt = new Date(new Date().getTime() + 15552000000) // 6 month from now

			return await ctx.prisma.verificationToken.create({
				data: {
					identifier,
					token: getRandomKey(40),
					expires: expiresAt,
				}
			});
		}
	})
	.mutation("renew-api-key", {
		input: z.object({
			identifier: z.string().optional(),
			api_key: z.string().optional(),
		}),

		async resolve({ input: { identifier, api_key }, ctx }) {
			const where = {} as {
				identifier?: string,
				token?: string,
			};
			
			if (identifier) {
				where.identifier = identifier;
			} else if (api_key) {
				where.token = api_key;
			} else {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Identifier or API key must be specified"
				})
			}

			const current = await ctx.prisma.verificationToken.findFirst({
				where,
			});

			if (!current) throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Token not found'
			})

			return await ctx.prisma.verificationToken.update({
				where,
				data: {
					expires: new Date(current.expires.getTime() + 15552000000) // 6 month from now
				}
			})
		}
	})
	.mutation("remove-api-key", {
		input: z.object({
			identifier: z.string().optional(),
			api_key: z.string().optional(),
		}),

		async resolve({ input: { identifier, api_key }, ctx }) {
			const where = {} as {
				identifier?: string,
				token?: string,
			};
			
			if (identifier) {
				where.identifier = identifier;
			} else if (api_key) {
				where.token = api_key;
			} else {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Identifier or API key must be specified"
				})
			}

			return await ctx.prisma.verificationToken.delete({
				where
			});
		}
	})