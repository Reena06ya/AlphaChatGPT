import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';
import SettingsModal from '../Settings/SettingsModal';
import useAutoHeight from '../../hooks/useAutoHeight';
import ReactMarkdown from 'react-markdown';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Dark code block highlighting
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';

import { 
  Bot, SidebarClose, SidebarOpen, Plus, Search, 
  Pin, Folder, FolderPlus, MoreVertical, Edit2, 
  Trash, LogOut, Settings, Award, User, ChevronDown, 
  Paperclip, Image, Mic, MicOff, Send, X, Copy, RotateCcw, 
  ThumbsUp, ThumbsDown, Volume2, StopCircle, RefreshCw, 
  Share2, FileDown, Check, Globe 
} from 'lucide-react';

export default function ChatWorkspace() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { 
    chats, activeChat, loading, streaming, streamedContent, 
    folders, createNewChat, renameChat, pinChat, moveChatToFolder, 
    deleteChat, sendMessage, uploadAttachment, likeMessage, 
    shareChat, exportChat, stopGeneration, loadChatDetails, setActiveChat 
  } = useChat();

  // Navigation / UI States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active actions
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [model, setModel] = useState(user?.settings?.model || 'AlphaGPT-4');
  
  // Message input state
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Sharing state
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  // Speech / Recognition
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Copy status indicators
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Refs
  const messageEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-height textarea
  useAutoHeight(textareaRef, message);

  // Trigger Prism highlighting on content update
  useEffect(() => {
    Prism.highlightAll();
  }, [activeChat?.messages, streamedContent]);

  // Scroll to bottom on messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, streamedContent]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setMessage(prev => prev + ' ' + transcript);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  // Filter chats by query
  const filteredChats = chats.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartVoice = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;
    const msgText = message;
    setMessage('');
    const currentAttachments = [...attachments];
    setAttachments([]);
    
    await sendMessage(activeChat?._id, msgText, currentAttachments);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadAttachment(file);
      setAttachments(prev => [...prev, uploaded]);
    } catch (err) {
      alert(err.toString());
    } finally {
      setUploading(false);
    }
  };

  const handleCopyText = (text, msgId) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleTextToSpeech = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel active voice
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  const handleShareClick = async (chatId) => {
    try {
      const url = await shareChat(chatId);
      setShareUrl(url);
      setShowShareModal(true);
    } catch (err) {
      alert('Error creating share link');
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Suggestion card prompts
  const suggestionCards = [
    { title: "Explain code", desc: "Understand a script using detailed modular breakups", prompt: "Explain how React transitions work under the hood." },
    { title: "Write blog", desc: "Draft a high-quality article about future AI engineering", prompt: "Write a short blog post on the future of autonomous coding agents." },
    { title: "Generate SQL", desc: "Create queries based on natural relational data specs", prompt: "Generate an SQL query that reports active subscription revenues." },
    { title: "Solve math", desc: "Solve algebraic equations with formula outlines", prompt: "Solve the quadratic equation x^2 - 5x + 6 = 0." }
  ];

  // Helper stats values
  const getWordCount = () => {
    if (!activeChat) return 0;
    return activeChat.messages.reduce((sum, m) => sum + m.content.split(/\s+/).filter(Boolean).length, 0);
  };

  const getTokenCount = () => {
    if (!activeChat) return 0;
    return activeChat.messages.reduce((sum, m) => sum + (m.tokens || 0), 0);
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-300 flex overflow-hidden">
      
      {/* SIDEBAR LEFT */}
      <aside 
        className={`bg-darkCard border-r border-darkBorder flex flex-col justify-between transition-all duration-300 ${
          sidebarCollapsed ? 'w-0 overflow-hidden border-r-0 md:w-0' : 'w-72'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo Banner */}
          <div className="p-4 border-b border-darkBorder flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-md font-bold text-white tracking-tight">AlphaChatGPT</span>
            </div>
            <button 
              onClick={() => setSidebarCollapsed(true)}
              className="text-gray-500 hover:text-white transition-all hidden md:block"
            >
              <SidebarClose className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button 
              onClick={() => createNewChat('New Chat', model)}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-premium flex items-center justify-center space-x-2 shadow-lg shadow-primary/10 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Search Chats Input */}
          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input 
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-darkBg border border-darkBorder rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Chats Lists - History */}
          <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
            {/* Pinned Chats */}
            {filteredChats.filter(c => c.pinned).length > 0 && (
              <div className="space-y-1 mb-4">
                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider px-3 mb-1">
                  Pinned
                </div>
                {filteredChats.filter(c => c.pinned).map((chat) => (
                  <ChatListItem 
                    key={chat._id}
                    chat={chat}
                    activeId={activeChat?._id}
                    editingId={editingChatId}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    setEditingChatId={setEditingChatId}
                    renameChat={renameChat}
                    pinChat={pinChat}
                    deleteChat={deleteChat}
                    loadChatDetails={loadChatDetails}
                    folders={folders}
                    moveChatToFolder={moveChatToFolder}
                  />
                ))}
              </div>
            )}

            {/* Folders grouping */}
            {folders.map(folder => {
              const folderChats = filteredChats.filter(c => c.folder === folder);
              if (folderChats.length === 0) return null;
              return (
                <div key={folder} className="mb-4">
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-gray-600 uppercase tracking-wider px-3 mb-1">
                    <Folder className="w-3.5 h-3.5 text-primary" />
                    <span>{folder}</span>
                  </div>
                  {folderChats.map((chat) => (
                    <ChatListItem 
                      key={chat._id}
                      chat={chat}
                      activeId={activeChat?._id}
                      editingId={editingChatId}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      setEditingChatId={setEditingChatId}
                      renameChat={renameChat}
                      pinChat={pinChat}
                      deleteChat={deleteChat}
                      loadChatDetails={loadChatDetails}
                      folders={folders}
                      moveChatToFolder={moveChatToFolder}
                    />
                  ))}
                </div>
              );
            })}

            {/* Regular Chat History */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider px-3 mb-1">
                Recent Chats
              </div>
              {filteredChats.filter(c => !c.pinned && !c.folder).map((chat) => (
                <ChatListItem 
                  key={chat._id}
                  chat={chat}
                  activeId={activeChat?._id}
                  editingId={editingChatId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  setEditingChatId={setEditingChatId}
                  renameChat={renameChat}
                  pinChat={pinChat}
                  deleteChat={deleteChat}
                  loadChatDetails={loadChatDetails}
                  folders={folders}
                  moveChatToFolder={moveChatToFolder}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Area */}
        <div className="p-4 border-t border-darkBorder bg-darkBg/50 space-y-3">
          {user?.role === 'admin' && (
            <button 
              onClick={() => navigate('/admin')}
              className="w-full flex items-center space-x-3 px-3 py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-xl text-xs font-bold border border-red-900/20 transition-all"
            >
              <Award className="w-4.5 h-4.5 text-red-400" />
              <span>Admin Console</span>
            </button>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-xs truncate max-w-[120px]">
                <div className="font-semibold text-white truncate">{user?.name}</div>
                <div className="text-[10px] text-gray-500 truncate">{user?.subscription?.plan || 'Free'} Plan</div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setSettingsOpen(true)}
                className="p-1.5 text-gray-500 hover:text-white rounded-lg"
              >
                <Settings className="w-4.5 h-4.5" />
              </button>
              <button 
                onClick={logout}
                className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* CHAT SECTION AREA */}
      <main className="flex-1 flex flex-col bg-darkBg overflow-hidden relative">
        {/* Toggle closed sidebar icon */}
        {sidebarCollapsed && (
          <button 
            onClick={() => setSidebarCollapsed(false)}
            className="absolute left-4 top-4 z-40 p-2.5 bg-darkCard border border-darkBorder hover:text-white rounded-xl shadow-lg"
          >
            <SidebarOpen className="w-4.5 h-4.5" />
          </button>
        )}

        {/* TOP BAR */}
        <header className="h-16 bg-darkBg border-b border-darkBorder px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4 pl-12 md:pl-0">
            <h2 className="text-sm font-bold text-white truncate max-w-sm">
              {activeChat ? activeChat.title : 'AlphaChatGPT Workspace'}
            </h2>
            
            {/* Model Selector Dropdown */}
            <div className="relative">
              <select 
                value={model} 
                onChange={(e) => {
                  setModel(e.target.value);
                  if (activeChat) {
                    // Update current chat model
                    api.put(`/chat/${activeChat._id}`, { model: e.target.value }).then(() => {
                      loadChatDetails(activeChat._id);
                    });
                  }
                }}
                className="bg-darkCard border border-darkBorder rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none"
              >
                <option value="AlphaGPT-4">AlphaGPT-4</option>
                <option value="AlphaGPT-Coder">AlphaGPT-Coder</option>
                <option value="AlphaGPT-Vision">AlphaGPT-Vision</option>
                <option value="AlphaGPT-Lite">AlphaGPT-Lite</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {activeChat && (
              <button 
                onClick={() => handleShareClick(activeChat._id)}
                className="p-2 border border-darkBorder rounded-xl hover:bg-darkCard text-gray-500 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}

            <button 
              onClick={toggleTheme}
              className="p-2 border border-darkBorder rounded-xl text-gray-500 hover:text-white transition-all"
            >
              <Globe className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className={`p-2 border border-darkBorder rounded-xl transition-all ${
                rightPanelOpen ? 'bg-primary/10 text-primary border-primary/20' : 'text-gray-500 hover:text-white'
              }`}
            >
              <SidebarOpen className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </header>

        {/* MESSAGES VIEW */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Welcome Screen suggestions */}
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="max-w-3xl mx-auto pt-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/10 mb-6">
                <Bot className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">How can AlphaChatGPT help today?</h1>
              <p className="text-gray-500 text-sm max-w-md mb-12">Ask queries about coding, generate blogs, resolve complex formulas, or read attachments.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
                {suggestionCards.map((card, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setMessage(card.prompt);
                      textareaRef.current?.focus();
                    }}
                    className="p-5 rounded-premium border border-darkBorder bg-darkCard/30 hover:bg-darkCard hover:border-primary/20 hover:scale-[1.01] transition-all text-left group"
                  >
                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-primary transition-colors">{card.title}</h4>
                    <p className="text-xs text-gray-500 leading-normal">{card.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Message Thread list
            <div className="max-w-3xl mx-auto space-y-6">
              {activeChat.messages.map((msg) => (
                <div 
                  key={msg._id}
                  className={`flex space-x-4 items-start ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Avatar AI */}
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 border border-primary/10">
                      🤖
                    </div>
                  )}

                  {/* Bubble */}
                  <div className={`rounded-premium p-5 max-w-[85%] border relative group ${
                    msg.role === 'user' 
                      ? 'bg-darkCard border-darkBorder text-white rounded-tr-none' 
                      : 'bg-darkCard/40 border-darkBorder/40 text-gray-300 rounded-tl-none'
                  }`}>
                    {/* Attachments inside bubble */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.attachments.map((att, i) => (
                          <div key={i} className="flex items-center space-x-2 px-3 py-1.5 bg-darkBg border border-darkBorder rounded-lg text-xs">
                            <Paperclip className="w-3.5 h-3.5 text-primary" />
                            <a href={`http://localhost:5000${att.url}`} target="_blank" rel="noreferrer" className="text-white hover:underline truncate max-w-[150px]">
                              {att.name}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Content Markdown */}
                    <div className="markdown-content text-sm leading-relaxed">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    {/* Action Bar (under each message block on hover) */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2 mt-4 pt-2 border-t border-darkBorder/20 text-gray-500 transition-opacity">
                      <button 
                        onClick={() => handleCopyText(msg.content, msg._id)}
                        className="p-1 hover:text-white"
                        title="Copy text"
                      >
                        {copiedMessageId === msg._id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button 
                        onClick={() => handleTextToSpeech(msg.content)}
                        className="p-1 hover:text-white"
                        title="Speak aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {msg.role !== 'user' && (
                        <>
                          <button 
                            onClick={() => likeMessage(activeChat._id, msg._id, true)}
                            className={`p-1 hover:text-white ${msg.likes === true ? 'text-primary' : ''}`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => likeMessage(activeChat._id, msg._id, false)}
                            className={`p-1 hover:text-white ${msg.likes === false ? 'text-red-400' : ''}`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => sendMessage(activeChat._id, activeChat.messages[activeChat.messages.indexOf(msg) - 1]?.content || '')}
                            className="p-1 hover:text-white"
                            title="Regenerate reply"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Avatar User */}
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary font-bold flex items-center justify-center text-xs shrink-0 border border-secondary/10">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming AI content chunk */}
              {streaming && streamedContent && (
                <div className="flex space-x-4 items-start justify-start">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 border border-primary/10">
                    🤖
                  </div>
                  <div className="rounded-premium p-5 max-w-[85%] border bg-darkCard/40 border-darkBorder/40 text-gray-300 rounded-tl-none">
                    <div className="markdown-content text-sm leading-relaxed">
                      <ReactMarkdown>{streamedContent}</ReactMarkdown>
                    </div>
                    {/* Small pulsing cursor indicating active stream */}
                    <span className="inline-block w-2.5 h-4 bg-primary animate-pulse ml-1 align-middle" />
                  </div>
                </div>
              )}

              {/* Loading Skeleton Placeholder when streaming waiting for first reply */}
              {streaming && !streamedContent && (
                <div className="flex space-x-4 items-start justify-start">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">🤖</div>
                  <div className="space-y-2 p-5 bg-darkCard/40 border border-darkBorder/40 rounded-premium max-w-sm flex-1 skeleton-pulse">
                    <div className="h-4 bg-darkBorder rounded w-3/4" />
                    <div className="h-3 bg-darkBorder/60 rounded w-5/6" />
                    <div className="h-3 bg-darkBorder/60 rounded w-2/3" />
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={messageEndRef} />
        </div>

        {/* INPUT CONTAINER BOX */}
        <div className="p-6 border-t border-darkBorder bg-darkBg">
          <div className="max-w-3xl mx-auto space-y-4">
            
            {/* Selected Attachment previews */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center space-x-2 bg-darkCard border border-darkBorder px-3 py-1.5 rounded-xl text-xs">
                    <Paperclip className="w-3.5 h-3.5 text-primary" />
                    <span className="text-white truncate max-w-[120px] font-medium">{att.name}</span>
                    <button 
                      onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Box Card */}
            <div className="glass-card rounded-premium p-2 flex flex-col space-y-2 border border-white/5 relative">
              <textarea 
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask AlphaChatGPT anything..."
                rows={1}
                className="w-full bg-transparent px-4 py-3 text-white text-sm focus:outline-none resize-none custom-scrollbar"
              />

              <div className="flex items-center justify-between border-t border-darkBorder/20 pt-2 px-2">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 hover:bg-darkCard rounded-xl text-gray-500 hover:text-white"
                    title="Upload File"
                  >
                    <Paperclip className="w-4.5 h-4.5" />
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <button 
                    onClick={handleStartVoice}
                    className={`p-2 rounded-xl transition-all ${
                      isListening ? 'bg-red-500/20 text-red-400 border border-red-950' : 'hover:bg-darkCard text-gray-500 hover:text-white'
                    }`}
                    title="Voice Input"
                  >
                    {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {streaming && (
                    <button 
                      onClick={stopGeneration}
                      className="px-4 py-2 bg-red-950/20 border border-red-900/30 hover:bg-red-950 text-red-400 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
                    >
                      <StopCircle className="w-4 h-4" />
                      <span>Stop</span>
                    </button>
                  )}

                  <button 
                    onClick={handleSend}
                    className="p-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl shadow shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Keyboard shortcut help */}
            <div className="text-center text-[10px] text-gray-600">
              Shift + Enter for new line. Enter to send message.
            </div>
          </div>
        </div>

      </main>

      {/* RIGHT SIDE DETAILS PANEL */}
      {rightPanelOpen && (
        <aside className="w-72 bg-darkCard border-l border-darkBorder p-6 hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-darkBorder">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Details</h3>
            <button 
              onClick={() => setRightPanelOpen(false)}
              className="text-gray-500 hover:text-white"
            >
              <SidebarClose className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500">AI Model Instance</span>
              <div className="bg-darkBg border border-darkBorder rounded-xl p-3 mt-1 text-xs text-white font-semibold">
                {activeChat ? activeChat.model : model}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500">Word Count Summary</span>
              <div className="bg-darkBg border border-darkBorder rounded-xl p-3 mt-1 text-xs text-white font-semibold">
                {getWordCount()} words
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500">Estimated Tokens Logged</span>
              <div className="bg-darkBg border border-darkBorder rounded-xl p-3 mt-1 text-xs text-white font-semibold">
                {getTokenCount()} tokens
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500">Created Date</span>
              <div className="bg-darkBg border border-darkBorder rounded-xl p-3 mt-1 text-xs text-white font-semibold">
                {activeChat ? new Date(activeChat.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          {activeChat && (
            <div className="pt-4 border-t border-darkBorder space-y-3">
              <span className="text-[10px] uppercase font-bold text-gray-500">Export Chat History</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => exportChat(activeChat._id, 'md')}
                  className="py-2 border border-darkBorder rounded-xl text-xs hover:bg-darkBg font-semibold transition-all flex items-center justify-center space-x-1.5 text-white"
                >
                  <FileDown className="w-3.5 h-3.5 text-primary" />
                  <span>Markdown</span>
                </button>
                <button 
                  onClick={() => exportChat(activeChat._id, 'txt')}
                  className="py-2 border border-darkBorder rounded-xl text-xs hover:bg-darkBg font-semibold transition-all flex items-center justify-center space-x-1.5 text-white"
                >
                  <FileDown className="w-3.5 h-3.5 text-secondary" />
                  <span>Plain Text</span>
                </button>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* SETTINGS MODAL */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* SHARE LINK MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-darkCard border border-darkBorder rounded-premium p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Share Conversation</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">Anyone with this link can view the conversation history.</p>
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                readOnly
                value={shareUrl}
                className="flex-1 bg-darkBg border border-darkBorder rounded-xl p-3 text-xs text-white font-mono focus:outline-none"
              />
              <button 
                onClick={copyShareLink}
                className="p-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Side list items sub-component
function ChatListItem({ 
  chat, activeId, editingId, editTitle, setEditTitle, 
  setEditingChatId, renameChat, pinChat, deleteChat, 
  loadChatDetails, folders, moveChatToFolder 
}) {
  const [showOptions, setShowOptions] = useState(false);

  const triggerRename = (e) => {
    e.stopPropagation();
    renameChat(chat._id, editTitle);
    setEditingChatId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      triggerRename(e);
    }
  };

  return (
    <div 
      onClick={() => loadChatDetails(chat._id)}
      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all border text-xs relative ${
        chat._id === activeId 
          ? 'bg-darkBg/60 text-white border-primary/20' 
          : 'text-gray-400 border-transparent hover:bg-darkBg/30 hover:text-white'
      }`}
    >
      <div className="flex items-center space-x-2.5 truncate flex-1 pr-8">
        <Bot className={`w-4.5 h-4.5 shrink-0 ${chat._id === activeId ? 'text-primary' : 'text-gray-600'}`} />
        
        {editingId === chat._id ? (
          <input 
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={triggerRename}
            onKeyDown={handleKeyDown}
            className="bg-darkBg border border-primary rounded text-xs px-1.5 py-0.5 text-white w-full focus:outline-none"
            autoFocus
          />
        ) : (
          <span className="truncate font-medium">{chat.title}</span>
        )}
      </div>

      {/* Floating option menu for each item */}
      <div className="absolute right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            pinChat(chat._id, !chat.pinned);
          }}
          className="p-1 hover:text-white text-gray-500"
          title="Pin conversation"
        >
          <Pin className={`w-3.5 h-3.5 ${chat.pinned ? 'text-primary fill-primary' : ''}`} />
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(!showOptions);
          }}
          className="p-1 hover:text-white text-gray-500"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {showOptions && (
          <div className="absolute right-0 top-6 z-50 bg-darkCard border border-darkBorder rounded-xl shadow-xl py-1.5 w-44">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setEditingChatId(chat._id);
                setEditTitle(chat.title);
                setShowOptions(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-darkBg text-xs flex items-center space-x-2 text-white"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Rename</span>
            </button>

            {folders.map(f => (
              <button 
                key={f}
                onClick={(e) => {
                  e.stopPropagation();
                  moveChatToFolder(chat._id, chat.folder === f ? null : f);
                  setShowOptions(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-darkBg text-[11px] flex items-center space-x-2 text-white/70"
              >
                <Folder className="w-3.5 h-3.5 text-primary" />
                <span>{chat.folder === f ? 'Remove from ' : 'Move to '} {f}</span>
              </button>
            ))}

            <hr className="border-darkBorder my-1" />

            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat._id);
                setShowOptions(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-red-950/20 text-xs flex items-center space-x-2 text-red-400"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
