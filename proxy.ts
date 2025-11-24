import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Handle root path - fetch and return zillow.com content
  if (pathname === '/') {
    const searchParams = url.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    const zillowUrl = `https://www.zillow.com/${queryString}`;
    
    try {
      const response = await fetch(zillowUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://www.zillow.com/',
          'Origin': 'https://www.zillow.com',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Cache-Control': 'max-age=0',
        },
      });
      
      if (!response.ok) {
        return new NextResponse(
          `Failed to fetch Zillow content. Status: ${response.status}`,
          { status: response.status }
        );
      }
      
      const html = await response.text();
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    } catch (error) {
      return new NextResponse(
        `Error fetching Zillow content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { status: 500 }
      );
    }
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
    // If less than 2 segments, fetch and return zillow.com root
    try {
      const response = await fetch('https://www.zillow.com/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://www.zillow.com/',
          'Origin': 'https://www.zillow.com',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Cache-Control': 'max-age=0',
        },
      });
      
      if (!response.ok) {
        return new NextResponse(
          `Failed to fetch Zillow content. Status: ${response.status}`,
          { status: response.status }
        );
      }
      
      const html = await response.text();
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    } catch (error) {
      return new NextResponse(
        `Error fetching Zillow content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { status: 500 }
      );
    }
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

  // Fetch and return Zillow content
  try {
    const response = await fetch(finalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.zillow.com/',
        'Origin': 'https://www.zillow.com',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Cache-Control': 'max-age=0',
      },
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

    const html = await response.text();

    // Return the HTML content directly
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    return new NextResponse(
      `Error fetching content from Zillow: ${error instanceof Error ? error.message : 'Unknown error'}\n\nTarget URL: ${finalUrl}`,
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

