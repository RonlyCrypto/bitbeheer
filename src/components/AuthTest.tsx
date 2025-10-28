import React, { useState } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useMockAuth } from '../contexts/MockAuthContext';
import { supabase } from '../lib/supabase';

export default function AuthTest() {
  const { user: supabaseUser, signIn: supabaseSignIn, signOut: supabaseSignOut, loading: supabaseLoading } = useSupabaseAuth();
  const { user: mockUser, signIn: mockSignIn, signOut: mockSignOut, loading: mockLoading } = useMockAuth();
  
  // Use mock auth as primary, fallback to Supabase
  const user = mockUser || supabaseUser;
  const signIn = mockSignIn;
  const signOut = mockSignOut;
  const loading = mockLoading || supabaseLoading;
  const [email, setEmail] = useState('admin@bitbeheer.nl');
  const [password, setPassword] = useState('admin123');
  const [message, setMessage] = useState('');

  const handleTestLogin = async () => {
    setMessage('Attempting login...');
    const result = await signIn(email, password);
    if (result.success) {
      setMessage('Login successful!');
    } else {
      setMessage(`Login failed: ${result.error}`);
    }
  };

  const handleTestLogout = async () => {
    setMessage('Logging out...');
    const result = await signOut();
    if (result.success) {
      setMessage('Logout successful!');
    } else {
      setMessage(`Logout failed: ${result.error}`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Authentication Test</h3>
      
      <div className="mb-4">
        <p><strong>Current User:</strong> {user ? `${user.email} (${user.id})` : 'Not logged in'}</p>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      </div>

      <div className="space-y-2 mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-x-2">
        <button
          onClick={handleTestLogin}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Login
        </button>
        <button
          onClick={handleTestLogout}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Logout
        </button>
      </div>

      {message && (
        <div className="mt-4 p-2 bg-yellow-100 border border-yellow-400 rounded">
          {message}
        </div>
      )}
    </div>
  );
}
