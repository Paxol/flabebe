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
    if (data.expiresAt && data.expiresAt.getTime() < Date.now()) {
      await prisma.shortLink.delete({
        where: { slug: data.slug }
      });
      return undefined;
    }

    await prisma.shortLink.update({
      data: {
        totalVisits: { increment: 1 }
      },
      where: { id: data.id },
    })
  }

  return data.url;
}
