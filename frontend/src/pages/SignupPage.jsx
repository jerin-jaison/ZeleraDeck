import { MessageCircle, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import PublicNavbar from '../components/PublicNavbar'

const WA = 'https://wa.me/917012783442?text=Hi%2C%20I%20want%20to%20sign%20up%20for%20ZeleraDeck'

const STEPS = [
  { step: '1', label: 'WhatsApp us', desc: 'Send us a message on WhatsApp — we respond within 24 hours.' },
  { step: '2', label: 'We set up your account', desc: 'Our team creates your ZeleraDeck shop and sends you your login details.' },
  { step: '3', label: 'Add your products', desc: 'Upload your products with photos and prices — or we help you do it.' },
  { step: '4', label: 'Start sharing', desc: 'Share your catalogue link with customers and watch orders come in.' },
]

export default function SignupPage() {
  return (
    <>
      <SEOHead
        title="Sign Up — ZeleraDeck"
        description="Create your ZeleraDeck account via WhatsApp. Our team sets everything up for you. No online payment needed."
        url="https://zeleradeck.com/signup"
        keywords="zeleradeck signup, create shop Kerala, digital catalogue signup"
        noindex={false}
      />
      <div className="bg-[#F8F8F8] min-h-screen" style={{ animation: 'fadeIn 0.15s ease-out' }}>
        <PublicNavbar />

        <main className="max-w-lg mx-auto px-4 py-12">

          {/* Hero card */}
          <div className="bg-[#0A0A0A] rounded-2xl p-8 text-center mb-6">
            <img src="/logo-zd-nobg.png" alt="ZeleraDeck" className="w-14 h-14 rounded-2xl object-cover mx-auto" />
            <h1 className="text-2xl font-black text-white mt-4">Create Your Account</h1>
            <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-xs mx-auto">
              To get started with ZeleraDeck, contact us on WhatsApp. We'll set everything up for you personally — no forms, no hassle.
            </p>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              id="signup-wa-cta"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold text-sm py-4 rounded-xl hover:bg-[#1ebe5d] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Sign Up via WhatsApp
            </a>
            <p className="text-xs text-white/30 mt-4">We respond within 24 hours · Free to get started</p>
          </div>

          {/* How it works steps */}
          <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 mb-4">
            <p className="text-xs font-semibold text-[#737373] uppercase tracking-wide mb-4">What happens next</p>
            <div className="space-y-4">
              {STEPS.map((s, i) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-[#0A0A0A] rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0A0A0A]">{s.label}</p>
                    <p className="text-xs text-[#737373] mt-0.5">{s.desc}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="absolute" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Already have account */}
          <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0A0A0A]">Already have an account?</p>
              <p className="text-xs text-[#737373] mt-0.5">Sign in to manage your store</p>
            </div>
            <Link
              to="/login"
              id="signup-login-link"
              className="flex items-center gap-1.5 bg-[#F8F8F8] border border-[#E5E5E5] text-[#0A0A0A] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#F0F0F0] transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </Link>
          </div>
        </main>
      </div>
    </>
  )
}
