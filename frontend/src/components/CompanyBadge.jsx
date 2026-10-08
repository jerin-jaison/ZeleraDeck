import { company, registrationLabel } from '../config/company'
export default function CompanyBadge() {
  return <a className="inline-block border border-current rounded-lg px-3 py-2 text-sm" href={company.registrationUrl} target="_blank" rel="noopener noreferrer">{registrationLabel}</a>
}
