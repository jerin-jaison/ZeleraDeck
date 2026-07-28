/**
 * Shared AI Image Prompt Generator
 * Generates tailored, copyable prompts for AI image tools (ChatGPT / DALL-E / Midjourney / Flux).
 */
export function generateAiImagePrompt({
  shopName = 'Store',
  slotName = 'Product Media',
  dimensions = '1920×1080',
  aspectRatio = '16:9 landscape',
  contextText = '',
}) {
  const brand = shopName.trim() || 'Boutique Store'
  const subject = contextText.trim()
    ? `highlighting "${contextText.trim()}"`
    : `expressing the refined aesthetic of ${brand}`

  return `High-end editorial commercial photography for ${brand}, ${subject}. Ultra-clean minimalist composition, soft natural studio lighting, warm neutral tones, cinematic depth of field, premium luxury boutique aesthetic. Designed for ${slotName}. Format: ${dimensions} (${aspectRatio}). Photorealistic, 8k resolution, elegant, no text overlay.`
}
