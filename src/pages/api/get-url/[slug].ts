/* eslint-disable import/no-anonymous-default-export */

import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from '../../../server/db/client'
import { resolveSlug } from "../../../utils/resolveSlug";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const slug = req.query["slug"];

	if (!slug || typeof slug !== "string") {
		res.statusCode = 404;

		res.json({ message: "Use with slug" });
		return;
	}

	const url = await resolveSlug(prisma, slug, true);

	if (!url) {
		res.statusCode = 404;

		res.json({ message: "Not found" });
		return;
	}

	res.json({ url });
	res.end();
};