import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { MapPin, Clock, Mail, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../api/axios';
import SEOHead from '../components/SEOHead';

// ── Hook: fetch contact info without JWT ─────────────────────────────────────
function useProContactInfo(slug) {
  return useQuery({
    queryKey: ['pro-contact', slug],
    queryFn: async () => {
      if (!slug) throw new Error('slug required');
      const res = await publicApi.get(`pro/${slug}/contact/`);
      return res.data;
    },
    enabled: !!slug,
    staleTime: 60 * 1000,
  });
}

// ── Helper: build address string from individual fields ──────────────────────
function buildAddress(c) {
  const parts = [
    c.address_line1,
    c.address_line2,
    c.city && c.postal_code ? `${c.city} — ${c.postal_code}` : c.city || c.postal_code,
    c.state,
    c.country !== 'India' ? c.country : null,  // 'India' is the default, omit if it's just the default
  ].filter(Boolean);
  return parts;
}

// ── Day label helpers ────────────────────────────────────────────────────────
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Group consecutive days with the same hours into a range label
function groupHours(contact) {
  const entries = DAY_KEYS.map((k, i) => ({
    label: DAY_LABELS[i],
    hours: contact[`hours_${k}`] || '',
  }));

  const groups = [];
  let i = 0;
  while (i < entries.length) {
    const current = entries[i];
    let j = i + 1;
    while (j < entries.length && entries[j].hours === current.hours) j++;
    const span = entries.slice(i, j);
    const label =
      span.length === 1
        ? span[0].label
        : `${span[0].label} — ${span[span.length - 1].label}`;
    groups.push({ label, hours: current.hours || 'Closed' });
    i = j;
  }
  return groups;
}

export function formatGoogleMapsEmbedUrl(input) {
  if (!input) return '';
  const trimmed = input.trim();

  // If user pasted iframe HTML like <iframe src="...">
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeMatch) return iframeMatch[1];

  // If already a proper embed URL
  if (trimmed.includes('google.com/maps/embed') || (trimmed.includes('maps.google.com/maps') && trimmed.includes('output=embed'))) {
    return trimmed;
  }

  // Extract place name if standard google.com/maps/place/
  if (trimmed.includes('google.com/maps/place/')) {
    const place = trimmed.split('google.com/maps/place/')[1]?.split('/')[0];
    if (place) {
      const decoded = decodeURIComponent(place.replace(/\+/g, ' '));
      return `https://maps.google.com/maps?q=${encodeURIComponent(decoded)}&output=embed`;
    }
  }

  // Extract query parameter if maps?q=
  if (trimmed.includes('google.com/maps') && trimmed.includes('q=')) {
    try {
      const urlObj = new URL(trimmed);
      const q = urlObj.searchParams.get('q');
      if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    } catch {
      // Ignore URL parse error
    }
  }

  // Fallback: format input query into working embed URL
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}

