const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Chat = require('../models/Chat');

// Generate simulated intelligent responses
const generateAIResponse = (userPrompt, model) => {
  const prompt = userPrompt.toLowerCase();
  
  if (prompt.includes('react') || prompt.includes('create react app')) {
    return `### Creating a React 19 Application

To initialize a modern React 19 application with Vite, follow these steps:

1. **Scaffold the project:**
   \`\`\`bash
   npm create vite@latest my-react-app -- --template react
   cd my-react-app
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

#### Key Component Example
Here is a sample React functional component showcasing hooks in React 19:

\`\`\`jsx
import React, { useState, useTransition } from 'react';

export default function SubmitButton() {
  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(\`Submitted: \${name}\`);
    });
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-lg shadow-md max-w-sm">
      <h2 className="text-xl font-bold mb-4">React 19 Form Transition</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 bg-slate-800 border border-slate-700 rounded mb-4"
        placeholder="Enter name"
      />
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-semibold disabled:opacity-50"
      >
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );
}
\`\`\`

Feel free to customize this setup according to your architectural requirements!`;
  }
  
  if (prompt.includes('sql') || prompt.includes('query')) {
    return `### SQL Query Example

To retrieve users who have spent more than $100 in the last 30 days along with their subscription details, you can write the following query:

\`\`\`sql
SELECT 
    u.id AS user_id, 
    u.name, 
    u.email, 
    s.plan AS subscription_plan, 
    SUM(p.amount) AS total_spent
FROM 
    users u
JOIN 
    subscriptions s ON u.id = s.user_id
JOIN 
    payments p ON u.id = p.user_id
WHERE 
    p.created_at >= NOW() - INTERVAL '30 days'
    AND s.status = 'active'
GROUP BY 
    u.id, u.name, u.email, s.plan
HAVING 
    SUM(p.amount) > 100
ORDER BY 
    total_spent DESC;
\`\`\``;
  }
  
  if (prompt.includes('math') || prompt.includes('solve')) {
    return `### Mathematical Solution

Let's solve the quadratic equation: **$x^2 - 5x + 6 = 0$**

1. **Identify Coefficients:**
   - $a = 1$
   - $b = -5$
   - $c = 6$

2. **Use Quadratic Formula:**
   $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

3. **Substitute Values:**
   $$x = \\frac{-(-5) \\pm \\sqrt{(-5)^2 - 4(1)(6)}}{2(1)}$$
   $$x = \\frac{5 \\pm \\sqrt{25 - 24}}{2}$$
   $$x = \\frac{5 \\pm \\sqrt{1}}{2}$$
   $$x = \\frac{5 \\pm 1}{2}$$

4. **Calculate Roots:**
   - $x_1 = \\frac{5 + 1}{2} = 3$
   - $x_2 = \\frac{5 - 1}{2} = 2$

**Answer:** The solutions are **$x = 2$** and **$x = 3$**.`;
  }
  
  if (prompt.includes('blog') || prompt.includes('write')) {
    return `# The Future of Generative AI in Codebases

Generative AI is shifting from a standard chat interface to autonomous development agents. Here is why it matters:

* **Context Awareness:** Multi-file reasoning enables developers to modify entire layers of code rather than single lines.
* **Lower Cognitive Load:** Developers can prompt ideas and focus on verification rather than boilerplates.
* **Rapid Prototyping:** Scaffolding complete backend/frontend services now takes minutes instead of days.

> "The true value of AI in software engineering is not code generation, but cognitive acceleration."

| Phase | Developer Focus | AI Contribution |
| :--- | :--- | :--- |
| Planning | Architectural review | Knowledge synthesis |
| Coding | Edge case validation | boilerplate generation |
| Testing | Integration coverage | Unit-tests creation |

Stay tuned for more updates on AlphaChatGPT!`;
  }
  
  if (prompt.includes('pdf') || prompt.includes('summarize')) {
    return `### Document Analysis Summary
Based on the provided PDF file, here is a concise summary of the key findings and contents:

- **Document Type:** Financial Report Q2 2026
- **Executive Summary:** Overall revenue increased by 14% quarter-over-quarter, driven primarily by corporate subscription renewals.
- **Key Milestones:**
  1. Completed cloud migration resulting in 22% infrastructure savings.
  2. Launched enterprise security suite featuring end-to-end data encryption.
  3. Expanded technical support response time to 24/7 global operations.
- **Identified Action Items:**
  - Standardize API interfaces for third-party integrations.
  - Scale up backend MongoDB shards to accommodate higher read loads.`;
  }

  // Fallback general response
  return `Hello! I am **AlphaChatGPT**, your premium AI assistant. 

Here are some features I support:
* **Interactive Markdown:** Headers, lists, quotes, tables, and math equations.
* **Code Highlighting:** Multiple languages with syntax styling and copy support.
* **File Uploads:** Ready to process documents, images, and other resources.

How else can I assist you with your coding, productivity, or writing goals today? Let me know if you would like me to write code snippets, solve equations, or outline ideas!`;
};

