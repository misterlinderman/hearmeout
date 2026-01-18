import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  EyeIcon, 
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  AcademicCapIcon,
  BeakerIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Idea, IdeaCategory, IdeaStage } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface IdeaCardProps {
  idea: Idea;
  onLike?: (id: string) => void;
  isLiked?: boolean;
}

const categoryConfig: Record<IdeaCategory, { icon: typeof SparklesIcon; color: string; bg: string }> = {
  invention: { icon: WrenchScrewdriverIcon, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  business: { icon: CurrencyDollarIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  creative: { icon: SparklesIcon, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  social: { icon: UserGroupIcon, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  research: { icon: BeakerIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  technology: { icon: AcademicCapIcon, color: 'text-amber-400', bg: 'bg-amber-500/10' },
};

const stageConfig: Record<IdeaStage, { label: string; color: string }> = {
  concept: { label: 'Concept', color: 'bg-stone-600' },
  development: { label: 'In Development', color: 'bg-blue-600' },
  prototype: { label: 'Prototype', color: 'bg-purple-600' },
  'market-ready': { label: 'Market Ready', color: 'bg-emerald-600' },
  launched: { label: 'Launched', color: 'bg-amber-600' },
};

export default function IdeaCard({ idea, onLike, isLiked = false }: IdeaCardProps) {
  const CategoryIcon = categoryConfig[idea.category]?.icon || SparklesIcon;
  const categoryStyle = categoryConfig[idea.category] || categoryConfig.creative;
  const stage = stageConfig[idea.stage] || stageConfig.concept;

  const fundingResource = idea.resources.find(r => r.type === 'funding' && !r.fulfilled);

  return (
    <article className="group relative bg-stone-900/50 rounded-2xl border border-stone-800 hover:border-stone-700 transition-all duration-300 overflow-hidden">
      {/* Cover image or gradient */}
      <div className="aspect-[16/9] relative overflow-hidden">
        {idea.coverImage ? (
          <img
            src={idea.coverImage}
            alt={idea.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
            <CategoryIcon className={`w-16 h-16 ${categoryStyle.color} opacity-30`} />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
        
        {/* Stage badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${stage.color}`}>
            {stage.label}
          </span>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${categoryStyle.color} ${categoryStyle.bg} backdrop-blur-sm`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            {idea.category.charAt(0).toUpperCase() + idea.category.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Creator info */}
        <div className="flex items-center gap-3 mb-3">
          {idea.creator.picture ? (
            <img
              src={idea.creator.picture}
              alt={idea.creator.name}
              className="w-8 h-8 rounded-full ring-2 ring-stone-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center">
              <span className="text-xs font-medium text-stone-400">
                {idea.creator.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-300 truncate">{idea.creator.name}</p>
            <p className="text-xs text-stone-500">
              {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Title and tagline */}
        <Link to={`/ideas/${idea._id}`} className="block group/link">
          <h3 className="text-lg font-semibold text-white group-hover/link:text-amber-400 transition-colors line-clamp-2 mb-1">
            {idea.title}
          </h3>
          <p className="text-sm text-stone-400 line-clamp-2 mb-4">
            {idea.tagline}
          </p>
        </Link>

        {/* Funding request if present */}
        {fundingResource && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-400 font-medium mb-1">Seeking Investment</p>
            <p className="text-lg font-bold text-white">
              {fundingResource.currency || '$'}{fundingResource.amount?.toLocaleString()}
              {fundingResource.equity && (
                <span className="text-sm font-normal text-stone-400 ml-2">
                  for {fundingResource.equity}% equity
                </span>
              )}
            </p>
          </div>
        )}

        {/* Tags */}
        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {idea.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs font-medium text-stone-400 bg-stone-800/50 rounded-md"
              >
                #{tag}
              </span>
            ))}
            {idea.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-stone-500">
                +{idea.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 pt-4 border-t border-stone-800">
          <button
            onClick={(e) => {
              e.preventDefault();
              onLike?.(idea._id);
            }}
            className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-red-400 transition-colors"
          >
            {isLiked ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
            <span>{idea.likeCount}</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-sm text-stone-400">
            <EyeIcon className="w-5 h-5" />
            <span>{idea.viewCount}</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-stone-400">
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span>{idea.contributionCount}</span>
          </div>

          <Link
            to={`/ideas/${idea._id}`}
            className="ml-auto text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
    </article>
  );
}
