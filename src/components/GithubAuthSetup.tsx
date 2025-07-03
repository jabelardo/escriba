'use client';

import { useState } from 'react';

interface GithubAuthSetupProps {
  onSetupComplete: () => void;
}

export default function GithubAuthSetup({ onSetupComplete }: GithubAuthSetupProps) {
  const [githubId, setGithubId] = useState('');
  const [githubSecret, setGithubSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubId, githubSecret }),
      });

      if (response.ok) {
        onSetupComplete();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save GitHub credentials.');
      }
    } catch (err) {
      setError('Network error or unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">GitHub Credentials Setup</h1>
        <p className="text-gray-600 mb-6 text-center">
          Please provide your GitHub OAuth App credentials to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="githubId" className="block text-sm font-medium text-gray-700">
              GitHub Client ID
            </label>
            <input
              type="text"
              id="githubId"
              value={githubId}
              onChange={(e) => setGithubId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="githubSecret" className="block text-sm font-medium text-gray-700">
              GitHub Client Secret
            </label>
            <input
              type="password"
              id="githubSecret"
              value={githubSecret}
              onChange={(e) => setGithubSecret(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Saving...' : 'Save Credentials'}
          </button>
        </form>
      </div>
    </div>
  );
}
