import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  HeartIcon,
  EyeIcon,
  ShareIcon,
  PencilIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  AcademicCapIcon,
  BeakerIcon,
  SparklesIcon,
  HandRaisedIcon,
  BriefcaseIcon,
  LightBulbIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Loading from '../components/common/Loading';
import api from '../services/api';
import { Idea, IdeaCategory, IdeaStage, ResourceType, Contribution, User } from '../types';

const categoryConfig: Record<IdeaCategory, { icon: typeof SparklesIcon; color: string; bg: string; label: string }> = {
  invention: { icon: WrenchScrewdriverIcon, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Invention' },
  business: { icon: CurrencyDollarIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Business' },
  creative: { icon: SparklesIcon, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Creative' },
  social: { icon: UserGroupIcon, color: 'text-pink-400', bg: 'bg-pink-500/10', label: 'Social Impact' },
  research: { icon: BeakerIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Research' },
  technology: { icon: AcademicCapIcon, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Technology' },
};

const stageConfig: Record<IdeaStage, { label: string; color: string; description: string }> = {
  concept: { label: 'Concept', color: 'bg-stone-600', description: 'Just an idea, needs validation' },
  development: { label: 'In Development', color: 'bg-blue-600', description: 'Actively being worked on' },
  prototype: { label: 'Prototype', color: 'bg-purple-600', description: 'Working prototype or MVP exists' },
  'market-ready': { label: 'Market Ready', color: 'bg-emerald-600', description: 'Ready to launch or scale' },
  launched: { label: 'Launched', color: 'bg-amber-600', description: 'Already in market, seeking growth' },
};

const resourceTypeConfig: Record<ResourceType, { icon: typeof CurrencyDollarIcon; label: string; color: string }> = {
  funding: { icon: CurrencyDollarIcon, label: 'Funding', color: 'text-emerald-400' },
  expertise: { icon: AcademicCapIcon, label: 'Expertise', color: 'text-blue-400' },
  labor: { icon: WrenchScrewdriverIcon, label: 'Labor', color: 'text-orange-400' },
  equipment: { icon: BeakerIcon, label: 'Equipment', color: 'text-purple-400' },
  partnership: { icon: BriefcaseIcon, label: 'Partnership', color: 'text-pink-400' },
  mentorship: { icon: LightBulbIcon, label: 'Mentorship', color: 'text-amber-400' },
};

interface ContributionFormData {
  type: ResourceType;
  description: string;
  amount?: number;
  currency: string;
  message: string;
  terms?: string;
}

export default function IdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [contributionForm, setContributionForm] = useState<ContributionFormData>({
    type: 'funding',
    description: '',
    amount: undefined,
    currency: '$',
    message: '',
    terms: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const [ideaRes, currentUserRes] = await Promise.all([
          api.getIdeaById(id),
          isAuthenticated ? api.getCurrentUser().catch(() => null) : Promise.resolve(null),
        ]);
        
        if (ideaRes.data) {
          setIdea(ideaRes.data);
          setLikeCount(ideaRes.data.likeCount);
          
          // Check if current user has liked this idea
          if (user?.sub && ideaRes.data.likedBy?.includes(user.sub)) {
            setIsLiked(true);
          }
          
          // Fetch public contributions for this idea
          try {
            const contribRes = await api.getContributionsForIdea(id);
            setContributions(contribRes.data || []);
          } catch (e) {
            // Contributions endpoint might not exist for non-owners
          }
        }
        
        if (currentUserRes?.data) {
          setCurrentUser(currentUserRes.data);
        }
      } catch (error: any) {
        console.error('Error fetching idea:', error);
        if (error.response?.status === 404) {
          toast.error('Idea not found');
          navigate('/explore');
        } else if (error.response?.status === 403) {
          toast.error('This idea is private');
          navigate('/explore');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, navigate, user?.sub]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like ideas');
      loginWithRedirect();
      return;
    }
    
    try {
      const response = await api.likeIdea(id!);
      if (response.data) {
        setIsLiked(response.data.liked);
        setLikeCount(prev => response.data!.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      toast.error('Failed to like idea');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: idea?.title,
          text: idea?.tagline,
          url,
        });
      } catch (e) {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    
    if (!contributionForm.message.trim()) {
      toast.error('Please provide a message');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.createContribution({
        ideaId: id!,
        type: contributionForm.type,
        description: contributionForm.description,
        amount: contributionForm.amount,
        currency: contributionForm.currency,
        message: contributionForm.message,
        terms: contributionForm.terms,
      });
      
      toast.success('Contribution offer sent successfully!');
      setShowContributionModal(false);
      setContributionForm({
        type: 'funding',
        description: '',
        amount: undefined,
        currency: '$',
        message: '',
        terms: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit contribution offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwner = currentUser && idea && idea.creator._id === currentUser._id;

  if (loading) {
    return <Loading fullScreen message="Loading idea..." />;
  }

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Idea not found</h1>
        <Link to="/explore" className="text-amber-400 hover:text-amber-300">
          Back to Explore
        </Link>
      </div>
    );
  }

  const CategoryIcon = categoryConfig[idea.category]?.icon || SparklesIcon;
  const categoryStyle = categoryConfig[idea.category] || categoryConfig.creative;
  const stage = stageConfig[idea.stage] || stageConfig.concept;
  const unfulfilledResources = idea.resources.filter(r => !r.fulfilled);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        {/* Cover Image or Gradient */}
        <div className="h-64 sm:h-80 lg:h-96 relative overflow-hidden">
          {idea.coverImage ? (
            <img
              src={idea.coverImage}
              alt={idea.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-800 via-stone-900 to-black flex items-center justify-center">
              <CategoryIcon className={`w-32 h-32 ${categoryStyle.color} opacity-20`} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
        </div>

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900/80 backdrop-blur-sm text-white hover:bg-stone-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {isOwner && (
            <Link
              to={`/ideas/${idea._id}/edit`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-stone-900 font-medium hover:bg-amber-400 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              Edit Idea
            </Link>
          )}
          <button
            onClick={handleShare}
            className="p-2 rounded-lg bg-stone-900/80 backdrop-blur-sm text-white hover:bg-stone-800 transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-stone-900/90 backdrop-blur-sm border border-stone-800 rounded-2xl p-6 sm:p-8">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${stage.color}`}>
                  {stage.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${categoryStyle.color} ${categoryStyle.bg}`}>
                  <CategoryIcon className="w-4 h-4" />
                  {categoryStyle.label}
                </span>
                {idea.status === 'pending-review' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-amber-400 bg-amber-500/10">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    Pending Review
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                {idea.title}
              </h1>

              {/* Tagline */}
              <p className="text-lg text-stone-300 mb-6">
                {idea.tagline}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-stone-800">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-stone-400 hover:text-red-400 transition-colors"
                >
                  {isLiked ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                  <span className="font-medium">{likeCount}</span>
                </button>
                
                <div className="flex items-center gap-2 text-stone-400">
                  <EyeIcon className="w-6 h-6" />
                  <span className="font-medium">{idea.viewCount}</span>
                </div>

                <div className="flex items-center gap-2 text-stone-400">
                  <HandRaisedIcon className="w-6 h-6" />
                  <span className="font-medium">{idea.contributionCount} contributions</span>
                </div>

                <span className="text-sm text-stone-500">
                  Posted {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-white mb-4">About This Idea</h2>
              <div className="prose prose-invert prose-stone max-w-none">
                <p className="text-stone-300 whitespace-pre-wrap leading-relaxed">
                  {idea.description}
                </p>
              </div>
            </div>

            {/* Tags */}
            {idea.tags.length > 0 && (
              <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/explore?search=${encodeURIComponent(tag)}`}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Contributions */}
            {contributions.length > 0 && (
              <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                  Contributors ({contributions.length})
                </h2>
                <div className="space-y-3">
                  {contributions.map((contrib) => (
                    <div
                      key={contrib._id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-stone-800/50"
                    >
                      {contrib.contributor.picture ? (
                        <img
                          src={contrib.contributor.picture}
                          alt={contrib.contributor.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center">
                          <span className="text-sm font-medium text-stone-400">
                            {contrib.contributor.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-white">{contrib.contributor.name}</p>
                        <p className="text-sm text-stone-400 capitalize">{contrib.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Creator Card */}
            <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-4">Creator</h3>
              <div className="flex items-center gap-4">
                {idea.creator.picture ? (
                  <img
                    src={idea.creator.picture}
                    alt={idea.creator.name}
                    className="w-14 h-14 rounded-full ring-2 ring-stone-700"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-stone-700 flex items-center justify-center">
                    <span className="text-xl font-medium text-stone-400">
                      {idea.creator.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{idea.creator.name}</p>
                  {idea.creator.expertise && idea.creator.expertise.length > 0 && (
                    <p className="text-sm text-stone-400">
                      {idea.creator.expertise.slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              {idea.creator.bio && (
                <p className="mt-4 text-sm text-stone-400">{idea.creator.bio}</p>
              )}
            </div>

            {/* Resources Needed */}
            {unfulfilledResources.length > 0 && (
              <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-4">
                  Resources Needed
                </h3>
                <div className="space-y-4">
                  {unfulfilledResources.map((resource, index) => {
                    const config = resourceTypeConfig[resource.type];
                    const ResourceIcon = config?.icon || CurrencyDollarIcon;
                    return (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-stone-800/50 border border-stone-700"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <ResourceIcon className={`w-5 h-5 ${config?.color || 'text-stone-400'}`} />
                          <span className="font-medium text-white">{config?.label || resource.type}</span>
                        </div>
                        {resource.amount && (
                          <p className="text-lg font-bold text-emerald-400 mb-1">
                            {resource.currency || '$'}{resource.amount.toLocaleString()}
                            {resource.equity && (
                              <span className="text-sm font-normal text-stone-400 ml-2">
                                for {resource.equity}% equity
                              </span>
                            )}
                          </p>
                        )}
                        <p className="text-sm text-stone-400">{resource.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contribute CTA */}
            {!isOwner && idea.status === 'active' && (
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Want to Contribute?
                </h3>
                <p className="text-sm text-stone-400 mb-4">
                  Offer your expertise, funding, or resources to help bring this idea to life.
                </p>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      loginWithRedirect();
                    } else {
                      setShowContributionModal(true);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 font-semibold hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
                >
                  <HandRaisedIcon className="w-5 h-5" />
                  Offer Contribution
                </button>
              </div>
            )}

            {/* Owner Actions */}
            {isOwner && (
              <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-4">
                  Manage Your Idea
                </h3>
                <div className="space-y-3">
                  <Link
                    to={`/ideas/${idea._id}/edit`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-stone-900 font-medium hover:bg-amber-400 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit Idea
                  </Link>
                  <Link
                    to="/dashboard"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-stone-800 text-white hover:bg-stone-700 transition-colors"
                  >
                    View Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contribution Modal */}
      {showContributionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-800">
              <h2 className="text-xl font-semibold text-white">Offer Contribution</h2>
              <button
                onClick={() => setShowContributionModal(false)}
                className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleContributionSubmit} className="p-6 space-y-5">
              {/* Contribution Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  What would you like to offer?
                </label>
                <select
                  value={contributionForm.type}
                  onChange={(e) => setContributionForm({ ...contributionForm, type: e.target.value as ResourceType })}
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {Object.entries(resourceTypeConfig).map(([value, config]) => (
                    <option key={value} value={value}>{config.label}</option>
                  ))}
                </select>
              </div>

              {/* Amount (for funding) */}
              {contributionForm.type === 'funding' && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-white mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={contributionForm.amount || ''}
                      onChange={(e) => setContributionForm({ ...contributionForm, amount: Number(e.target.value) || undefined })}
                      placeholder="50000"
                      className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Currency
                    </label>
                    <select
                      value={contributionForm.currency}
                      onChange={(e) => setContributionForm({ ...contributionForm, currency: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="$">USD ($)</option>
                      <option value="€">EUR (€)</option>
                      <option value="£">GBP (£)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Brief Description
                </label>
                <input
                  type="text"
                  value={contributionForm.description}
                  onChange={(e) => setContributionForm({ ...contributionForm, description: e.target.value })}
                  placeholder="What specifically can you offer?"
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Message to Creator <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={contributionForm.message}
                  onChange={(e) => setContributionForm({ ...contributionForm, message: e.target.value })}
                  rows={4}
                  placeholder="Introduce yourself and explain why you want to contribute to this idea..."
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  required
                />
              </div>

              {/* Terms (optional) */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Terms & Conditions (optional)
                </label>
                <textarea
                  value={contributionForm.terms}
                  onChange={(e) => setContributionForm({ ...contributionForm, terms: e.target.value })}
                  rows={2}
                  placeholder="Any specific terms or conditions for your offer..."
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContributionModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-stone-800 text-white font-medium hover:bg-stone-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !contributionForm.message.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 font-semibold hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <HandRaisedIcon className="w-5 h-5" />
                      Send Offer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
