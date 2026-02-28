export const config = {
  matcher: '/:path*',
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  // i.catcat.meme -> /i
  if (hostname === 'i.catcat.meme') {
    return NextResponse.rewrite(new URL('/i', request.url))
  }

  // username.catcat.meme -> /username
  if (hostname !== 'catcat.meme' && hostname !== 'www.catcat.meme' && hostname.endsWith('.catcat.meme')) {
    const username = hostname.replace('.catcat.meme', '')
    return NextResponse.rewrite(new URL(`/${username}`, request.url))
  }
}