// @desc    Create a new Chat
// @route   POST /api/chat
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, model } = req.body;
  try {
    const chat = await Chat.create({
      userId: req.user._id,
      title: title || 'New Chat',
      model: model || 'AlphaGPT-4',
      messages: []
    });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all chats for user
// @route   GET /api/chat
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select('title model pinned folder updatedAt')
      .sort({ pinned: -1, updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get details / messages for specific chat
// @route   GET /api/chat/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Rename a chat
// @route   PUT /api/chat/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { title, pinned, folder } = req.body;
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (title !== undefined) chat.title = title;
    if (pinned !== undefined) chat.pinned = pinned;
    if (folder !== undefined) chat.folder = folder;

    await chat.save();
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a chat
// @route   DELETE /api/chat/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Stream AI response via Server-Sent Events (SSE)
// @route   POST /api/chat/:id/message
// @access  Private
router.post('/:id/message', protect, async (req, res) => {
  const { content, attachments } = req.body;

  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // 1. Add user message
    const userMessage = {
      role: 'user',
      content,
      attachments: attachments || [],
      timestamp: new Date(),
      tokens: Math.ceil(content.length / 4)
    };
    chat.messages.push(userMessage);

    // If chat title was default, auto-generate title based on prompt
    if (chat.title === 'New Chat') {
      chat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
    }

    await chat.save();

    // 2. Prepare AI Response
    const aiResponseText = generateAIResponse(content, chat.model);
    const aiTokens = Math.ceil(aiResponseText.length / 4);

    // Setup Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send the user message object & details first (as metadata/chat info update)
    res.write(`data: ${JSON.stringify({ type: 'start', chatTitle: chat.title })}\n\n`);

    // Stream chunks with small delays
    const words = aiResponseText.split(/(\s+)/);
    let index = 0;
    
    const sendChunk = () => {
      if (index < words.length) {
        // Collect a few words for realistic streaming pace
        const chunk = words.slice(index, index + 3).join('');
        index += 3;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
        
        // Schedule next chunk
        setTimeout(sendChunk, 40);
      } else {
        // Stream finished
        // Save the assistant message to database
        const assistantMessage = {
          role: 'assistant',
          content: aiResponseText,
          timestamp: new Date(),
          tokens: aiTokens
        };
        chat.messages.push(assistantMessage);
        chat.save().then(() => {
          res.write(`data: ${JSON.stringify({ type: 'done', message: assistantMessage })}\n\n`);
          res.end();
        });
      }
    };

    sendChunk();

  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Export Chat history (TXT, Markdown, or JSON)
// @route   GET /api/chat/:id/export/:format
// @access  Private
router.get('/:id/export/:format', protect, async (req, res) => {
  const { id, format } = req.params;
  try {
    const chat = await Chat.findOne({ _id: id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    let fileContent = '';
    let contentType = 'text/plain';
    let filename = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;

    if (format === 'md') {
      contentType = 'text/markdown';
      fileContent = `# Chat: ${chat.title}\nModel: ${chat.model}\nDate: ${chat.createdAt}\n\n---\n\n`;
      chat.messages.forEach(msg => {
        fileContent += `### **${msg.role === 'user' ? 'User' : 'AlphaGPT'}** (${new Date(msg.timestamp).toLocaleString()})\n\n${msg.content}\n\n---\n\n`;
      });
    } else if (format === 'txt') {
      contentType = 'text/plain';
      fileContent = `CHAT: ${chat.title}\nModel: ${chat.model}\nDate: ${chat.createdAt}\n\n`;
      chat.messages.forEach(msg => {
        fileContent += `[${msg.role.toUpperCase()}] (${new Date(msg.timestamp).toLocaleString()}):\n${msg.content}\n\n`;
      });
    } else if (format === 'json') {
      contentType = 'application/json';
      fileContent = JSON.stringify(chat, null, 2);
    } else {
      return res.status(400).json({ message: 'Unsupported format' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(fileContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Like/dislike message or update likes
// @route   PUT /api/chat/:id/message/:messageId/feedback
// @access  Private
router.put('/:id/message/:messageId/feedback', protect, async (req, res) => {
  const { like } = req.body; // true = like, false = dislike, null = clear
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.likes = like;
    await chat.save();
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Generate Share link (or set it shared)
// @route   POST /api/chat/:id/share
// @access  Private
router.post('/:id/share', protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.isShared) {
      chat.isShared = true;
      chat.shareId = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      await chat.save();
    }

    res.json({ shareId: chat.shareId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get shared chat details (Public endpoint)
// @route   GET /api/chat/shared/:shareId
// @access  Public
router.get('/shared/:shareId', async (req, res) => {
  try {
    const chat = await Chat.findOne({ shareId: req.params.shareId, isShared: true })
      .select('title model messages createdAt')
      .populate('userId', 'name');
    if (!chat) {
      return res.status(404).json({ message: 'Shared chat not found' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
