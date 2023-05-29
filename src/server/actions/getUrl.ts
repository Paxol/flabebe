import { prisma } from "../db/client";

export const getUrl = async (slug: string, incrementViews = false) => {
  const data = await prisma.shortLink.findFirst({ where: { slug } });

  if (!data || !data.url) return null;

  if (data.expiresAt && data.expiresAt.getTime() < Date.now()) {
    await prisma.shortLink.delete({ where: { slug } });
    return null;
  }

  if (incrementViews)
    await prisma.shortLink.update({
      data: {
        totalVisits: { increment: 1 },
      },
      where: { id: data.id },
    });

  return data.url;
};
