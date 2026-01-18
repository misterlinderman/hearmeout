import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  UserCircleIcon,
  EnvelopeIcon,
  MapPinIcon,
  LinkIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, isLoading } = useAuth0();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState('');

  if (isLoading) {
    return <Loading fullScreen message="Loading profile..." />;
  }

  const addExpertise = () => {
    const skill = expertiseInput.trim();
    if (skill && !expertise.includes(skill) && expertise.length < 10) {
      setExpertise([...expertise, skill]);
      setExpertiseInput('');
    }
  };

  const removeExpertise = (skillToRemove: string) => {
    setExpertise(expertise.filter((s) => s !== skillToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setBio('');
    setLocation('');
    setWebsite('');
    setExpertise([]);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
        <p className="text-stone-400">Manage your public profile and personal information</p>
      </div>

      <div className="bg-stone-900/50 border border-stone-800 rounded-2xl overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-32 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20">
          <div className="absolute -bottom-12 left-6">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name || 'Profile'}
                className="w-24 h-24 rounded-2xl border-4 border-stone-900 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl border-4 border-stone-900 bg-stone-800 flex items-center justify-center">
                <UserCircleIcon className="w-12 h-12 text-stone-600" />
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-16 pb-8 px-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-2xl font-bold bg-stone-800 border border-stone-700 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              )}
              <p className="text-stone-400 flex items-center gap-2 mt-1">
                <EnvelopeIcon className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 text-white hover:bg-stone-700 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 text-white hover:bg-stone-700 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-stone-900 font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                  ) : (
                    <CheckIcon className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-2">Bio</label>
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell people about yourself..."
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              ) : (
                <p className="text-stone-300">{bio || 'No bio yet'}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-1" />
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                <p className="text-stone-300">{location || 'Not specified'}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-2">
                <LinkIcon className="w-4 h-4 inline mr-1" />
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              ) : website ? (
                <a href={website} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">
                  {website}
                </a>
              ) : (
                <p className="text-stone-300">Not specified</p>
              )}
            </div>

            {/* Expertise */}
            <div>
              <label className="block text-sm font-medium text-stone-400 mb-2">Areas of Expertise</label>
              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                    placeholder="Add a skill"
                    className="flex-1 px-4 py-2 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={addExpertise}
                    disabled={!expertiseInput.trim()}
                    className="px-4 py-2 rounded-lg bg-stone-700 text-white hover:bg-stone-600 disabled:opacity-50 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {expertise.length > 0 ? (
                  expertise.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-sm"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => removeExpertise(skill)}
                          className="p-0.5 hover:text-red-400 transition-colors"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-stone-500">No expertise added</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="mt-8 bg-stone-900/50 border border-stone-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between py-3 border-b border-stone-800">
            <span className="text-stone-400">Email</span>
            <span className="text-white">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-stone-800">
            <span className="text-stone-400">Auth Provider</span>
            <span className="text-white capitalize">{user?.sub?.split('|')[0] || 'Unknown'}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-stone-400">Email Verified</span>
            <span className={user?.email_verified ? 'text-emerald-400' : 'text-amber-400'}>
              {user?.email_verified ? 'Verified' : 'Not verified'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-stone-400 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors text-sm font-medium">
          Delete Account
        </button>
      </div>
    </div>
  );
}
