import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
	if (
		req.nextUrl.pathname.startsWith("/api/") ||
		req.nextUrl.pathname.startsWith("/admin") ||
		req.nextUrl.pathname.startsWith("/404") ||
		req.nextUrl.pathname.includes(".")
	) {
		return;
	}

	const slug = req.nextUrl.pathname.split("/").pop();

  const slugFetch = await fetch(`${req.nextUrl.origin}/api/get-url/${slug}`);
  if (slugFetch.status === 404) {
    return NextResponse.redirect(`${req.nextUrl.origin}/404`);
  }
  const data = await slugFetch.json();

  if (data?.url) {
    return NextResponse.redirect(data.url);
  }
}

export const config = {
  matcher: "/:slug+",
};