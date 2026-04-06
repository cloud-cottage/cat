const CACHE_CONTROL = 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400'

function normalizeTwitterHandle(input) {
  const rawValue = Array.isArray(input) ? input[0] : input
  if (!rawValue || typeof rawValue !== 'string') {
    return ''
  }

  const trimmedValue = rawValue.trim()
  const withoutProfileUrl = trimmedValue.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, '')
  const withoutAt = withoutProfileUrl.replace(/^@/, '')

  return withoutAt
    .split('/')[0]
    .split('?')[0]
    .split('#')[0]
    .trim()
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#x3D;/gi, '=')
    .replace(/&#61;/g, '=')
}

function extractMetaContent(html, attribute, name) {
  const directPattern = new RegExp(
    `<meta[^>]+${attribute}=["']${name}["'][^>]+content=["']([^"']+)["']`,
    'i'
  )
  const reversePattern = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${name}["']`,
    'i'
  )

  const directMatch = html.match(directPattern)
  if (directMatch?.[1]) {
    return decodeHtmlEntities(directMatch[1])
  }

  const reverseMatch = html.match(reversePattern)
  if (reverseMatch?.[1]) {
    return decodeHtmlEntities(reverseMatch[1])
  }

  return ''
}

function extractAvatarUrlFromHtml(html) {
  const metaCandidates = [
    extractMetaContent(html, 'property', 'og:image'),
    extractMetaContent(html, 'name', 'twitter:image'),
    extractMetaContent(html, 'property', 'twitter:image'),
  ].filter(Boolean)

  if (metaCandidates.length > 0) {
    return metaCandidates[0]
  }

  const inlineMatch = html.match(/https:\/\/pbs\.twimg\.com\/profile_images\/[^"'&<>\s]+/i)
  if (inlineMatch?.[0]) {
    return decodeHtmlEntities(inlineMatch[0])
  }

  return ''
}

function redirectToAvatar(res, avatarUrl) {
  res.setHeader('Cache-Control', CACHE_CONTROL)
  return res.redirect(302, avatarUrl)
}

async function tryResolveAvatarFromUrl(url) {
  const response = await fetch(url, {
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    },
    redirect: 'follow'
  })

  if (!response.ok) {
    return ''
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.startsWith('image/')) {
    return response.url
  }

  const html = await response.text()
  return extractAvatarUrlFromHtml(html)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const handle = normalizeTwitterHandle(req.query.handle)
  if (!handle) {
    return res.status(400).json({ error: 'Missing twitter handle' })
  }

  const xPhotoUrl = `https://x.com/${encodeURIComponent(handle)}/photo`
  const legacyProfileImageUrl = `https://twitter.com/${encodeURIComponent(handle)}/profile_image?size=original`
  const fallbackAvatarUrl = `https://unavatar.io/twitter/${encodeURIComponent(handle)}`

  try {
    const xAvatarUrl = await tryResolveAvatarFromUrl(xPhotoUrl)
    if (xAvatarUrl) {
      return redirectToAvatar(res, xAvatarUrl)
    }
  } catch (error) {
    console.error('Failed to resolve X profile photo:', error)
  }

  try {
    const legacyAvatarUrl = await tryResolveAvatarFromUrl(legacyProfileImageUrl)
    if (legacyAvatarUrl) {
      return redirectToAvatar(res, legacyAvatarUrl)
    }
  } catch (error) {
    console.error('Failed to resolve legacy Twitter profile image:', error)
  }

  return redirectToAvatar(res, fallbackAvatarUrl)
}
