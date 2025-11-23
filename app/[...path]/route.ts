import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Get the path segments
  const pathSegments = params.path || [];
  
  // Join the path segments with '/'
  const path = pathSegments.join('/');
  
  // Get query parameters if any
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  
  // Construct the Zillow URL with path and query parameters
  const zillowUrl = `https://zillow.com/${path}${queryString}`;
  
  // Perform a permanent redirect (308) as it preserves the request method
  return NextResponse.redirect(zillowUrl, 308);
}

