import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Get the path segments
  const pathSegments = params.path || [];
  
  if (pathSegments.length === 0) {
    // If no path, redirect to zillow.com root
    return NextResponse.redirect('https://www.zillow.com/', 301);
  }
  
  // Validate we have at least 2 segments
  if (pathSegments.length < 2) {
    return new NextResponse('Invalid path format. Expected: /{address}/{id}/{zpid}/', {
      status: 400,
    });
  }
  
  // Extract address (first segment) and ID (second segment)
  // Format: /{address}/{id}/{ignored}_zpid/
  // Output: https://www.zillow.com/homedetails/{address}/{id}_zpid/
  const address = pathSegments[0];
  const id = pathSegments[1];
  
  // Construct the Zillow homedetails URL
  // Format: https://www.zillow.com/homedetails/{address}/{id}_zpid/
  const zillowUrl = `https://www.zillow.com/homedetails/${address}/${id}_zpid/`;
  
  // Get query parameters if any
  const searchParams = request.nextUrl.searchParams.toString();
  const finalUrl = searchParams ? `${zillowUrl}?${searchParams}` : zillowUrl;
  
  try {
    // Fetch the content from Zillow and proxy it
    // This allows scrapers to get the actual content without following redirects
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.zillow.com/',
      },
      redirect: 'follow',
    });
    
    if (!response.ok) {
      // If response is not ok, return error with details
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(
      `Error fetching content from Zillow: ${errorMessage}\n\nTarget URL: ${finalUrl}\n\nThis is NOT a redirect - the proxy failed.`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
  }
}

