import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get query parameters if any
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  
  // Redirect root path to zillow.com with query parameters
  const redirectUrl = `https://www.zillow.com/${queryString}`;
  return NextResponse.redirect(redirectUrl, {
    status: 301,
    headers: {
      'Location': redirectUrl,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

