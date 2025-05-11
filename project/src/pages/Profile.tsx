import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Profile as ProfileType } from '../types';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<ProfileType>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user profile from backend
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setEditMode(false);
        } else {
          setProfile({});
          setEditMode(true); // No profile yet, go to edit mode
        }
      } catch (err) {
        setError('Could not load profile.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    setError('');
    try {
      let avatarUrl = profile.avatar;
      if (avatarFile) {
        // Simulate upload, in real app upload to server or cloud storage
        avatarUrl = URL.createObjectURL(avatarFile);
      }
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...profile,
          avatar: avatarUrl,
        }),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setSuccess('Profile updated successfully!');
      setAvatarFile(null);
      setEditMode(false);
    } catch (err) {
      setError('Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Not logged in.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        {success && <div className="mb-4 text-green-600">{success}</div>}
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {!editMode ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-2">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-3xl text-gray-400">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">Name</span>
              <span className="block text-lg font-semibold text-gray-900">{user.name}</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">Email</span>
              <span className="block text-lg text-gray-900">{user.email}</span>
            </div>
            {profile.bio && (
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">Bio</span>
                <span className="block text-gray-900">{profile.bio}</span>
              </div>
            )}
            {profile.college && (
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">College</span>
                <span className="block text-gray-900">{profile.college}</span>
              </div>
            )}
            <div className="flex justify-end">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-2">
                {avatarFile ? (
                  <img src={URL.createObjectURL(avatarFile)} alt="Avatar" className="w-full h-full object-cover" />
                ) : profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-3xl text-gray-400">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label className="block text-sm font-medium text-gray-700 cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <span className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Upload Photo</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={user.name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                name="bio"
                value={profile.bio || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
              <input
                type="text"
                name="college"
                value={profile.college || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Your college name"
              />
            </div>
            {/* Add more student details here as needed */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="ml-3 px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => setEditMode(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile; 