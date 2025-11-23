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
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.zillow.com/',
      },
    });
    
    if (!response.ok) {
      // If fetch fails, fall back to redirect
      return NextResponse.redirect(finalUrl, 301);
    }
    
    const html = await response.text();
    
    // Return the HTML content with appropriate headers
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    // If there's an error fetching, fall back to redirect
    console.error('Error fetching Zillow content:', error);
    return NextResponse.redirect(finalUrl, 301);
  }
}

