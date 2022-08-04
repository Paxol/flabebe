import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
	console.log("middleware");
	
	const pathnameParts = req.nextUrl.pathname.split("/");
	if (
		req.nextUrl.pathname.startsWith("/api/") ||
		req.nextUrl.pathname.startsWith("/admin") ||
		req.nextUrl.pathname === "/" ||
		pathnameParts.length > 1
	) {
		console.log("Skipping middleware for", req.nextUrl.pathname);
		return;
	}

	const slug = pathnameParts.pop();

  const slugFetch = await fetch(`${req.nextUrl.origin}/api/get-url/${slug}`);
  if (slugFetch.status === 404) {
    return NextResponse.redirect(req.nextUrl.origin);
  }
  const data = await slugFetch.json();

  if (data?.url) {
		return NextResponse.redirect(data.url);
  }
}