export default function ProContactPage() {
  const { storeData, slug } = useOutletContext();
  const shopName = storeData?.shop?.name || 'AESTHETE';

  const { data: contact, isLoading: contactLoading } = useProContactInfo(slug);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  // Derived values with graceful fallbacks
  const addressLines = contact ? buildAddress(contact) : [];
  const hasAddress = addressLines.length > 0;

  // WhatsApp: prefer override, fall back to shop.whatsapp_number
  const whatsappNum = contact?.whatsapp_override || storeData?.shop?.whatsapp_number || '';

  // Email: prefer ProContactInfo.email, no slug-derived fake fallback
  const email = contact?.email || '';

  // Phone: use contact.phone if set
  const phone = contact?.phone || '';

  // Business hours grouped
  const hourGroups = contact ? groupHours(contact) : [];
  const hasHours = contact && DAY_KEYS.some(k => contact[`hours_${k}`]);

  // Google Maps embed URL — sanitized & formatted for valid iframe rendering
  const mapsEmbedUrl = formatGoogleMapsEmbedUrl(contact?.google_maps_embed_url || '');

  // Directions fallback: if they've entered a city use that, else shop name
  const directionsQuery = contact?.city
    ? encodeURIComponent(`${shopName} ${contact.city}`)
    : encodeURIComponent(`${shopName}`);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${directionsQuery}`;

  // Social
  const instagram = contact?.instagram_url || '';
  const facebook = contact?.facebook_url || '';
  const youtube = contact?.youtube_url || '';
  const hasSocials = instagram || facebook || youtube;

  return (
    <div className="bg-[var(--pro-background)] py-12">
      <SEOHead
        title={`Contact Concierge — ${shopName}`}
        description={`Get directions, view opening hours, and contact our concierge service at ${shopName}.`}
        url={window.location.href}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-16">

        {/* Breadcrumb */}
        <div className="mb-10 text-xs pro-label-caps text-neutral-400">
          <Link to={`/${slug}`} className="hover:text-black">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black">Contact</span>
        </div>

        {/* Title */}
        <div className="border-b border-neutral-200/50 pb-6 mb-12">
          <h1 className="pro-headline-xl">Concierge &amp; Contact</h1>
        </div>

        {contactLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Left Column: contact details + map */}
            <div className="lg:col-span-7 space-y-12">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Address */}
                <div>
                  <h3 className="pro-label-caps text-xs text-neutral-400 mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Store Location
                  </h3>
                  <h4 className="pro-headline-sm text-lg mb-2">{shopName} Flagship</h4>
                  {hasAddress ? (
                    <address className="not-italic text-sm text-neutral-600 font-sans leading-relaxed">
                      {addressLines.map((line, i) => (
                        <span key={i}>{line}{i < addressLines.length - 1 && <br />}</span>
                      ))}
                    </address>
                  ) : (
                    <p className="text-sm text-neutral-400 font-sans italic">
                      Address not yet configured.
                    </p>
                  )}
                </div>

                {/* Business hours */}
                <div>
                  <h3 className="pro-label-caps text-xs text-neutral-400 mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Visiting Hours
                  </h3>
                  {hasHours ? (
                    <ul className="text-sm text-neutral-600 font-sans space-y-1.5">
                      {hourGroups.map((g, i) => (
                        <li key={i} className="flex justify-between gap-4">
                          <span>{g.label}</span>
                          <span className={g.hours === 'Closed' ? 'text-neutral-400' : ''}>{g.hours}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-neutral-400 font-sans italic">
                      Hours not yet configured.
                    </p>
                  )}
                </div>
              </div>

              {/* Direct channels: email, phone, WhatsApp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="pro-label-caps text-xs text-neutral-400 mb-3 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Direct Channels
                  </h3>
                  <div className="text-sm font-sans space-y-3">
                    {email ? (
                      <div>
                        <span className="text-[10px] pro-label-caps text-neutral-400 block mb-0.5">Email</span>
                        <a href={`mailto:${email}`} className="text-black hover:underline break-all">
                          {email}
                        </a>
                      </div>
                    ) : null}
                    {phone ? (
                      <div>
                        <span className="text-[10px] pro-label-caps text-neutral-400 block mb-0.5">Phone</span>
                        <a href={`tel:${phone}`} className="text-black hover:underline">{phone}</a>
                      </div>
                    ) : null}
                    {whatsappNum ? (
                      <div>
                        <span className="text-[10px] pro-label-caps text-neutral-400 block mb-0.5">WhatsApp Inquiry</span>
                        <span className="text-black">+{whatsappNum}</span>
                      </div>
                    ) : null}
                    {!email && !phone && !whatsappNum && (
                      <p className="text-neutral-400 italic">Contact details not yet configured.</p>
                    )}
                  </div>
                </div>

                {/* Social links — only when at least one is set */}
                {hasSocials && (
                  <div>
                    <h3 className="pro-label-caps text-xs text-neutral-400 mb-3 flex items-center gap-1.5">
                      Social
                    </h3>
                    <div className="flex flex-col gap-2.5 text-sm font-sans">
                      {instagram && (
                        <a href={instagram} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-black hover:opacity-60 transition-opacity">
                          <ExternalLink className="w-4 h-4" /> Instagram
                        </a>
                      )}
                      {facebook && (
                        <a href={facebook} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-black hover:opacity-60 transition-opacity">
                          <ExternalLink className="w-4 h-4" /> Facebook
                        </a>
                      )}
                      {youtube && (
                        <a href={youtube} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-black hover:opacity-60 transition-opacity">
                          <ExternalLink className="w-4 h-4" /> YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Google Maps embed — only when URL configured */}
              {mapsEmbedUrl ? (
                <div className="w-full aspect-[16/9] bg-neutral-100 border border-neutral-200">
                  <iframe
                    title="Google Maps Location"
                    src={mapsEmbedUrl}
                    className="w-full h-full border-0 grayscale opacity-90"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : (
                /* Placeholder map box when no URL set */
                <div className="w-full aspect-[16/9] bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                    <p className="text-xs pro-label-caps text-neutral-400">Map not configured</p>
                    <p className="text-xs text-neutral-400 font-sans mt-1">Add a Google Maps embed URL in the admin.</p>
                  </div>
                </div>
              )}

              {/* Get Directions */}
              {(hasAddress || contact?.city) && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pro-btn-outline inline-flex items-center gap-2"
                >
                  Get Directions <ExternalLink className="w-4 h-4" />
                </a>
              )}

            </div>

            {/* Right Column: inquiry form */}
            <div className="lg:col-span-5 bg-white border border-neutral-200/50 p-8">
              <h3 className="pro-headline-sm mb-6">Concierge Inquiry</h3>

              {formSubmitted ? (
                <div className="bg-neutral-50 p-6 text-center border border-neutral-100">
                  <h4 className="pro-label-caps text-xs text-black mb-2">Message Sent</h4>
                  <p className="text-sm text-neutral-500 font-sans">
                    Thank you for your inquiry. Our store concierge representative will follow up via email or message shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="contact-name" className="pro-label-caps text-[10px] text-neutral-400 block mb-1">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-transparent border-0 border-b border-neutral-200 py-2.5 focus:outline-none focus:border-black font-sans text-sm rounded-none"
                      placeholder="Enter name"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="pro-label-caps text-[10px] text-neutral-400 block mb-1">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-transparent border-0 border-b border-neutral-200 py-2.5 focus:outline-none focus:border-black font-sans text-sm rounded-none"
                      placeholder="Enter email"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="pro-label-caps text-[10px] text-neutral-400 block mb-1">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows="4"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full bg-transparent border-0 border-b border-neutral-200 py-2.5 focus:outline-none focus:border-black font-sans text-sm rounded-none resize-none"
                      placeholder="Your inquiry details..."
                    />
                  </div>

                  <button type="submit" className="w-full pro-btn-primary">
                    Send Inquiry
                  </button>
                </form>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
