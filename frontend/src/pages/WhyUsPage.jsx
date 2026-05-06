import { MessageCircle, CheckCircle, X } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import PublicNavbar from '../components/PublicNavbar'

const WA = 'https://wa.me/917012783442?text=Hi%2C%20I%20want%20to%20get%20ZeleraDeck%20for%20my%20shop'

const COMPARISON = [
  { feature: 'Works on WhatsApp', zelera: true,  paper: false, others: false },
  { feature: 'No technical skills needed', zelera: true,  paper: true,  others: false },
  { feature: 'Update products anytime', zelera: true,  paper: false, others: true  },
  { feature: 'Share via link or QR code', zelera: true,  paper: false, others: true  },
  { feature: 'Local support in Malayalam', zelera: true,  paper: false, others: false },
  { feature: 'Affordable (from ₹799/mo)', zelera: true,  paper: false, others: false },
  { feature: 'No commission on sales',     zelera: true,  paper: true,  others: false },
  { feature: 'Set up in under 30 minutes', zelera: true,  paper: false, others: false },
]

const REASONS = [
  { emoji: '🇮🇳', title: 'Made for Kerala Shops', desc: 'Built by a Kerala team, for Kerala shop owners. We understand how local businesses work — from kirana stores to boutiques.' },
  { emoji: '💬', title: 'WhatsApp-First', desc: 'Your customers already use WhatsApp every day. ZeleraDeck fits right into their routine — no new app to download.' },
  { emoji: '🛠️', title: 'No Tech Knowledge Needed', desc: 'If you can send a WhatsApp message, you can manage your ZeleraDeck catalogue. Simple as that.' },
  { emoji: '💰', title: 'Truly Affordable', desc: 'Starting at just ₹799/month — less than the cost of printing paper catalogues. No hidden fees, no commissions.' },
  { emoji: '🤝', title: 'Local Support', desc: `Our support team responds in English and Malayalam. We're just a WhatsApp message away — always.` },
]

const TESTIMONIALS = [
  { shop: 'Mia Fashion Hub', owner: 'Mia Thomas', location: 'Thrissur', text: 'Our customers keep sharing our catalogue link with their friends. Orders have gone up a lot since we joined ZeleraDeck.' },
  { shop: 'Krishna Textiles', owner: 'Krishnan P.', location: 'Kozhikode', text: 'Setting up was so easy. The team helped us with everything on WhatsApp. Now all our sarees are online!' },
  { shop: 'Beena Sarees', owner: 'Beena Nair', location: 'Kochi', text: 'I used to hand out paper lists to customers. Now I just send one link on WhatsApp. Game changer for my shop.' },
]

export default function WhyUsPage() {
  return (
    <>
      <SEOHead
        title="Why Choose ZeleraDeck — Digital Catalogue for Kerala Shops"
        description="See why Kerala shop owners choose ZeleraDeck over paper catalogues and other tools. WhatsApp-first, affordable, local support, no tech skills needed."
        url="https://zeleradeck.com/why-us"
        keywords="why zeleradeck, digital catalogue Kerala, WhatsApp shop Kerala, best catalogue app India, ZeleraDeck vs others"
      />
      <div className="bg-[#F8F8F8] min-h-screen pb-16" style={{ animation: 'fadeIn 0.15s ease-out' }}>
        <PublicNavbar />

        <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">

          {/* Page heading */}
          <section aria-labelledby="why-heading" className="text-center">
            <h1 id="why-heading" className="text-3xl font-black text-[#0A0A0A]">Why Choose ZeleraDeck?</h1>
            <p className="text-sm text-[#737373] mt-3 max-w-md mx-auto leading-relaxed">
              We're not just another app. We're built for Kerala's local shop owners — affordable, simple, and WhatsApp-native.
            </p>
          </section>

          {/* Comparison table */}
          <section aria-labelledby="compare-heading">
            <h2 id="compare-heading" className="text-lg font-bold text-[#0A0A0A] mb-4">How we compare</h2>
            <div className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-4 bg-[#F8F8F8] border-b border-[#F0F0F0] px-4 py-3">
                <span className="text-xs font-semibold text-[#737373] col-span-1">Feature</span>
                <span className="text-xs font-bold text-[#0A0A0A] text-center">ZeleraDeck</span>
                <span className="text-xs font-semibold text-[#737373] text-center">Paper Catalogue</span>
                <span className="text-xs font-semibold text-[#737373] text-center">Other Tools</span>
              </div>
              {COMPARISON.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-4 px-4 py-3 items-center ${i < COMPARISON.length - 1 ? 'border-b border-[#F8F8F8]' : ''}`}
                >
                  <span className="text-xs text-[#404040] pr-2 leading-snug">{row.feature}</span>
                  <div className="flex justify-center">
                    {row.zelera
                      ? <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                      : <X className="w-4 h-4 text-[#D4D4D4]" />}
                  </div>
                  <div className="flex justify-center">
                    {row.paper
                      ? <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                      : <X className="w-4 h-4 text-[#D4D4D4]" />}
                  </div>
                  <div className="flex justify-center">
                    {row.others
                      ? <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                      : <X className="w-4 h-4 text-[#D4D4D4]" />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key reasons */}
          <section aria-labelledby="reasons-heading">
            <h2 id="reasons-heading" className="text-lg font-bold text-[#0A0A0A] mb-4">5 reasons Kerala shops love us</h2>
            <div className="space-y-3">
              {REASONS.map((r) => (
                <article key={r.title} className="bg-white rounded-2xl border border-[#F0F0F0] p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F8F8F8] rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                    {r.emoji}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0A0A0A]">{r.title}</h3>
                    <p className="text-sm text-[#737373] mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section aria-labelledby="testimonials-heading">
            <h2 id="testimonials-heading" className="text-lg font-bold text-[#0A0A0A] mb-4">What shop owners say</h2>
            <div className="space-y-3">
              {TESTIMONIALS.map((t) => (
                <article key={t.shop} className="bg-white rounded-2xl border border-[#F0F0F0] p-5">
                  <p className="text-sm text-[#404040] leading-relaxed">"{t.text}"</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#F0F0F0] rounded-full flex items-center justify-center text-xs font-bold text-[#737373]">
                      {t.owner.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0A0A0A]">{t.owner}</p>
                      <p className="text-xs text-[#A3A3A3]">{t.shop} · {t.location}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="bg-[#0A0A0A] rounded-2xl p-8 text-center">
            <h2 className="text-xl font-black text-white">Ready to go digital?</h2>
            <p className="text-sm text-white/60 mt-2">Join Kerala shops already growing with ZeleraDeck.</p>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              id="whyus-wa-cta"
              className="mt-6 inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-[#1ebe5d] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Get Started on WhatsApp
            </a>
            <p className="text-xs text-white/30 mt-4">No online payment needed. Just WhatsApp or call us.</p>
          </section>
        </main>
      </div>
    </>
  )
}
