import type { Prisma, PrismaClient } from "@prisma/client";

export async function resolveSlug(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>,
  slug: string,
  isVisit: boolean = false
) {
  const data = await prisma.shortLink.findFirst({
    where: { slug: { equals: slug } },
  });

  if (!data || !data.url) {
    return undefined;
  }

  if (isVisit) {
    await prisma.shortLink.update({
      data: {
        totalVisits: { increment: 1 }
      },
      where: { id: data.id },
    })
  }

  return data.url;
}
