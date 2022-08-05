import { z } from "zod";
import { createProtectedRouter } from "../protected-router";

import AWS from 'aws-sdk';
import { env } from "../../../env/server.mjs";
import { createShortLink } from "../../../utils/createShortLink";

export const adminFileRouter = createProtectedRouter()
	.mutation("get-upload-url", {
		input: z.object({
			fileName: z.string(),
			fileExtension: z.string(),
			contentType: z.string(),
		}),
		async resolve({ input, ctx }) {
			const s3 = new AWS.S3({
				credentials: {
					accessKeyId: env.S3_ACCESS_KEY,
					secretAccessKey: env.S3_SECRET_KEY
				},
				endpoint: `https://${env.S3_ENDPOINT}`,
				region: "us-east-1",
				signatureVersion: 'v4'
			});

			const bucket = env.S3_BUCKET;
			const key = `${Date.now()}-${Math.random()}.${input.fileExtension}`;

			const signedUrlConfig = {
				Bucket: bucket,
				Key: key,
				Expires: 3600,
			};

			const uploadUrl = s3.getSignedUrl('putObject', {
				...signedUrlConfig,
				ContentType: input.contentType,
			});

			const longDownloadUrl = s3.getSignedUrl('getObject', {
				...signedUrlConfig,
				ResponseContentDisposition: `attachment;filename=${input.fileName}`
			});

			const expireDate = new Date();
			expireDate.setDate(expireDate.getDate() + 1);
			const expiresAt = expireDate.toISOString();

			const downloadSlug = (await createShortLink({ url: longDownloadUrl, expiresAt, slug: null }, ctx.prisma)).slug;

			return {
				uploadUrl,
				downloadUrl: `/${downloadSlug}`,
			};
		}
	});
