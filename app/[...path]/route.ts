import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Get the path segments
  const pathSegments = params.path || [];
  
  if (pathSegments.length === 0) {
    // If no path, redirect to zillow.com root
    return NextResponse.redirect('https://www.zillow.com/', 308);
  }
  
  // Extract address (first segment) and zpid (last segment)
  // Format: /{address}/{id1}/{id2}_zpid/
  const address = pathSegments[0];
  const lastSegment = pathSegments[pathSegments.length - 1];
  
  // Construct the Zillow homedetails URL
  // Format: https://www.zillow.com/homedetails/{address}/{zpid}/
  const zillowUrl = `https://www.zillow.com/homedetails/${address}/${lastSegment}/`;
  
  // Get query parameters if any
  const searchParams = request.nextUrl.searchParams.toString();
  const finalUrl = searchParams ? `${zillowUrl}?${searchParams}` : zillowUrl;
  
  // Perform a permanent redirect (308) as it preserves the request method
  return NextResponse.redirect(finalUrl, 308);
}

