export const company = {
  name: 'ZeleraDeck',
  email: 'jerin@zeleradeck.com',
  udyam: 'UDYAM-KL-03-0043929',
  registrationUrl: 'https://udyamregistration.gov.in/',
  profile: 'Micro enterprise (proprietorship, services sector). Jerin Jaison is the proprietor and sole founder.',
}
export const siteTitle = 'ZeleraDeck — AI-native storefronts for Kerala'
export const description = 'WhatsApp-first storefronts for small businesses in Kerala, with an AI-native vision. Explore our Roadmap for Agentic AI, Physical AI and practical AI applications.'
export const keywords = 'ZeleraDeck, AI, Agentic AI, Physical AI, AI applications, Kerala small businesses, WhatsApp-first storefront'
export const registrationLabel = `Govt. of India MSME Registered – Udyam No. ${company.udyam}`
export const recognition = [
  { title: 'Udyam Registration (MSME)', issuer: 'Ministry of MSME, Government of India', year: 2026, url: company.registrationUrl, type: 'recognition' },
]
export const capabilities = [
  { title: 'Your WhatsApp-first storefront', status: 'Live', description: 'Manage products and categories, share your catalogue, take orders through WhatsApp and print a shop QR code.' },
  { title: 'A starting point for AI applications', status: 'Live', description: 'Pro admin includes a copyable image-prompt helper for external AI tools. It creates prompt text; image generation happens outside ZeleraDeck.' },
  { title: 'Agentic AI for everyday shop work', status: 'Roadmap', description: 'Assistants to organise catalogues, draft product descriptions, suggest pricing and handle WhatsApp customer enquiries.' },
  { title: 'Physical AI for your local shop', status: 'Roadmap', description: 'Link physical shops with digital intelligence through QR smart shelf tags, in-store kiosk mode and camera-based inventory scanning. These are planned; the live shop QR code links to the catalogue.' },
]
export const organization = {
  '@context': 'https://schema.org', '@type': 'Organization', name: company.name,
  url: 'https://zeleradeck.com', logo: 'https://zeleradeck.com/logo-zd-nobg.png',
  description: `${description} ${company.profile}`, keywords, email: company.email,
  telephone: '+917012783442', founder: { '@type': 'Person', name: 'Jerin Jaison' },
  identifier: { '@type': 'PropertyValue', propertyID: 'Udyam Registration', value: company.udyam },
  address: { '@type': 'PostalAddress', addressRegion: 'Kerala', addressCountry: 'IN' },
}
