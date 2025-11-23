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
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.zillow.com/',
        'Origin': 'https://www.zillow.com',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
      },
      // Don't follow redirects - we want the actual response
      redirect: 'follow',
    });
    
    // Get the response status and content
    const status = response.status;
    const html = await response.text();
    
    // Return the HTML content with appropriate headers
    // Even if status is not 200, return the content (some sites return 200 with content)
    return new NextResponse(html, {
      status: status >= 200 && status < 300 ? status : 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    // If there's an error fetching, return an error message instead of redirecting
    console.error('Error fetching Zillow content:', error);
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

