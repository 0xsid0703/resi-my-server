import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Get the path segments
  const pathSegments = params.path || [];
  
  if (pathSegments.length === 0) {
    // If no path, redirect to zillow.com root
    return NextResponse.redirect('https://www.zillow.com/', {
      status: 301,
      headers: {
        'Location': 'https://www.zillow.com/',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
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
  
  // Use 301 (Permanent Redirect) - more widely supported by scrapers
  // Set explicit headers to ensure scrapers follow the redirect
  return NextResponse.redirect(finalUrl, {
    status: 301,
    headers: {
      'Location': finalUrl,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

