import React, { useState } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

export default function AuthTest() {
  const { user, signIn, signOut, loading } = useSupabaseAuth();
  const [email, setEmail] = useState('admin@bitbeheer.nl');
  const [password, setPassword] = useState('admin123');
  const [message, setMessage] = useState('');

  const handleTestLogin = async () => {
    setMessage('Attempting login...');
    
    try {
      // Direct Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        setMessage(`Login failed: ${error.message}`);
        console.error('Login error:', error);
      } else {
        setMessage('Login successful!');
        console.log('Login successful:', data);
      }
    } catch (error) {
      setMessage(`Login error: ${error}`);
      console.error('Login error:', error);
    }
  };

  const handleTestLogout = async () => {
    setMessage('Logging out...');
    
    try {
      // Direct Supabase logout
      const { error } = await supabase.auth.signOut();
      if (error) {
        setMessage(`Logout failed: ${error.message}`);
        console.error('Logout error:', error);
      } else {
        setMessage('Logout successful!');
        console.log('Logout successful');
      }
    } catch (error) {
      setMessage(`Logout error: ${error}`);
      console.error('Logout error:', error);
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
