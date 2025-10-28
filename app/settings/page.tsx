'use client'

import { useState, useEffect } from 'react'
import { Settings, Key, Save, AlertCircle, CheckCircle, ExternalLink, Home, Github } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [savedKey, setSavedKey] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    // Load saved API key from localStorage
    const stored = localStorage.getItem('alphagenome_api_key')
    if (stored) {
      setSavedKey(stored)
      setApiKey(stored)
    }
  }, [])

  const handleSave = () => {
    if (!apiKey.trim()) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
      return
    }

    localStorage.setItem('alphagenome_api_key', apiKey.trim())
    setSavedKey(apiKey.trim())
    setSaveStatus('success')
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const handleClear = () => {
    localStorage.removeItem('alphagenome_api_key')
    setApiKey('')
    setSavedKey('')
    setSaveStatus('idle')
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key
    return `${key.substring(0, 4)}${'*'.repeat(key.length - 8)}${key.substring(key.length - 4)}`
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <Link 
            href="/"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* API Key Configuration */}
        <div className="bg-white/95 rounded-2xl shadow-2xl p-8 border border-gray-200 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">API Key Configuration</h2>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">Important: API Key Required</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  This application uses Google's Gemini AI API for genomic analysis. If you encounter authentication errors, 
                  you need to obtain your own free Google Gemini API key. Your API key is stored locally in your browser 
                  and never sent to our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          {savedKey && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">API Key Configured</span>
                </div>
                <code className="text-xs bg-green-100 px-3 py-1 rounded font-mono text-green-800">
                  {showKey ? savedKey : maskApiKey(savedKey)}
                </code>
              </div>
            </div>
          )}

          {/* API Key Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-800 mb-2">
              AlphaGenome API Key
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your AlphaGenome API key..."
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm transition-all"
              >
                {showKey ? '👁️ Hide' : '👁️ Show'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save API Key
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition-all"
            >
              Clear
            </button>
          </div>

          {/* Save Status */}
          {saveStatus === 'success' && (
            <div className="mt-4 bg-green-100 border border-green-400 rounded-lg p-3 text-green-900 text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">API Key saved successfully!</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="mt-4 bg-red-100 border border-red-400 rounded-lg p-3 text-red-900 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Please enter a valid API key</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white/95 rounded-2xl shadow-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Get Your Google Gemini API Key</h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">Visit Google AI Studio</h3>
                <p className="text-gray-700 mb-2">
                  Go to Google AI Studio to get your free API key:
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get API Key from Google AI Studio
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">Sign In with Google Account</h3>
                <p className="text-gray-700">
                  Sign in with your Google account. If you don't have one, create a free Google account first.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">Create API Key</h3>
                <p className="text-gray-700 mb-2">
                  Click "Create API Key" button. You can create a new API key in a new project or use an existing Google Cloud project.
                </p>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Note:</span> The Gemini API has a generous free tier with 
                    1,500 requests per day and 1 million tokens per minute, perfect for genomic analysis!
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">Copy and Paste Your API Key</h3>
                <p className="text-gray-700 mb-2">
                  Copy your API key (it will look like: AIzaSy...) and paste it in the field above. 
                  Click "Save API Key" to store it securely in your browser.
                </p>
                <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">⚠️ Important:</span> Keep your API key secure. Don't share it publicly 
                    or commit it to version control systems.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Additional Resources</h3>
            <div className="space-y-3">
              <a
                href="https://ai.google.dev/gemini-api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Gemini API Documentation
              </a>
              <a
                href="https://ai.google.dev/gemini-api/docs/quickstart"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Getting Started Guide
              </a>
              <a
                href="https://ai.google.dev/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Pricing & Free Tier Information
              </a>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Security & Privacy</h3>
                <p className="text-sm text-blue-800">
                  Your API key is stored locally in your browser and is never transmitted to any third-party servers. 
                  It's only used to authenticate requests directly to AlphaGenome's API.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
