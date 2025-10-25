import { useState } from 'react';
import { Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSupabaseTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-supabase');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Network error',
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Supabase Test</h1>
                <p className="text-gray-600">Test de Supabase database koppeling</p>
              </div>
            </div>
            
            <button
              onClick={runSupabaseTest}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Testen...' : 'Supabase Test Uitvoeren'}
            </button>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Resultaten</h2>
              
              <div className={`p-4 rounded-lg mb-4 ${
                testResult.success 
                  ? 'bg-green-100 border border-green-200' 
                  : 'bg-red-100 border border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-bold ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResult.success ? 'Test Geslaagd!' : 'Test Gefaald!'}
                  </span>
                </div>
                
                {testResult.message && (
                  <p className={`text-sm ${
                    testResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {testResult.message}
                  </p>
                )}
              </div>

              {testResult.error && (
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 mb-2">Foutmelding:</h3>
                  <p className="text-red-600 bg-red-50 p-3 rounded-lg">
                    {testResult.error}
                  </p>
                </div>
              )}

              {testResult.details && (
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 mb-2">Details:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {typeof testResult.details === 'string' 
                        ? testResult.details 
                        : JSON.stringify(testResult.details, null, 2)
                      }
                    </pre>
                  </div>
                </div>
              )}

              {/* Environment Variables Status */}
              <div className="mt-6">
                <h3 className="font-bold text-gray-900 mb-2">Environment Variables Status:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">VITE_SUPABASE_URL / REACT_APP_SUPABASE_URL</p>
                    <p className="font-mono text-xs text-gray-800">
                      {import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL || 'Niet ingesteld'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">VITE_SUPABASE_ANON_KEY / REACT_APP_SUPABASE_ANON_KEY</p>
                    <p className="font-mono text-xs text-gray-800">
                      {(import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.REACT_APP_SUPABASE_ANON_KEY) ? 
                        (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.REACT_APP_SUPABASE_ANON_KEY).substring(0, 10) + '...' : 
                        'Niet ingesteld'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
