import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export async function createShortLink(input: { slug: string | null; url: string; expiresAt: string | null; }, prisma: PrismaClient) {
  if (input.slug?.includes(".")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Slug cannot contain a \".\"",
    });
  }
  
  let slugToUse = input.slug ?? generateRandomSlug(5);
  let existingSlug = false;

  do {
    const foundSlug = await prisma.shortLink.findFirst({
      where: {
        slug: slugToUse,
      },
    });

    console.log("foundSlug?", foundSlug);

    if (foundSlug) {
      if (foundSlug.expiresAt && foundSlug.expiresAt.getTime() < Date.now()) {
        await prisma.shortLink.delete({
          where: { slug: foundSlug.slug }
        })
        break;
      }

      if (input.slug) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Slug already exists",
        });
      } else {
        slugToUse = generateRandomSlug(5);
      }
    }
  } while (existingSlug);

  try {
    const slugCreated = await prisma.shortLink.create({
      data: {
        slug: slugToUse,
        url: input.url,
        expiresAt: input.expiresAt,
      },
    });

    return slugCreated;
  } catch (error) {
    console.error(error)

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not create slug",
      cause: error,
    });
  }
}

function generateRandomSlug(length: number) {
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
