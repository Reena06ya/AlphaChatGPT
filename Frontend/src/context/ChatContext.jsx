import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, useAuth } from './AuthContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { token, user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [folders, setFolders] = useState(['Personal', 'Coding', 'Writing', 'Study']);
  const [abortController, setAbortController] = useState(null);

  // Load chat lists when logged in
  useEffect(() => {
    if (token) {
      loadChats();
    } else {
      setChats([]);
      setActiveChat(null);
    }
  }, [token]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/chat');
      setChats(res.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatDetails = async (chatId) => {
    try {
      setLoading(true);
      const res = await api.get(`/chat/${chatId}`);
      setActiveChat(res.data);
      return res.data;
    } catch (error) {
      console.error('Error loading chat details:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async (title = 'New Chat', model = 'AlphaGPT-4') => {
    try {
      const res = await api.post('/chat', { title, model });
      setChats(prev => [res.data, ...prev]);
      setActiveChat(res.data);
      return res.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const renameChat = async (chatId, title) => {
    try {
      const res = await api.put(`/chat/${chatId}`, { title });
      setChats(prev => prev.map(c => c._id === chatId ? { ...c, title } : c));
      if (activeChat && activeChat._id === chatId) {
        setActiveChat(prev => ({ ...prev, title }));
      }
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  const pinChat = async (chatId, pinned) => {
    try {
      await api.put(`/chat/${chatId}`, { pinned });
      setChats(prev => prev.map(c => c._id === chatId ? { ...c, pinned } : c).sort((a, b) => b.pinned - a.pinned));
      if (activeChat && activeChat._id === chatId) {
        setActiveChat(prev => ({ ...prev, pinned }));
      }
    } catch (error) {
      console.error('Error pinning chat:', error);
    }
  };

  const moveChatToFolder = async (chatId, folder) => {
    try {
      await api.put(`/chat/${chatId}`, { folder });
      setChats(prev => prev.map(c => c._id === chatId ? { ...c, folder } : c));
      if (activeChat && activeChat._id === chatId) {
        setActiveChat(prev => ({ ...prev, folder }));
      }
    } catch (error) {
      console.error('Error moving chat to folder:', error);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await api.delete(`/chat/${chatId}`);
      setChats(prev => prev.filter(c => c._id !== chatId));
      if (activeChat && activeChat._id === chatId) {
        setActiveChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setStreaming(false);
      setAbortController(null);
      // Re-load details to sync whatever was finished
      if (activeChat) {
        loadChatDetails(activeChat._id);
      }
    }
  };

  const sendMessage = async (chatId, messageText, attachments = []) => {
    if (!messageText.trim() && attachments.length === 0) return;

    let currentChatId = chatId;

    // Create a new chat first if none active
    if (!currentChatId) {
      const newChat = await createNewChat('New Chat', user?.settings?.model || 'AlphaGPT-4');
      currentChatId = newChat._id;
    }

    // Set streaming state
    setStreaming(true);
    setStreamedContent('');
    
    // Add user message optimistically to activeChat screen
    const userMsg = {
      _id: 'temp-user-msg',
      role: 'user',
      content: messageText,
      attachments,
      timestamp: new Date().toISOString()
    };
    
    setActiveChat(prev => {
      const currentMsgs = prev?.messages || [];
      return {
        ...prev,
        _id: currentChatId,
        messages: [...currentMsgs, userMsg]
      };
    });

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch(`http://localhost:5000/api/chat/${currentChatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: messageText, attachments }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('Streaming request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finished = false;
      let accumulatedReply = '';

      while (!finished) {
        const { value, done } = await reader.read();
        finished = done;
        if (value) {
          const chunk = decoder.decode(value, { stream: !finished });
          
          // SSE format outputs multiple "data: {...}" lines
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.trim().startsWith('data: ')) {
              const dataStr = line.substring(6).trim();
              if (dataStr) {
                try {
                  const data = JSON.parse(dataStr);
                  if (data.type === 'start') {
                    // Update title if needed
                    if (data.chatTitle) {
                      setChats(prev => prev.map(c => c._id === currentChatId ? { ...c, title: data.chatTitle } : c));
                      setActiveChat(prev => ({ ...prev, title: data.chatTitle }));
                    }
                  } else if (data.type === 'chunk') {
                    accumulatedReply += data.text;
                    setStreamedContent(accumulatedReply);
                  } else if (data.type === 'done') {
                    // Save full final chat state from DB response
                    await loadChatDetails(currentChatId);
                    await loadChats();
                    setStreaming(false);
                    setAbortController(null);
                  }
                } catch (e) {
                  // JSON parse err for fragmented streams
                }
              }
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream generation aborted by user');
      } else {
        console.error('Error in send message stream:', error);
        setStreaming(false);
      }
    }
  };

  const uploadAttachment = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data; // returns { name, url, type, size }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error.response?.data?.message || 'File upload failed';
    }
  };

  const likeMessage = async (chatId, messageId, likeStatus) => {
    try {
      const res = await api.put(`/chat/${chatId}/message/${messageId}/feedback`, { like: likeStatus });
      if (activeChat && activeChat._id === chatId) {
        setActiveChat(res.data);
      }
    } catch (error) {
      console.error('Error sending message feedback:', error);
    }
  };

  const shareChat = async (chatId) => {
    try {
      const res = await api.post(`/chat/${chatId}/share`);
      return `http://localhost:5173/shared/${res.data.shareId}`;
    } catch (error) {
      console.error('Error sharing chat:', error);
      throw error;
    }
  };

  const exportChat = (chatId, format) => {
    // Simple window download triggers GET request
    window.open(`http://localhost:5000/api/chat/${chatId}/export/${format}?token=${token}`, '_blank');
  };

  return (
    <ChatContext.Provider value={{
      chats,
      activeChat,
      loading,
      streaming,
      streamedContent,
      folders,
      setFolders,
      loadChats,
      loadChatDetails,
      createNewChat,
      renameChat,
      pinChat,
      moveChatToFolder,
      deleteChat,
      sendMessage,
      uploadAttachment,
      likeMessage,
      shareChat,
      exportChat,
      stopGeneration,
      setActiveChat
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
