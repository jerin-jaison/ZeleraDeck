import { capabilities, recognition } from '../config/company'
export function AISection() {
  return <section className="px-4 py-16 max-w-5xl mx-auto" aria-labelledby="ai-heading">
    <span className="zdeck-section-badge">AI-native vision</span>
    <h2 id="ai-heading" className="zdeck-section-title mt-3">Practical AI for Kerala businesses</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
      {capabilities.map(item => <article className="zdeck-feature-card" key={item.title}>
        <span className="zdeck-section-badge">{item.status}</span>
        <h3 className="zdeck-card-title mt-3">{item.title}</h3>
        <p className="zdeck-card-desc mt-2">{item.description}</p>
      </article>)}
    </div>
  </section>
}
export function RecognitionSection() {
  if (!recognition.length) return null
  return <section className="px-4 py-16 max-w-5xl mx-auto" aria-labelledby="recognition-heading">
    <h2 id="recognition-heading" className="zdeck-section-title">Publications, Grants and Recognition</h2>
    <p className="zdeck-section-sub mt-4">Our official registrations and published milestones.</p>
    {[...new Set(recognition.map(item => item.type))].map(type => <div key={type} className="mt-6">
      <h3 className="zdeck-card-title capitalize">{type}</h3>
      <ul className="mt-3 space-y-3">{recognition.filter(item => item.type === type).map(item => <li key={item.url + item.title}>
        <a className="underline" href={item.url} target="_blank" rel="noopener noreferrer">{item.title} ↗</a>
        <p className="zdeck-card-desc">{item.issuer} · {item.year}</p>
      </li>)}</ul>
    </div>)}
  </section>
}
