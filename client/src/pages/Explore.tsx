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

// Mock data for demonstration
const mockIdeas: Idea[] = [
  {
    _id: '1',
    title: 'Smart Urban Garden System',
    tagline: 'Automated vertical farming for city apartments with AI-powered plant care',
    description: 'A modular indoor garden system that uses sensors and AI to automatically water, fertilize, and adjust lighting.',
    category: 'invention',
    stage: 'prototype',
    status: 'active',
    creator: {
      _id: 'u1',
      auth0Id: 'auth0|123',
      email: 'sarah@example.com',
      name: 'Sarah Chen',
      picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      expertise: ['Engineering', 'IoT'],
      role: 'user',
      reputation: 450,
      ideasCount: 3,
      contributionsCount: 12,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
    coverImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
    images: [],
    documents: [],
    resources: [
      { type: 'funding', description: 'Seed funding for manufacturing', amount: 50000, currency: '$', equity: 10, fulfilled: false },
    ],
    ipFilings: [],
    tags: ['agriculture', 'iot', 'sustainability'],
    viewCount: 1234,
    likeCount: 89,
    contributionCount: 7,
    isPublic: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    _id: '2',
    title: 'Community Skill Exchange Platform',
    tagline: 'Trade skills instead of money - teach guitar, learn web design',
    description: 'A platform where people can exchange skills and services using a time-based currency system.',
    category: 'social',
    stage: 'development',
    status: 'active',
    creator: {
      _id: 'u2',
      auth0Id: 'auth0|456',
      email: 'marcus@example.com',
      name: 'Marcus Johnson',
      picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      expertise: ['Community Building'],
      role: 'user',
      reputation: 320,
      ideasCount: 2,
      contributionsCount: 8,
      createdAt: '2023-11-01',
      updatedAt: '2024-01-12',
    },
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
    images: [],
    documents: [],
    resources: [
      { type: 'partnership', description: 'Community organizations for pilot', fulfilled: false },
    ],
    ipFilings: [],
    tags: ['community', 'sharing-economy'],
    viewCount: 856,
    likeCount: 124,
    contributionCount: 12,
    isPublic: true,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-14',
  },
  {
    _id: '3',
    title: 'AI-Powered Recipe Optimizer',
    tagline: 'Transform any recipe to match your dietary needs',
    description: 'An app that uses AI to adapt recipes based on allergies and available ingredients.',
    category: 'technology',
    stage: 'concept',
    status: 'active',
    creator: {
      _id: 'u3',
      auth0Id: 'auth0|789',
      email: 'emma@example.com',
      name: 'Emma Rodriguez',
      picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      expertise: ['Machine Learning'],
      role: 'user',
      reputation: 180,
      ideasCount: 1,
      contributionsCount: 5,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-08',
    },
    images: [],
    documents: [],
    resources: [
      { type: 'funding', description: 'Pre-seed funding for MVP', amount: 25000, currency: '$', equity: 15, fulfilled: false },
    ],
    ipFilings: [],
    tags: ['ai', 'food', 'health'],
    viewCount: 432,
    likeCount: 67,
    contributionCount: 3,
    isPublic: true,
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
  },
  {
    _id: '4',
    title: 'Modular Electric Cargo Bike',
    tagline: 'Sustainable last-mile delivery with swappable cargo modules',
    description: 'A cargo bike system with interchangeable modules for different cargo types.',
    category: 'invention',
    stage: 'market-ready',
    status: 'active',
    creator: {
      _id: 'u4',
      auth0Id: 'auth0|101',
      email: 'alex@example.com',
      name: 'Alex Kim',
      picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      expertise: ['Industrial Design'],
      role: 'user',
      reputation: 890,
      ideasCount: 5,
      contributionsCount: 20,
      createdAt: '2023-06-01',
      updatedAt: '2024-01-10',
    },
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    images: [],
    documents: [],
    resources: [
      { type: 'funding', description: 'Series A for scaling', amount: 500000, currency: '$', equity: 8, fulfilled: false },
    ],
    ipFilings: [],
    tags: ['transportation', 'sustainability', 'e-bike'],
    viewCount: 2341,
    likeCount: 203,
    contributionCount: 15,
    isPublic: true,
    createdAt: '2023-09-15',
    updatedAt: '2024-01-10',
  },
  {
    _id: '5',
    title: 'Accessible Music Production Suite',
    tagline: 'Making music creation possible for everyone with disabilities',
    description: 'Music software designed with accessibility at its core for visually and motor impaired users.',
    category: 'creative',
    stage: 'development',
    status: 'active',
    creator: {
      _id: 'u5',
      auth0Id: 'auth0|202',
      email: 'jordan@example.com',
      name: 'Jordan Taylor',
      picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      expertise: ['Audio Engineering', 'Accessibility'],
      role: 'user',
      reputation: 560,
      ideasCount: 2,
      contributionsCount: 18,
      createdAt: '2023-08-01',
      updatedAt: '2024-01-08',
    },
    coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',
    images: [],
    documents: [],
    resources: [
      { type: 'expertise', description: 'UX researcher with accessibility focus', fulfilled: false },
    ],
    ipFilings: [],
    tags: ['accessibility', 'music', 'software'],
    viewCount: 678,
    likeCount: 156,
    contributionCount: 9,
    isPublic: true,
    createdAt: '2023-12-01',
    updatedAt: '2024-01-08',
  },
  {
    _id: '6',
    title: 'Blockchain Voting System',
    tagline: 'Secure, transparent, and verifiable elections for organizations',
    description: 'A voting platform using blockchain for tamper-proof organizational elections.',
    category: 'technology',
    stage: 'prototype',
    status: 'active',
    creator: {
      _id: 'u6',
      auth0Id: 'auth0|303',
      email: 'priya@example.com',
      name: 'Priya Sharma',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      expertise: ['Blockchain', 'Security'],
      role: 'user',
      reputation: 720,
      ideasCount: 4,
      contributionsCount: 15,
      createdAt: '2023-05-01',
      updatedAt: '2024-01-05',
    },
    coverImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600',
    images: [],
    documents: [],
    resources: [
      { type: 'partnership', description: 'University for pilot program', fulfilled: false },
    ],
    ipFilings: [],
    tags: ['blockchain', 'governance', 'security'],
    viewCount: 1567,
    likeCount: 178,
    contributionCount: 11,
    isPublic: true,
    createdAt: '2023-10-20',
    updatedAt: '2024-01-05',
  },
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
      // Simulate API call with filtering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredIdeas = [...mockIdeas];
      
      if (filters.category) {
        filteredIdeas = filteredIdeas.filter(i => i.category === filters.category);
      }
      if (filters.stage) {
        filteredIdeas = filteredIdeas.filter(i => i.stage === filters.stage);
      }
      if (filters.resourceType) {
        filteredIdeas = filteredIdeas.filter(i => 
          i.resources.some(r => r.type === filters.resourceType && !r.fulfilled)
        );
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredIdeas = filteredIdeas.filter(i => 
          i.title.toLowerCase().includes(searchLower) ||
          i.tagline.toLowerCase().includes(searchLower) ||
          i.tags.some(t => t.toLowerCase().includes(searchLower))
        );
      }
      
      setIdeas(filteredIdeas);
      setLoading(false);
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
