import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Handle root path - redirect to zillow.com
  if (pathname === '/') {
    const searchParams = url.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    const redirectUrl = `https://www.zillow.com/${queryString}`;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Skip static files and API routes - let Next.js handle them
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/i)
  ) {
    return NextResponse.next();
  }

  // Parse the path segments
  // Format: /{address}/{id}/{ignored}_zpid/
  const pathSegments = pathname.split('/').filter(Boolean);

  // Validate we have at least 2 segments
  if (pathSegments.length < 2) {
    // If less than 2 segments, redirect to zillow.com root
    return NextResponse.redirect('https://www.zillow.com/', 301);
  }

  // Extract address (first segment) and ID (second segment)
  const address = pathSegments[0];
  const id = pathSegments[1];

  // Construct the Zillow homedetails URL
  // Format: https://www.zillow.com/homedetails/{address}/{id}_zpid/
  const zillowUrl = `https://www.zillow.com/homedetails/${address}/${id}_zpid/`;

  // Get query parameters if any
  const searchParams = url.searchParams.toString();
  const finalUrl = searchParams ? `${zillowUrl}?${searchParams}` : zillowUrl;

  // Redirect to Zillow
  return NextResponse.redirect(finalUrl, 301);
}

// Match all paths except static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

