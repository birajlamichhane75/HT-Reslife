/**
 * Utility to extract and manage image flyers from native columns or embedded text markers
 */
export function parseImageFromText(
  imageUrl: string | null | undefined,
  bodyOrDescription: string | null | undefined
): { imageUrl: string | null; cleanText: string } {
  if (imageUrl && imageUrl.trim()) {
    const cleaned = (bodyOrDescription || '')
      .replace(/\[image:\s*(https?:\/\/[^\s\]]+)\]/gi, '')
      .replace(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/gi, '')
      .trim()
    return { imageUrl: imageUrl.trim(), cleanText: cleaned }
  }

  if (!bodyOrDescription) {
    return { imageUrl: null, cleanText: '' }
  }

  const match =
    bodyOrDescription.match(/\[image:\s*(https?:\/\/[^\s\]]+)\]/i) ||
    bodyOrDescription.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/i)

  if (match && match[1]) {
    const extractedUrl = match[1].trim()
    const cleaned = bodyOrDescription
      .replace(/\[image:\s*(https?:\/\/[^\s\]]+)\]/gi, '')
      .replace(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/gi, '')
      .trim()
    return { imageUrl: extractedUrl, cleanText: cleaned }
  }

  return { imageUrl: null, cleanText: bodyOrDescription }
}

