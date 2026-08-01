import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircle, BarChart2, Package, Zap, Users, Globe, CheckCircle,
  ArrowRight, Star, ShieldCheck, TrendingUp, Smartphone
} from 'lucide-react'
import SEOHead from '../components/SEOHead'
import PublicNavbar from '../components/PublicNavbar'

const WA = 'https://wa.me/917012783442?text=Hi%2C%20I%20want%20to%20get%20ZeleraDeck%20for%20my%20shop'

const FEATURES = [
  {
    icon: Zap,
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.12)',
    title: 'Easy Onboarding',
    desc: 'Set up your shop in minutes. No coding, no complexity — just your products, live.',
  },
  {
    icon: MessageCircle,
    color: '#25D366',
    bg: 'rgba(37,211,102,0.12)',
    title: 'WhatsApp Integrated',
    desc: 'Sell directly on WhatsApp. Orders flow in automatically from your catalogue link.',
  },
  {
    icon: BarChart2,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
    title: 'Real-time Analytics',
    desc: 'See your sales, inventory, and customers in one beautifully simple dashboard.',
  },
]

export default function OldHomePage() {
  return (
    <>
      <SEOHead
        title="ZeleraDeck — Where We Grow Together (Legacy)"
        description="ZeleraDeck gives Kerala shop owners a beautiful digital catalogue with a shareable link and WhatsApp ordering. No website needed. Set up in minutes."
        url="https://zeleradeck.com/old-home"
        keywords="digital catalogue Kerala, WhatsApp catalogue shop, ZeleraDeck"
      />

      <div className="zdeck-page bg-[#F8FAFC] min-h-screen">
        <PublicNavbar transparent={true} />

        <main>
          <section className="zdeck-hero relative overflow-hidden min-h-screen flex flex-col justify-center bg-[#0F172A]">
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20 text-center">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                Your Shop.{' '}
                <span className="zdeck-gradient-text">Online.</span>
                <br />
                In Minutes.
              </h1>
              <p className="mt-8 text-[#94A3B8] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                ZeleraDeck gives Kerala shop owners a beautiful digital storefront with WhatsApp ordering — no website, no app, no hassle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <a
                  href={WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zdeck-btn-primary flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl"
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  Get Started on WhatsApp
                </a>
                <Link
                  to="/"
                  className="zdeck-btn-ghost flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-semibold rounded-xl"
                >
                  Go to New Interactive Deck
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
