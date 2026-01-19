import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  LightBulbIcon,
  PlusIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { IdeaCategory, IdeaStage, ResourceType, IdeaSubmission } from '../types';
import toast from 'react-hot-toast';
import api from '../services/api';

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
}

const STEPS = ['Category', 'Details', 'Resources', 'Review'];

export default function IdeaSubmit() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [category, setCategory] = useState<IdeaCategory | ''>('');
  const [stage, setStage] = useState<IdeaStage | ''>('');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [resources, setResources] = useState<ResourceRequest[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  // Resource form state
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [newResource, setNewResource] = useState<ResourceRequest>({
    type: 'funding',
    description: '',
  });

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return category && stage;
      case 1:
        return title.trim() && tagline.trim() && description.trim();
      case 2:
        return true; // Resources are optional
      case 3:
        return true;
      default:
        return false;
    }
  };

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

  const handleSubmit = async () => {
    if (!category || !stage) return;

    setIsSubmitting(true);
    try {
      const submission: IdeaSubmission = {
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
        })),
        tags,
        isPublic,
      };

      // Submit to API
      const response = await api.createIdea(submission);
      
      if (response.success) {
        toast.success('Idea submitted successfully! It will be reviewed by our team.');
        navigate('/dashboard');
      } else {
        throw new Error('Submission failed');
      }
    } catch (error: any) {
      console.error('Error submitting idea:', error);
      toast.error(error.response?.data?.message || 'Failed to submit idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-white mb-2">Submit Your Idea</h1>
        <p className="text-stone-400">Share your concept with the world and find support to make it reality.</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm transition-colors ${
                  index < currentStep
                    ? 'bg-amber-500 text-stone-900'
                    : index === currentStep
                    ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500'
                    : 'bg-stone-800 text-stone-500'
                }`}
              >
                {index < currentStep ? <CheckIcon className="w-5 h-5" /> : index + 1}
              </div>
              <span
                className={`ml-3 text-sm font-medium hidden sm:block ${
                  index <= currentStep ? 'text-white' : 'text-stone-500'
                }`}
              >
                {step}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-12 sm:w-24 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-amber-500' : 'bg-stone-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 sm:p-8 mb-8">
        {/* Step 0: Category & Stage */}
        {currentStep === 0 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">What type of idea is this?</h2>
              <p className="text-stone-400 text-sm mb-4">Select the category that best describes your concept.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      category === cat.value
                        ? 'bg-amber-500/10 border-2 border-amber-500 ring-2 ring-amber-500/20'
                        : 'bg-stone-800/50 border-2 border-stone-700 hover:border-stone-600'
                    }`}
                  >
                    <p className={`font-medium ${category === cat.value ? 'text-amber-400' : 'text-white'}`}>
                      {cat.label}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-2">What stage is it at?</h2>
              <p className="text-stone-400 text-sm mb-4">Let people know how far along your idea is.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stages.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStage(s.value)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      stage === s.value
                        ? 'bg-amber-500/10 border-2 border-amber-500 ring-2 ring-amber-500/20'
                        : 'bg-stone-800/50 border-2 border-stone-700 hover:border-stone-600'
                    }`}
                  >
                    <p className={`font-medium ${stage === s.value ? 'text-amber-400' : 'text-white'}`}>
                      {s.label}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">{s.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
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
                placeholder="Describe your idea in detail. Include the problem it solves, how it works, and why it matters."
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
        )}

        {/* Step 2: Resources */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">What do you need?</h2>
              <p className="text-stone-400 text-sm">
                List the resources you're looking for. This helps potential contributors understand how they can help.
              </p>
            </div>

            {/* Resource List */}
            {resources.length > 0 && (
              <div className="space-y-3">
                {resources.map((resource, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-stone-800/50 border border-stone-700 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 capitalize">
                          {resource.type}
                        </span>
                        {resource.amount && (
                          <span className="text-sm text-emerald-400">
                            {resource.currency || '$'}{resource.amount.toLocaleString()}
                            {resource.equity && ` for ${resource.equity}% equity`}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-300">{resource.description}</p>
                    </div>
                    <button
                      onClick={() => removeResource(index)}
                      className="p-1 text-stone-500 hover:text-red-400 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Resource Form */}
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
                    placeholder="Describe what you need and how it will be used"
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
                className="w-full p-4 rounded-xl border-2 border-dashed border-stone-700 text-stone-400 hover:border-amber-500/50 hover:text-amber-400 transition-colors flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add Resource Request
              </button>
            )}

            {resources.length === 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-200">
                  Adding resource requests is optional but helps potential contributors understand how they can help your idea succeed.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Review Your Submission</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-stone-800/50">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Category & Stage</p>
                <p className="text-white">
                  <span className="capitalize">{category}</span> • <span className="capitalize">{stage?.replace('-', ' ')}</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-800/50">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Title</p>
                <p className="text-white font-medium">{title}</p>
              </div>

              <div className="p-4 rounded-xl bg-stone-800/50">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Tagline</p>
                <p className="text-white">{tagline}</p>
              </div>

              <div className="p-4 rounded-xl bg-stone-800/50">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-stone-300 whitespace-pre-wrap">{description}</p>
              </div>

              {tags.length > 0 && (
                <div className="p-4 rounded-xl bg-stone-800/50">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-full bg-stone-700 text-sm text-stone-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resources.length > 0 && (
                <div className="p-4 rounded-xl bg-stone-800/50">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">Resources Needed</p>
                  <div className="space-y-2">
                    {resources.map((r, i) => (
                      <div key={i} className="text-sm text-stone-300">
                        <span className="text-amber-400 capitalize">{r.type}</span>
                        {r.amount && <span className="text-emerald-400"> • {r.currency || '$'}{r.amount.toLocaleString()}</span>}
                        {r.equity && <span className="text-stone-500"> ({r.equity}% equity)</span>}
                        <span className="text-stone-400"> — {r.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-stone-800/50">
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
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-stone-900 font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 font-semibold hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <LightBulbIcon className="w-5 h-5" />
                Submit Idea
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
