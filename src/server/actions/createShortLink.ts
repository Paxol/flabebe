import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { getUrl } from "./getUrl";

export async function createShortLink(input: { slug: string | null; url: string; expiresAt: string | null; }, prisma: PrismaClient) {
  if (input.slug?.includes(".")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Slug cannot contain a \".\"",
    });
  }
  
  let slug = input.slug;
  if (input.slug) {
    const foundUrl = getUrl(input.slug, false);
    const alreadyExists = foundUrl !== null;

    if (alreadyExists) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Slug already exists",
      });
    }
  }

  if (!slug)
    slug = await generateSlug();

  try {
    return await prisma.shortLink.create({
      data: {
        slug,
        url: input.url,
        expiresAt: input.expiresAt,
      },
    });
  } catch (error) {
    console.error(error);

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not create slug",
      cause: error,
    });
  }
}

async function generateSlug() {
  do {
    const slug = randomSlug(5);
    const found = await getUrl(slug, false);

    if (!found) return slug;
  } while (true);
}

function randomSlug(length: number) {
  const chars = [];

  for (let i = 0; i < length; i++) {
    let char = Math.floor(Math.random() * 26 + 65);

    if (Math.floor(Math.random() * 2) % 2 == 0) {
      char += 32;
    }

    switch (char) {
      case 73: // I
      case 105: // i
      case 108: // l
        char++;
    }

    chars.push(String.fromCharCode(char));
  }

  return chars.join("");
}
