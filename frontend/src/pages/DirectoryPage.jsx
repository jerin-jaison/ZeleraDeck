import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Tag, Store, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react'
import axios from '../api/axios'
import SEOHead from '../components/SEOHead'

export default function DirectoryPage() {
  const [search, setSearch] = useState('')
  const [selectedTown, setSelectedTown] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-directory'],
    queryFn: async () => {
      const res = await axios.get('directory/')
      return res.data
    },
    staleTime: 60 * 1000,
  })

  const rawShops = data?.shops
  const towns = useMemo(() => ['All', ...(data?.towns || [])], [data?.towns])
  const categories = useMemo(() => ['All', ...(data?.categories || [])], [data?.categories])

  // Filter shops based on search, town, and category
  const filteredShops = useMemo(() => {
    const shops = rawShops || []
    return shops.filter((shop) => {
      const matchesSearch =
        !search.trim() ||
        shop.name.toLowerCase().includes(search.toLowerCase()) ||
        shop.category.toLowerCase().includes(search.toLowerCase()) ||
        shop.town.toLowerCase().includes(search.toLowerCase()) ||
        (shop.seo_description && shop.seo_description.toLowerCase().includes(search.toLowerCase()))

      const matchesTown = selectedTown === 'All' || shop.town.toLowerCase() === selectedTown.toLowerCase()
      const matchesCategory = selectedCategory === 'All' || shop.category.toLowerCase() === selectedCategory.toLowerCase()

      return matchesSearch && matchesTown && matchesCategory
    })
  }, [rawShops, search, selectedTown, selectedCategory])

  // Group filtered shops by Town
  const groupedByTown = useMemo(() => {
    const groups = {}
    filteredShops.forEach((shop) => {
      const t = shop.town || 'Kerala'
      if (!groups[t]) groups[t] = []
      groups[t].push(shop)
    })
    return groups
  }, [filteredShops])

  // Structured data: CollectionPage schema
  const directorySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ZeleraDeck Store Directory',
    description: 'Explore local boutiques, specialty stores, and verified merchants across Kerala on ZeleraDeck.',
    url: 'https://zeleradeck.com/directory',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: filteredShops.slice(0, 25).map((s, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://zeleradeck.com/${s.slug}`,
        name: s.name,
      })),
    },
  }

  return (
    <>
      <SEOHead
        title="Local Stores & Boutiques Directory"
        description="Discover verified local stores, boutiques, and merchants across Kerala. Browse catalogues, check prices, and order directly on WhatsApp with ZeleraDeck."
        url="https://zeleradeck.com/directory"
        schema={directorySchema}
        keywords="Kerala shops, local store directory, Kochi boutiques, WhatsApp shopping, Kerala online catalogue"
      />

      <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A]">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight">ZELERA<span className="font-light text-[#737373]">DECK</span></span>
              <span className="text-[10px] bg-[#F4F4F5] text-[#52525B] font-mono px-2 py-0.5 rounded-full border border-[#E4E4E7]">
                Directory
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/about" className="text-xs text-[#737373] hover:text-[#0A0A0A] transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-xs text-[#737373] hover:text-[#0A0A0A] transition-colors">
                Contact
              </Link>
              <Link
                to="/login"
                className="text-xs font-semibold bg-[#0A0A0A] text-white px-3.5 py-1.5 rounded-xl hover:bg-[#262626] transition-colors"
              >
                Store Login
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-[#FAFAFA] border-b border-[#F0F0F0] py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#F4F4F5] text-[#18181B] border border-[#E4E4E7]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Verified Local Merchant Network
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0A0A0A]">
              Discover Stores Across Kerala
            </h1>
            <p className="text-sm md:text-base text-[#737373] max-w-2xl mx-auto leading-relaxed">
              Explore independent boutiques, fashion stores, food shops, and specialty merchants. Browse live product catalogues and place orders directly via WhatsApp.
            </p>

            {/* Search Input */}
            <div className="pt-4 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by store name, category, or town..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E4E4E7] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="pt-2 space-y-2">
              {/* Town Filters */}
              {towns.length > 2 && (
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider font-mono mr-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Town:
                  </span>
                  {towns.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTown(t)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        selectedTown === t
                          ? 'bg-[#0A0A0A] text-white'
                          : 'bg-white border border-[#E4E4E7] text-[#52525B] hover:bg-[#F4F4F5]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              {/* Category Filters */}
              {categories.length > 2 && (
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider font-mono mr-1 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Category:
                  </span>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        selectedCategory === c
                          ? 'bg-[#0A0A0A] text-white'
                          : 'bg-white border border-[#E4E4E7] text-[#52525B] hover:bg-[#F4F4F5]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Directory Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 bg-white border border-[#F0F0F0] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#F0F0F0] p-8 max-w-md mx-auto">
              <Store className="w-10 h-10 text-[#A1A1AA] mx-auto mb-3" />
              <p className="text-base font-bold text-[#0A0A0A]">Unable to load directory</p>
              <p className="text-xs text-[#737373] mt-1">Please check your connection and try again.</p>
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#F0F0F0] p-8 max-w-md mx-auto">
              <ShoppingBag className="w-10 h-10 text-[#A1A1AA] mx-auto mb-3" />
              <p className="text-base font-bold text-[#0A0A0A]">No shops found</p>
              <p className="text-xs text-[#737373] mt-1">
                {search || selectedTown !== 'All' || selectedCategory !== 'All'
                  ? 'Try adjusting your search or filters.'
                  : 'Check back soon for new stores!'}
              </p>
              {(search || selectedTown !== 'All' || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearch('')
                    setSelectedTown('All')
                    setSelectedCategory('All')
                  }}
                  className="mt-4 text-xs font-semibold text-[#0A0A0A] underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedByTown).map(([townName, townShops]) => (
                <section key={townName} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#E4E4E7] pb-2">
                    <MapPin className="w-4 h-4 text-[#0A0A0A]" />
                    <h2 className="text-lg font-bold text-[#0A0A0A]">{townName}</h2>
                    <span className="text-xs text-[#737373] font-mono">({townShops.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {townShops.map((shop) => {
                      const initial = shop.name?.charAt(0)?.toUpperCase() || 'S'
                      return (
                        <Link
                          key={shop.slug}
                          to={`/${shop.slug}`}
                          className="group bg-white rounded-2xl border border-[#E4E4E7] p-5 hover:border-[#0A0A0A] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                {shop.logo_url ? (
                                  <img
                                    src={shop.logo_url}
                                    alt={shop.name}
                                    className="w-12 h-12 rounded-xl object-cover border border-[#F0F0F0] flex-shrink-0"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center flex-shrink-0 font-bold text-[#52525B]">
                                    {initial}
                                  </div>
                                )}
                                <div>
                                  <h3 className="font-bold text-sm text-[#0A0A0A] group-hover:text-[#0A0A0A] transition-colors leading-snug">
                                    {shop.name}
                                  </h3>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-block text-[11px] font-medium text-[#71717A] bg-[#F4F4F5] px-2 py-0.5 rounded-md">
                                      {shop.category}
                                    </span>
                                    {shop.is_pro && (
                                      <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md font-medium">
                                        ⚡ Pro
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed">
                              {shop.seo_description || `Browse products from ${shop.name} in ${shop.town}. WhatsApp ordering enabled.`}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#F4F4F5] flex items-center justify-between text-xs font-semibold text-[#0A0A0A] group-hover:translate-x-0.5 transition-transform">
                            <span>Browse Catalogue</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
