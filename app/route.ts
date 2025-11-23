import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get query parameters if any
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  
  // Redirect root path to zillow.com with query parameters
  return NextResponse.redirect(`https://www.zillow.com/${queryString}`, 308);
}

