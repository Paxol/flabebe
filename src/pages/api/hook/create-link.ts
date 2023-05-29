import { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env/server.mjs";
import { createShortLink } from "../../../server/actions/createShortLink";

import { prisma } from "../../../server/db/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  if (req.headers["x-webhook-secret"] !== env.WEBHOOK_SECRET) {
    res.status(401).send("Wrong secret");
    return;
  }

  const data = req.body;

  if (!("url" in data) || typeof data.url !== "string") {
    res.status(400).send("Missing url field");
    return;
  }

  await createShortLink(
    {
      url: data.url,
      expiresAt: null,
      slug: null
    },
    prisma
  );

  res.status(200).end();
}
