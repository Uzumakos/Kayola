import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { store } from '../lib/store';
import { Artwork, Category } from '../types';
import { ArtworkGrid } from '../components/artwork/ArtworkGrid';
import { Search, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const { locale, t } = useApp();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'price_asc' | 'price_desc' | 'title'>('latest');

  useEffect(() => {
    // Read category from URL params if any
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }

    setArtworks(store.getArtworks());
    setCategories(store.getCategories());

    const unsubscribe = store.subscribe(() => {
      setArtworks(store.getArtworks());
      setCategories(store.getCategories());
    });
    return unsubscribe;
  }, []);

  const filteredArtworks = useMemo(() => {
    return artworks.filter((art) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleFr = art.title_fr.toLowerCase();
        const titleEn = art.title_en.toLowerCase();
        const artist = art.artist.toLowerCase();
        const techFr = art.technique_fr.toLowerCase();
        const techEn = art.technique_en.toLowerCase();

        const matches =
          titleFr.includes(query) ||
          titleEn.includes(query) ||
          artist.includes(query) ||
          techFr.includes(query) ||
          techEn.includes(query);
        if (!matches) return false;
      }

      // 2. Category
      if (selectedCategory !== 'all' && art.category_id !== selectedCategory) {
        return false;
      }

      // 3. Availability
      if (availabilityFilter === 'available' && art.status === 'SOLD') {
        return false;
      }
      if (availabilityFilter === 'sold' && art.status !== 'SOLD') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'title') {
        const titleA = locale === 'en' ? a.title_en : locale === 'ht' ? (a.title_ht || a.title_fr) : a.title_fr;
        const titleB = locale === 'en' ? b.title_en : locale === 'ht' ? (b.title_ht || b.title_fr) : b.title_fr;
        return titleA.localeCompare(titleB);
      }
      // default latest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [artworks, searchQuery, selectedCategory, availabilityFilter, sortBy, locale]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setAvailabilityFilter('all');
    setSortBy('latest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#EF5A33]">
          Catalogue & Pièces Uniques
        </span>
        <h1 className="font-serif italic text-4xl sm:text-6xl font-normal text-[#1A1A1A]">
          {t.gallery.pageTitle}
        </h1>
        <p className="text-sm sm:text-base text-[#1A1A1A]/60 max-w-2xl">
          {t.gallery.pageSubtitle}
        </p>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-white p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.gallery.searchPlaceholder}
              className="w-full pl-11 pr-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-full text-xs text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-hidden focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all"
            />
          </div>

          {/* Availability Select */}
          <div className="md:col-span-3">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available' | 'sold')}
              className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-full text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#1A1A1A] transition-all"
            >
              <option value="all">{t.gallery.allStatuses}</option>
              <option value="available">{t.gallery.availableOnly}</option>
              <option value="sold">{t.gallery.statusSold}</option>
            </select>
          </div>

          {/* Sort By Select */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'price_asc' | 'price_desc' | 'title')}
              className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-full text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#1A1A1A] transition-all"
            >
              <option value="latest">{t.gallery.sortLatest}</option>
              <option value="price_asc">{t.gallery.sortPriceAsc}</option>
              <option value="price_desc">{t.gallery.sortPriceDesc}</option>
              <option value="title">{t.gallery.sortTitleAsc}</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-4 border-t border-[#1A1A1A]/10">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'bg-[#FAF9F6] text-[#1A1A1A]/70 hover:bg-[#EAE8E3]'
            }`}
          >
            {t.gallery.allCategories} ({artworks.length})
          </button>

          {categories.map((cat) => {
            const name = locale === 'en' ? cat.name_en : locale === 'ht' ? (cat.name_ht || cat.name_fr) : cat.name_fr;
            const count = artworks.filter((a) => a.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'bg-[#FAF9F6] text-[#1A1A1A]/70 hover:bg-[#EAE8E3]'
                }`}
              >
                {name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header and Reset */}
      <div className="flex items-center justify-between text-xs text-[#1A1A1A]/60 font-medium">
        <span>
          {t.gallery.resultsCount.replace('{count}', filteredArtworks.length.toString())}
        </span>

        {(searchQuery || selectedCategory !== 'all' || availabilityFilter !== 'all' || sortBy !== 'latest') && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-[#1A1A1A] hover:text-[#EF5A33] font-bold uppercase text-[10px] tracking-wider"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.gallery.resetFilters}</span>
          </button>
        )}
      </div>

      {/* Artworks Grid */}
      <ArtworkGrid
        artworks={filteredArtworks}
        emptyMessage={t.gallery.noResults}
      />
    </div>
  );
};
