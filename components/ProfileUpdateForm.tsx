'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ProfileUpdateForm() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      // In a real app, this would call a server action to update the profile
      // For now, we'll just show a success message
      // TODO: Implement actual profile update API
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessage('Profile updated successfully! (Note: Full implementation requires backend API)');
      
      // Update local storage user
      const updatedUser = { ...user, name, email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'staff') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-gray-900">
        <p className="text-center">This page is only accessible to staff members.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-gray-900 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Update Profile</h2>
        <p className="text-gray-600">Update your profile information</p>
      </div>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-gray-900 bg-white border-gray-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded text-gray-900 bg-white border-gray-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-gray-900 bg-gray-100 border-gray-300"
            value={user.role}
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
        </div>

        {message && (
          <div className={`p-3 rounded border text-sm ${
            message.includes('success') 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
