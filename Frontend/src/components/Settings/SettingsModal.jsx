import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { X, User, Shield, Monitor, Key, Trash2, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, updateProfile, updateSettings, deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  // AI & Memory Form
  const [model, setModel] = useState(user?.settings?.model || 'AlphaGPT-4');
  const [systemPrompt, setSystemPrompt] = useState(user?.settings?.systemPrompt || '');
  const [memoryEnabled, setMemoryEnabled] = useState(user?.settings?.memoryEnabled ?? true);
  const [aiMsg, setAiMsg] = useState('');

  // API Key Form
  const [apiKey, setApiKey] = useState('sk-alpha-••••••••••••••••••••');
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      await updateProfile({ name, email, password });
      setProfileMsg('Profile updated successfully!');
      setPassword('');
    } catch (err) {
      setProfileMsg(err.toString());
    }
  };

  const handleAISave = async (e) => {
    e.preventDefault();
    setAiMsg('');
    try {
      await updateSettings({ model, systemPrompt, memoryEnabled });
      setAiMsg('Model configurations saved!');
    } catch (err) {
      setAiMsg(err.toString());
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('WARNING: Are you sure you want to permanently delete your account and all conversations? This action is irreversible.')) {
      try {
        await deleteAccount();
      } catch (err) {
        alert(err.toString());
      }
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'model', name: 'Model & Memory', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'appearance', name: 'Appearance', icon: <Monitor className="w-4 h-4" /> },
    { id: 'keys', name: 'API Keys', icon: <Key className="w-4 h-4" /> },
    { id: 'data', name: 'Data Controls', icon: <Trash2 className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-darkCard border border-darkBorder rounded-premium overflow-hidden shadow-2xl flex flex-col md:flex-row h-[500px]"
      >
        {/* Left tabs pane */}
        <div className="w-full md:w-1/3 bg-darkBg border-r border-darkBorder p-4 flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 overflow-x-auto md:overflow-x-visible">
          <div className="hidden md:block text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 px-3">
            Settings
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                activeTab === tab.id 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-gray-400 hover:text-white hover:bg-darkCard'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Right content pane */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-darkBorder mb-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                {tabs.find(t => t.id === activeTab)?.name} Settings
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs content */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-4">
                {profileMsg && <div className="text-sm font-semibold text-primary">{profileMsg}</div>}
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold uppercase">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-xl text-white text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold uppercase">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-xl text-white text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold uppercase">New Password (optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-xl text-white text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-all"
                >
                  Save Changes
                </button>
              </form>
            )}

            {activeTab === 'model' && (
              <form onSubmit={handleAISave} className="space-y-4">
                {aiMsg && <div className="text-sm font-semibold text-primary">{aiMsg}</div>}
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold uppercase">Default Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-xl text-white text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="AlphaGPT-4">AlphaGPT-4 (Default High Intelligence)</option>
                    <option value="AlphaGPT-Coder">AlphaGPT-Coder (High Code Competence)</option>
                    <option value="AlphaGPT-Vision">AlphaGPT-Vision (Image Input Enabled)</option>
                    <option value="AlphaGPT-Lite">AlphaGPT-Lite (Speed Optimized)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold uppercase">System Prompt Instructions</label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Adhere to strict types... Speak in pirate terms..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-xl text-white text-sm focus:border-primary focus:outline-none resize-none"
                  />
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <input
                    type="checkbox"
                    id="memoryEnabled"
                    checked={memoryEnabled}
                    onChange={(e) => setMemoryEnabled(e.target.checked)}
                    className="w-4 h-4 text-primary bg-darkBg border-darkBorder rounded focus:ring-primary"
                  />
                  <label htmlFor="memoryEnabled" className="text-sm text-gray-300 font-medium cursor-pointer">
                    Enable Conversation Memory Cache
                  </label>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-all"
                >
                  Save Configuration
                </button>
              </form>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Application Theme</h4>
                    <p className="text-xs text-gray-500">Toggle between dark night mode and standard light mode layouts.</p>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className="px-4 py-2 bg-darkBg border border-darkBorder text-white text-xs font-bold rounded-xl hover:bg-darkCard transition-all"
                  >
                    Set {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </button>
                </div>
                <hr className="border-darkBorder" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Local Interface Language</h4>
                    <p className="text-xs text-gray-500">Language translation for layouts, menus and dashboard buttons.</p>
                  </div>
                  <select className="px-3 py-2 bg-darkBg border border-darkBorder rounded-xl text-white text-xs focus:outline-none">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Chinese</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'keys' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white">Custom API Provider Credentials</h4>
                <p className="text-xs text-gray-500">
                  Integrate your personal OpenAI/Anthropic API keys to override platform volume limits and consume direct tokens.
                </p>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 px-4 py-2 bg-darkBg border border-darkBorder rounded-xl text-white text-xs font-mono focus:outline-none"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="px-3 py-2 border border-darkBorder rounded-xl text-xs hover:bg-darkBg transition-all"
                  >
                    {showKey ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all">
                  Save API Key
                </button>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Export Personal Workspace</h4>
                  <p className="text-xs text-gray-500 mb-3">Download a ZIP file containing all chats, settings, and file logs.</p>
                  <button className="px-4 py-2 border border-darkBorder rounded-xl text-xs hover:bg-darkBg transition-all text-white font-semibold">
                    Download Export (JSON)
                  </button>
                </div>
                <hr className="border-darkBorder" />
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl">
                  <h4 className="text-sm font-bold text-red-400 mb-1">Danger Zone</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Deleting your account permanently removes all stored data. There is no way to undo this transaction.
                  </p>
                  <button 
                    onClick={handleDeleteAccount}
                    className="px-4 py-2.5 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
