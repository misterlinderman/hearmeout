import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  PlusCircleIcon,
  LightBulbIcon,
  HandRaisedIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Loading from '../components/common/Loading';

// Mock data
const mockUserIdeas = [
  {
    _id: '1',
    title: 'Smart Urban Garden System',
    status: 'active',
    stage: 'prototype',
    viewCount: 1234,
    likeCount: 89,
    contributionCount: 7,
    pendingContributions: 3,
    createdAt: '2024-01-10',
  },
  {
    _id: '2',
    title: 'AI-Powered Recipe Optimizer',
    status: 'pending-review',
    stage: 'concept',
    viewCount: 0,
    likeCount: 0,
    contributionCount: 0,
    pendingContributions: 0,
    createdAt: '2024-01-15',
  },
];

const mockContributions = [
  {
    _id: 'c1',
    ideaTitle: 'Modular Electric Cargo Bike',
    type: 'expertise',
    status: 'pending',
    createdAt: '2024-01-12',
  },
  {
    _id: 'c2',
    ideaTitle: 'Blockchain Voting System',
    type: 'funding',
    amount: 5000,
    status: 'accepted',
    createdAt: '2024-01-08',
  },
];

const mockReceivedContributions = [
  {
    _id: 'rc1',
    ideaId: '1',
    ideaTitle: 'Smart Urban Garden System',
    contributorName: 'John Smith',
    contributorPicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    type: 'funding',
    amount: 10000,
    message: 'Excited about your project! Would love to discuss partnership.',
    status: 'pending',
    createdAt: '2024-01-14',
  },
  {
    _id: 'rc2',
    ideaId: '1',
    ideaTitle: 'Smart Urban Garden System',
    contributorName: 'Emily Wong',
    contributorPicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    type: 'expertise',
    message: 'Agricultural scientist with 10 years experience in hydroponics.',
    status: 'pending',
    createdAt: '2024-01-13',
  },
];

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
  'pending-review': { label: 'Pending Review', color: 'bg-amber-500', textColor: 'text-amber-400' },
  draft: { label: 'Draft', color: 'bg-stone-500', textColor: 'text-stone-400' },
  funded: { label: 'Funded', color: 'bg-blue-500', textColor: 'text-blue-400' },
  rejected: { label: 'Rejected', color: 'bg-red-500', textColor: 'text-red-400' },
};

