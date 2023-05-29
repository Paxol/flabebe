/* eslint-disable import/no-anonymous-default-export */

import { NextApiRequest, NextApiResponse } from "next";

import { getUrl } from "../../../server/actions/getUrl";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const slug = req.query["slug"];

	if (!slug || typeof slug !== "string") {
		res.status(400).json({ message: "Missing slug" });
		return;
	}

	const url = await getUrl(slug, true);

	if (!url) {
		res.statusCode = 404;
		res.json({ message: "Not found" });
		return;
	}

	res.json({ url });
};
