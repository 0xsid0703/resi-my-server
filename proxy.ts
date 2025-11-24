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
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Parse the path segments
  // Format: /{address}/{id}/{ignored}_zpid/
  const pathSegments = pathname.split('/').filter(Boolean);

  // Validate we have at least 2 segments
  if (pathSegments.length < 2) {
    return new NextResponse(
      `Invalid path format. Expected: /{address}/{id}/{zpid}/\n\nReceived: ${pathname}`,
      {
        status: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
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

  try {
    // Fetch the content from Zillow and proxy it
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.zillow.com/',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return new NextResponse(
        `Failed to fetch Zillow content. Status: ${response.status} ${response.statusText}\n\nTarget URL: ${finalUrl}`,
        {
          status: response.status,
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      );
    }

    // Get the HTML content
    const html = await response.text();

    // Verify we got content
    if (!html || html.length === 0) {
      return new NextResponse(
        `Received empty response from Zillow\n\nTarget URL: ${finalUrl}`,
        {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      );
    }

    // Return the HTML content directly - NO REDIRECT
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Proxy-Target': finalUrl,
      },
    });
  } catch (error) {
    // Return error message - NO REDIRECT
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(
      `Error fetching content from Zillow: ${errorMessage}\n\nTarget URL: ${finalUrl}`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
  }
}

// Match all paths except static files and API routes
// Note: We handle root path in the proxy function itself
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

