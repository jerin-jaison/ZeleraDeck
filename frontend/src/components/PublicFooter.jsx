import { Link } from 'react-router-dom'
import CompanyBadge from './CompanyBadge'
import { company } from '../config/company'
export default function PublicFooter() {
  return (<footer className="bg-[#0F172A] border-t border-white/8 px-4 py-10">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/logo-zd-nobg.png" alt="ZeleraDeck" className="w-10 h-10 object-contain" />
              <div>
                <span className="text-sm font-bold text-white block" style={{ fontFamily: "'Poppins', sans-serif" }}>ZeleraDeck</span>
                <span className="text-xs text-[#475569]">Where we grow together</span>
              </div>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer navigation">
              {[['Home', '/'], ['About', '/about'], ['Why Us', '/why-us'], ['Contact', '/contact']].map(([l, t]) => (
                <Link key={t} to={t} className="text-xs text-[#475569] hover:text-white transition-colors">{l}</Link>
              ))}
            </nav>
            <p className="text-xs text-[#334155]">© {new Date().getFullYear()} ZeleraDeck</p>
          </div>
          <div className="max-w-5xl mx-auto mt-6 space-y-3 text-center text-sm text-slate-300">
            <p><CompanyBadge /></p>
            <p><a href={`mailto:${company.email}`}>{company.email}</a></p>
          </div>
        </footer>)
}
