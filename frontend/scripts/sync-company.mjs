import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { company, siteTitle, description, keywords, registrationLabel, recognition, capabilities, organization } from '../src/config/company.js'
const root = fileURLToPath(new URL('../../', import.meta.url))
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
const link = (url, label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`
function block(text, name, content, anchor) {
  const start = `<!-- company:${name}:start -->`, end = `<!-- company:${name}:end -->`
  const next = `${start}\n${content}\n${end}`
  if (text.includes(start)) return text.replace(new RegExp(`${start}[\\s\\S]*?${end}`), next)
  if (!text.includes(anchor)) throw new Error(`Missing anchor for ${name}`)
  return text.replace(anchor, `${next}\n${anchor}`)
}
function update(file, transform) {
  const path = root + file
  writeFileSync(path, transform(readFileSync(path, 'utf8')), 'utf8')
}
const styles = `<style>
.company-section { padding: 4rem var(--gut); max-width: var(--max-w); margin: auto; }
.company-section h2 { font-family: var(--font-serif); font-size: clamp(1.8rem,4vw,3rem); margin-bottom: 1.5rem; }
.company-section h3 { margin: 1rem 0 .75rem; font-size: 1.1rem; }
.company-section p { color: var(--muted-ivory); line-height: 1.7; }
.company-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,260px),1fr)); gap: 2rem; }
.company-status { color: var(--chartreuse); font-family: var(--font-mono); font-size: .8rem; }
.company-section a, .company-footer a { color: var(--chartreuse); text-decoration: underline; }
.company-footer p:first-child a { display: inline-block; padding: .5rem .75rem; border: 1px solid var(--bdr-ivory); }
.company-footer { padding: 1.5rem var(--gut); line-height: 1.8; overflow-wrap: anywhere; }
.company-hero { max-width: 46rem; margin: 1.5rem auto; padding: 0 1rem; line-height: 1.6; }
.company-hero h1 { font-size: clamp(1.25rem,3vw,2rem); margin-bottom: .75rem; }
</style>`
const ai = `<section class="company-section" id="ai" aria-labelledby="ai-heading"><h2 id="ai-heading">Practical AI for Kerala businesses</h2><div class="company-grid">${capabilities.map(item => `<article><span class="company-status">${item.status}</span><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p></article>`).join('')}</div></section>`
const recognitionHtml = recognition.length ? `<section class="company-section" id="recognition" aria-labelledby="recognition-heading"><h2 id="recognition-heading">Publications, Grants and Recognition</h2>${[...new Set(recognition.map(item => item.type))].map(type => `<h3>${escape(type[0].toUpperCase() + type.slice(1))}</h3>${recognition.filter(item => item.type === type).map(item => `<p>${link(item.url, item.title)} — ${escape(item.issuer)} · ${item.year}</p>`).join('')}`).join('')}</section>` : ''
for (const file of ['index.html', 'new_index.html', 'frontend/public/landing.html', 'frontend/index.html']) {
  update(file, text => {
    text = text.replace(/<title>.*?<\/title>/, `<title>${siteTitle}</title>`)
    text = text.replace(/(<meta\s+(?:name|property)="(?:description|og:description|twitter:description)"\s+content=")[^"]*/g, `$1${description}`)
    text = text.replace(/(<meta\s+(?:name|property)="(?:title|og:title|twitter:title)"\s+content=")[^"]*/g, `$1${siteTitle}`)
    text = text.replace(/(<meta name="keywords" content=")[^"]*/, `$1${keywords}`)
    if (file === 'frontend/index.html') return text
    text = block(text, 'seo', `<link rel="canonical" href="https://zeleradeck.com/">\n<meta name="keywords" content="${keywords}">\n<meta property="og:title" content="${siteTitle}">\n<meta property="og:description" content="${description}">\n<meta property="og:type" content="website">\n<meta property="og:url" content="https://zeleradeck.com/">\n<meta property="og:image" content="https://zeleradeck.com/logo-zd-nobg.png">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${siteTitle}">\n<meta name="twitter:description" content="${description}">\n<meta name="twitter:image" content="https://zeleradeck.com/logo-zd-nobg.png">\n<script type="application/ld+json">${JSON.stringify(organization)}</script>\n${styles}`, '</head>')
    text = block(text, 'hero', '<div class="company-hero"><h1>An AI-native vision for Kerala’s small businesses.</h1><p>Your WhatsApp-first storefront is live today. <strong>Roadmap:</strong> Agentic AI, Physical AI and practical AI applications to help your shop grow.</p></div>', '      <!-- GLASSMORPHISM SCROLL TO KNOW MORE BUTTON -->')
    text = block(text, 'sections', ai + '\n' + recognitionHtml, '  <!-- FOOTER -->')
    return block(text, 'footer', `<div class="company-footer"><p>${link(company.registrationUrl, registrationLabel)}</p><p>${company.profile}</p><a href="mailto:${company.email}">${company.email}</a></div>`, '  </footer>')
  })
}
for (const file of ['README.md', 'frontend/public/llms.txt']) update(file, text => {
  const facts = `${company.name}: ${company.profile}\nUdyam registration number: ${company.udyam}\nOfficial portal: ${company.registrationUrl}\nBusiness email: ${company.email}\n\n${description}\n\n${capabilities.map(item => `${item.status} — ${item.title}: ${item.description}`).join('\n\n')}`
  const marker = '<!-- company:facts:start -->'
  if (!text.includes(marker)) text += '\n\n<!-- company:facts:anchor -->\n'
  return block(text, 'facts', facts, '<!-- company:facts:anchor -->')
})