const contributionStatusConfig = {
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  accepted: { label: 'Accepted', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10' },
  completed: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

export default function Dashboard() {
  const { user, isLoading } = useAuth0();
  const [activeTab, setActiveTab] = useState<'ideas' | 'contributions' | 'received'>('ideas');

  if (isLoading) {
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  const stats = [
    { name: 'Total Ideas', value: mockUserIdeas.length, icon: LightBulbIcon, color: 'text-amber-400' },
    { name: 'Total Views', value: mockUserIdeas.reduce((acc, i) => acc + i.viewCount, 0), icon: EyeIcon, color: 'text-blue-400' },
    { name: 'Total Likes', value: mockUserIdeas.reduce((acc, i) => acc + i.likeCount, 0), icon: HeartIcon, color: 'text-red-400' },
    { name: 'Contributions Made', value: mockContributions.length, icon: HandRaisedIcon, color: 'text-emerald-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-stone-400">Welcome back, {user?.name || 'Creator'}!</p>
        </div>
        <Link
          to="/submit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 font-semibold hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
        >
          <PlusCircleIcon className="w-5 h-5" />
          Submit New Idea
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="p-5 rounded-xl bg-stone-900/50 border border-stone-800"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-sm text-stone-400">{stat.name}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Pending Contributions Alert */}
      {mockReceivedContributions.filter(c => c.status === 'pending').length > 0 && (
        <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <HandRaisedIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">
              You have {mockReceivedContributions.filter(c => c.status === 'pending').length} pending contribution offers!
            </p>
            <p className="text-sm text-stone-400">Review and respond to people who want to help your ideas.</p>
          </div>
          <button
            onClick={() => setActiveTab('received')}
            className="px-4 py-2 rounded-lg bg-amber-500 text-stone-900 font-medium hover:bg-amber-400 transition-colors"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-stone-800 mb-6">
        <nav className="flex gap-8">
          {[
            { id: 'ideas', label: 'My Ideas', count: mockUserIdeas.length },
            { id: 'contributions', label: 'My Contributions', count: mockContributions.length },
            { id: 'received', label: 'Received Offers', count: mockReceivedContributions.filter(c => c.status === 'pending').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-amber-500/20' : 'bg-stone-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'ideas' && (
        <div className="space-y-4">
          {mockUserIdeas.length === 0 ? (
            <div className="text-center py-16">
              <LightBulbIcon className="w-12 h-12 text-stone-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No ideas yet</h3>
              <p className="text-stone-400 mb-6">Share your first concept with the world!</p>
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-stone-900 font-medium hover:bg-amber-400 transition-colors"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Submit Your First Idea
              </Link>
            </div>
          ) : (
            mockUserIdeas.map((idea) => {
              const status = statusConfig[idea.status as keyof typeof statusConfig] || statusConfig.draft;
              return (
                <div
                  key={idea._id}
                  className="p-5 rounded-xl bg-stone-900/50 border border-stone-800 hover:border-stone-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          to={`/ideas/${idea._id}`}
                          className="text-lg font-semibold text-white hover:text-amber-400 transition-colors"
                        >
                          {idea.title}
                        </Link>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.textColor} bg-opacity-20`} style={{ backgroundColor: `${status.color}20` }}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-stone-400">
                        <span className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          {idea.viewCount} views
                        </span>
                        <span className="flex items-center gap-1">
                          <HeartIcon className="w-4 h-4" />
                          {idea.likeCount} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <HandRaisedIcon className="w-4 h-4" />
                          {idea.contributionCount} contributions
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          Created {new Date(idea.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {idea.pendingContributions > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                          {idea.pendingContributions} pending
                        </span>
                      )}
                      <Link
                        to={`/ideas/${idea._id}/edit`}
                        className="px-4 py-2 rounded-lg bg-stone-800 text-white hover:bg-stone-700 transition-colors text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/ideas/${idea._id}`}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-stone-900 hover:bg-amber-400 transition-colors text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'contributions' && (
        <div className="space-y-4">
          {mockContributions.length === 0 ? (
            <div className="text-center py-16">
              <HandRaisedIcon className="w-12 h-12 text-stone-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No contributions yet</h3>
              <p className="text-stone-400 mb-6">Explore ideas and offer your support!</p>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-stone-900 font-medium hover:bg-amber-400 transition-colors"
              >
                Explore Ideas
              </Link>
            </div>
          ) : (
            mockContributions.map((contribution) => {
              const status = contributionStatusConfig[contribution.status as keyof typeof contributionStatusConfig];
              return (
                <div
                  key={contribution._id}
                  className="p-5 rounded-xl bg-stone-900/50 border border-stone-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white mb-1">{contribution.ideaTitle}</p>
                      <div className="flex items-center gap-3 text-sm text-stone-400">
                        <span className="capitalize">{contribution.type}</span>
                        {contribution.amount && (
                          <span className="text-emerald-400">${contribution.amount.toLocaleString()}</span>
                        )}
                        <span>{new Date(contribution.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'received' && (
        <div className="space-y-4">
          {mockReceivedContributions.length === 0 ? (
            <div className="text-center py-16">
              <HandRaisedIcon className="w-12 h-12 text-stone-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No offers received</h3>
              <p className="text-stone-400">Contribution offers for your ideas will appear here.</p>
            </div>
          ) : (
            mockReceivedContributions.map((offer) => {
              const status = contributionStatusConfig[offer.status as keyof typeof contributionStatusConfig];
              return (
                <div
                  key={offer._id}
                  className="p-5 rounded-xl bg-stone-900/50 border border-stone-800"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <img
                        src={offer.contributorPicture}
                        alt={offer.contributorName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{offer.contributorName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-stone-400 mb-2">
                          Offering <span className="text-amber-400 capitalize">{offer.type}</span>
                          {offer.amount && <span className="text-emerald-400"> • ${offer.amount.toLocaleString()}</span>}
                          {' '}for <Link to={`/ideas/${offer.ideaId}`} className="text-white hover:text-amber-400">{offer.ideaTitle}</Link>
                        </p>
                        <p className="text-sm text-stone-300">{offer.message}</p>
                      </div>
                    </div>
                    {offer.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
