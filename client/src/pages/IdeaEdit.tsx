import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { IdeaCategory, IdeaStage, ResourceType, Idea } from '../types';
import toast from 'react-hot-toast';
import api from '../services/api';
import Loading from '../components/common/Loading';

const categories: { value: IdeaCategory; label: string; description: string }[] = [
  { value: 'invention', label: 'Invention', description: 'Physical or digital products and devices' },
  { value: 'business', label: 'Business', description: 'Company concepts, services, or business models' },
  { value: 'creative', label: 'Creative', description: 'Art, media, entertainment, and design projects' },
  { value: 'social', label: 'Social Impact', description: 'Community initiatives and nonprofit concepts' },
  { value: 'research', label: 'Research', description: 'Scientific studies and academic projects' },
  { value: 'technology', label: 'Technology', description: 'Software, apps, and technical solutions' },
];

const stages: { value: IdeaStage; label: string; description: string }[] = [
  { value: 'concept', label: 'Concept', description: 'Just an idea, needs validation' },
  { value: 'development', label: 'In Development', description: 'Actively being worked on' },
  { value: 'prototype', label: 'Prototype', description: 'Working prototype or MVP exists' },
  { value: 'market-ready', label: 'Market Ready', description: 'Ready to launch or scale' },
  { value: 'launched', label: 'Launched', description: 'Already in market, seeking growth' },
];

const resourceTypes: { value: ResourceType; label: string; description: string }[] = [
  { value: 'funding', label: 'Funding', description: 'Financial investment' },
  { value: 'expertise', label: 'Expertise', description: 'Professional skills and consulting' },
  { value: 'labor', label: 'Labor', description: 'Hands-on work and development' },
  { value: 'equipment', label: 'Equipment', description: 'Physical resources and tools' },
  { value: 'partnership', label: 'Partnership', description: 'Strategic business collaboration' },
  { value: 'mentorship', label: 'Mentorship', description: 'Guidance and industry connections' },
];

interface ResourceRequest {
  type: ResourceType;
  description: string;
  amount?: number;
  currency?: string;
  equity?: number;
  fulfilled?: boolean;
}

