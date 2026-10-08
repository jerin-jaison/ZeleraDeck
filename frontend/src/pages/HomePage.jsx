import { siteTitle, description, keywords, organization } from '../config/company'
import SEOHead from '../components/SEOHead'

export default function HomePage() {

  return (
    <>
      <SEOHead
        title={siteTitle}
        description={description}
        url="https://zeleradeck.com"
        keywords={keywords}
        schema={organization}
      />
      <div className="w-full h-screen overflow-hidden bg-[#0A0A0A]">
        <iframe
          src="/landing.html"
          title="ZeleraDeck Landing Page"
          className="w-full h-full border-0"
          style={{ width: '100vw', height: '100vh', border: 'none' }}
        />
      </div>
    </>
  )
}
