import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import IdeaCard from '../components/ideas/IdeaCard';
import Loading from '../components/common/Loading';
import { Idea, IdeaCategory, IdeaStage, ResourceType, IdeaFilters } from '../types';
import { useDebounce } from '../hooks';
import api from '../services/api';

const categories: { value: IdeaCategory | ''; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'invention', label: 'Inventions' },
  { value: 'business', label: 'Business Ideas' },
  { value: 'creative', label: 'Creative Projects' },
  { value: 'social', label: 'Social Impact' },
  { value: 'research', label: 'Research' },
  { value: 'technology', label: 'Technology' },
];

const stages: { value: IdeaStage | ''; label: string }[] = [
  { value: '', label: 'All Stages' },
  { value: 'concept', label: 'Concept' },
  { value: 'development', label: 'In Development' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'market-ready', label: 'Market Ready' },
  { value: 'launched', label: 'Launched' },
];

const resourceTypes: { value: ResourceType | ''; label: string }[] = [
  { value: '', label: 'All Resource Types' },
  { value: 'funding', label: 'Seeking Funding' },
  { value: 'expertise', label: 'Seeking Expertise' },
  { value: 'labor', label: 'Seeking Labor' },
  { value: 'partnership', label: 'Seeking Partnership' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const filters: IdeaFilters = {
    category: (searchParams.get('category') as IdeaCategory) || undefined,
    stage: (searchParams.get('stage') as IdeaStage) || undefined,
    resourceType: (searchParams.get('resourceType') as ResourceType) || undefined,
    sortBy: (searchParams.get('sortBy') as IdeaFilters['sortBy']) || 'newest',
    search: debouncedSearch || undefined,
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearch('');
  };

  const hasActiveFilters = filters.category || filters.stage || filters.resourceType || filters.search;

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      try {
        const response = await api.getIdeas({
          category: filters.category,
          stage: filters.stage,
          resourceType: filters.resourceType,
          search: filters.search,
          sortBy: filters.sortBy,
        });
        setIdeas(response.data || []);
      } catch (error) {
        console.error('Error fetching ideas:', error);
        setIdeas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [filters.category, filters.stage, filters.resourceType, debouncedSearch, filters.sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Explore Ideas</h1>
        <p className="text-stone-400">Discover innovative concepts and find opportunities to contribute</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search Input */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <input
            type="text"
            placeholder="Search ideas, tags, creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-900 border border-stone-800 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
              : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
          }`}
        >
          <FunnelIcon className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-8 p-6 rounded-xl bg-stone-900/50 border border-stone-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <XMarkIcon className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-2">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Stage Filter */}
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-2">Stage</label>
              <select
                value={filters.stage || ''}
                onChange={(e) => updateFilter('stage', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {stages.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Resource Type Filter */}
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-2">Looking For</label>
              <select
                value={filters.resourceType || ''}
                onChange={(e) => updateFilter('resourceType', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {resourceTypes.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-2">Sort By</label>
              <select
                value={filters.sortBy || 'newest'}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <Loading message="Loading ideas..." />
      ) : ideas.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-800 flex items-center justify-center">
            <MagnifyingGlassIcon className="w-8 h-8 text-stone-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No ideas found</h3>
          <p className="text-stone-400 mb-6">Try adjusting your filters or search terms</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg bg-amber-500 text-stone-900 font-medium hover:bg-amber-400 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-500 mb-6">{ideas.length} ideas found</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <IdeaCard key={idea._id} idea={idea} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