export default function IdeaEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth0();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [originalIdea, setOriginalIdea] = useState<Idea | null>(null);

  // Form state
  const [category, setCategory] = useState<IdeaCategory>('technology');
  const [stage, setStage] = useState<IdeaStage>('concept');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [resources, setResources] = useState<ResourceRequest[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [coverImage, setCoverImage] = useState('');

  // Resource form state
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [newResource, setNewResource] = useState<ResourceRequest>({
    type: 'funding',
    description: '',
  });

  useEffect(() => {
    const fetchIdea = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const response = await api.getIdeaById(id);
        const idea = response.data;
        
        if (!idea) {
          toast.error('Idea not found');
          navigate('/dashboard');
          return;
        }

        setOriginalIdea(idea);
        setCategory(idea.category);
        setStage(idea.stage);
        setTitle(idea.title);
        setTagline(idea.tagline);
        setDescription(idea.description);
        setTags(idea.tags);
        setResources(idea.resources || []);
        setIsPublic(idea.isPublic);
        setCoverImage(idea.coverImage || '');
      } catch (error: any) {
        console.error('Error fetching idea:', error);
        if (error.response?.status === 403) {
          toast.error('You do not have permission to edit this idea');
        } else {
          toast.error('Failed to load idea');
        }
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [id, navigate]);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const addResource = () => {
    if (newResource.type && newResource.description.trim()) {
      setResources([...resources, { ...newResource }]);
      setNewResource({ type: 'funding', description: '' });
      setShowResourceForm(false);
    }
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const toggleResourceFulfilled = (index: number) => {
    const updated = [...resources];
    updated[index] = { ...updated[index], fulfilled: !updated[index].fulfilled };
    setResources(updated);
  };

  const handleSave = async () => {
    if (!title.trim() || !tagline.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        title,
        tagline,
        description,
        category,
        stage,
        resources: resources.map((r) => ({
          type: r.type,
          description: r.description,
          amount: r.amount,
          currency: r.currency,
          equity: r.equity,
          fulfilled: r.fulfilled || false,
        })),
        tags,
        isPublic,
        coverImage: coverImage || undefined,
      };

      const response = await api.updateIdea(id!, updates);
      
      if (response.success) {
        toast.success('Idea updated successfully!');
        navigate(`/ideas/${id}`);
      }
    } catch (error: any) {
      console.error('Error updating idea:', error);
      toast.error(error.response?.data?.message || 'Failed to update idea');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteIdea(id!);
      toast.success('Idea deleted successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error deleting idea:', error);
      toast.error(error.response?.data?.message || 'Failed to delete idea');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading idea..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Edit Idea</h1>
            <p className="text-stone-400">Update your idea details and resources.</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Cover Image Section */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <PhotoIcon className="w-5 h-5 text-amber-400" />
          Cover Image
        </h2>
        
        {coverImage ? (
          <div className="relative rounded-xl overflow-hidden mb-4">
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '';
                setCoverImage('');
                toast.error('Failed to load image. Please check the URL.');
              }}
            />
            <button
              onClick={() => setCoverImage('')}
              className="absolute top-2 right-2 p-2 rounded-lg bg-stone-900/80 text-white hover:bg-stone-800 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-full h-48 rounded-xl border-2 border-dashed border-stone-700 flex items-center justify-center mb-4">
            <div className="text-center">
              <PhotoIcon className="w-12 h-12 text-stone-600 mx-auto mb-2" />
              <p className="text-sm text-stone-500">No cover image set</p>
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/your-image.jpg"
            className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <p className="text-xs text-stone-500 mt-2">
            Enter a URL to an image that represents your idea. Recommended size: 1200x630px
          </p>
        </div>
      </div>

      {/* Category & Stage */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IdeaCategory)}
              className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as IdeaStage)}
              className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {stages.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 mb-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Details</h2>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="Give your idea a catchy name"
            className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <p className="text-xs text-stone-500 mt-1">{title.length}/100 characters</p>
        </div>

        <div>
          <label htmlFor="tagline" className="block text-sm font-medium text-white mb-2">
            Tagline <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            maxLength={150}
            placeholder="A short, compelling description (one sentence)"
            className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <p className="text-xs text-stone-500 mt-1">{tagline.length}/150 characters</p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
            Full Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            placeholder="Describe your idea in detail."
            className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-800 text-sm text-stone-300"
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="p-0.5 hover:text-red-400 transition-colors"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag"
              className="flex-1 px-4 py-2 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <button
              onClick={addTag}
              disabled={!tagInput.trim() || tags.length >= 10}
              className="px-4 py-2 rounded-lg bg-stone-700 text-white hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-1">{tags.length}/10 tags</p>
        </div>
      </div>

      {/* Resources */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 mb-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Resources Needed</h2>

        {resources.length > 0 && (
          <div className="space-y-3">
            {resources.map((resource, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                  resource.fulfilled 
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-stone-800/50 border-stone-700'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      resource.fulfilled 
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {resource.type}
                    </span>
                    {resource.fulfilled && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckIcon className="w-3 h-3" />
                        Fulfilled
                      </span>
                    )}
                    {resource.amount && (
                      <span className="text-sm text-emerald-400">
                        {resource.currency || '$'}{resource.amount.toLocaleString()}
                        {resource.equity && ` for ${resource.equity}% equity`}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-300">{resource.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleResourceFulfilled(index)}
                    className={`p-2 rounded-lg transition-colors ${
                      resource.fulfilled
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-stone-700 text-stone-400 hover:text-emerald-400'
                    }`}
                    title={resource.fulfilled ? 'Mark as unfulfilled' : 'Mark as fulfilled'}
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeResource(index)}
                    className="p-2 rounded-lg bg-stone-700 text-stone-400 hover:text-red-400 transition-colors"
                    title="Remove resource"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showResourceForm ? (
          <div className="p-5 rounded-xl bg-stone-800/30 border border-stone-700 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Resource Type</label>
              <select
                value={newResource.type}
                onChange={(e) => setNewResource({ ...newResource, type: e.target.value as ResourceType })}
                className="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {resourceTypes.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {newResource.type === 'funding' && (
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Amount</label>
                  <input
                    type="number"
                    value={newResource.amount || ''}
                    onChange={(e) => setNewResource({ ...newResource, amount: Number(e.target.value) || undefined })}
                    placeholder="50000"
                    className="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Currency</label>
                  <select
                    value={newResource.currency || '$'}
                    onChange={(e) => setNewResource({ ...newResource, currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Equity Offered (%)</label>
                  <input
                    type="number"
                    value={newResource.equity || ''}
                    onChange={(e) => setNewResource({ ...newResource, equity: Number(e.target.value) || undefined })}
                    placeholder="10"
                    min="0"
                    max="100"
                    className="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">Description</label>
              <textarea
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                rows={3}
                placeholder="Describe what you need"
                className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowResourceForm(false)}
                className="px-4 py-2 rounded-lg bg-stone-700 text-white hover:bg-stone-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addResource}
                disabled={!newResource.description.trim()}
                className="px-4 py-2 rounded-lg bg-amber-500 text-stone-900 font-medium hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Resource
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResourceForm(true)}
            className="w-full p-4 rounded-xl border-2 border-dashed border-stone-700 text-stone-400 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
          >
            + Add Resource Request
          </button>
        )}
      </div>

      {/* Visibility */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 mb-8">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-5 h-5 rounded border-stone-600 bg-stone-700 text-amber-500 focus:ring-amber-500"
          />
          <div>
            <p className="text-white font-medium">Make this idea public</p>
            <p className="text-xs text-stone-400">
              Public ideas can be discovered by anyone. Private ideas are only visible to you.
            </p>
          </div>
        </label>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl bg-stone-800 text-white font-medium hover:bg-stone-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || !tagline.trim() || !description.trim()}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 font-semibold hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckIcon className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <TrashIcon className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Delete Idea?</h2>
              <p className="text-stone-400 mb-6">
                Are you sure you want to delete "{originalIdea?.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-stone-800 text-white font-medium hover:bg-stone-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {deleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-5 h-5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
