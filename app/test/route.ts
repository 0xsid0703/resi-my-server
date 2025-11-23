import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('TEST ROUTE WORKS! If you see this, the routes are working.', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

