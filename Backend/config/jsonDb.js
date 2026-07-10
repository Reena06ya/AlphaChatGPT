const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '../data');
const usersPath = path.join(dataDir, 'users.json');
const chatsPath = path.join(dataDir, 'chats.json');
const subsPath = path.join(dataDir, 'subscriptions.json');

// Initialize JSON files if they don't exist
const initDb = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(usersPath)) fs.writeFileSync(usersPath, JSON.stringify([], null, 2));
  if (!fs.existsSync(chatsPath)) fs.writeFileSync(chatsPath, JSON.stringify([], null, 2));
  if (!fs.existsSync(subsPath)) fs.writeFileSync(subsPath, JSON.stringify([], null, 2));
  console.log('JSON Database loaded successfully!');
};

// Generate simple mock ObjectId strings
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper read/write
const readCollection = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
};

const writeCollection = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Wrap document with Mongoose-like helpers
const wrapDocument = (doc, collectionName) => {
  if (!doc) return null;

  // Clone document to avoid reference side-effects
  const wrapped = JSON.parse(JSON.stringify(doc));

  // 1. Add Mongoose-like save() method
  wrapped.save = async function() {
    const filePath = 
      collectionName === 'users' ? usersPath :
      collectionName === 'chats' ? chatsPath : subsPath;

    const data = readCollection(filePath);

    // Pre-save hashing for user password
    if (collectionName === 'users' && this.password && !this.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const idx = data.findIndex(item => item._id === this._id);
    if (idx !== -1) {
      // Update existing
      this.updatedAt = new Date().toISOString();
      data[idx] = { ...this };
    } else {
      // Insert new
      this.createdAt = new Date().toISOString();
      this.updatedAt = new Date().toISOString();
      data.push({ ...this });
    }

    writeCollection(filePath, data);
    return this;
  };

  // 2. Add message schema id() search helper for chats
  if (collectionName === 'chats' && wrapped.messages) {
    wrapped.messages.id = function(id) {
      return this.find(msg => msg._id === id || msg._id?.toString() === id);
    };
  }

  // 3. Add matchPassword helper for users
  if (collectionName === 'users') {
    wrapped.matchPassword = async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };
  }

  return wrapped;
};

// Mock Query Chain for find()
class QueryChain {
  constructor(data, collectionName) {
    this.data = data;
    this.collectionName = collectionName;
  }

  select(fields) {
    if (typeof fields === 'string') {
      const keys = fields.split(' ').filter(Boolean);
      const isExclude = keys.some(k => k.startsWith('-'));
      
      this.data = this.data.map(item => {
        const selected = {};
        if (isExclude) {
          // exclude logic e.g. -password
          const excludeKeys = keys.map(k => k.substring(1));
          Object.keys(item).forEach(key => {
            if (!excludeKeys.includes(key)) selected[key] = item[key];
          });
        } else {
          // include logic
          keys.forEach(k => {
            selected[k] = item[k];
          });
          selected._id = item._id; // always include key ID
        }
        return selected;
      });
    }
    return this;
  }

  sort(options) {
    if (options && typeof options === 'object') {
      this.data = [...this.data].sort((a, b) => {
        for (const key in options) {
          const order = options[key]; // -1 desc, 1 asc
          let valA = a[key];
          let valB = b[key];
          
          if (typeof valA === 'boolean') {
            valA = valA ? 1 : 0;
            valB = valB ? 1 : 0;
          }
          
          if (valA !== valB) {
            return order === -1
              ? (valB > valA ? 1 : -1)
              : (valA > valB ? 1 : -1);
          }
        }
        return 0;
      });
    }
    return this;
  }

  populate(path) {
    if (path === 'userId') {
      const users = readCollection(usersPath);
      this.data = this.data.map(item => {
        const user = users.find(u => u._id === item.userId);
        return {
          ...item,
          userId: user ? { _id: user._id, name: user.name, email: user.email } : null
        };
      });
    }
    return this;
  }

  // Thenable interface allows direct awaiting of this chain
  then(onFulfilled, onRejected) {
    const wrappedData = Array.isArray(this.data)
      ? this.data.map(d => wrapDocument(d, this.collectionName))
      : wrapDocument(this.data, this.collectionName);
    return Promise.resolve(wrappedData).then(onFulfilled, onRejected);
  }
}

// Database Model Class Wrapper
class Model {
  constructor(collectionName, filePath) {
    this.collectionName = collectionName;
    this.filePath = filePath;
  }

  async find(query = {}) {
    const list = readCollection(this.filePath);
    const filtered = list.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    return new QueryChain(filtered, this.collectionName);
  }

  async findOne(query = {}) {
    const list = readCollection(this.filePath);
    const doc = list.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    return doc ? wrapDocument(doc, this.collectionName) : null;
  }

  async findById(id) {
    const list = readCollection(this.filePath);
    const doc = list.find(item => item._id === id);
    return doc ? wrapDocument(doc, this.collectionName) : null;
  }

  async findByIdAndDelete(id) {
    const list = readCollection(this.filePath);
    const doc = list.find(item => item._id === id);
    if (doc) {
      const filtered = list.filter(item => item._id !== id);
      writeCollection(this.filePath, filtered);
    }
    return doc ? wrapDocument(doc, this.collectionName) : null;
  }

  async findOneAndDelete(query = {}) {
    const list = readCollection(this.filePath);
    const idx = list.findIndex(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (idx !== -1) {
      const doc = list[idx];
      list.splice(idx, 1);
      writeCollection(this.filePath, list);
      return wrapDocument(doc, this.collectionName);
    }
    return null;
  }

  async create(data) {
    const list = readCollection(this.filePath);
    const newDoc = {
      _id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // User password pre-save hash check
    if (this.collectionName === 'users' && newDoc.password) {
      const salt = await bcrypt.genSalt(10);
      newDoc.password = await bcrypt.hash(newDoc.password, salt);
    }

    list.push(newDoc);
    writeCollection(this.filePath, list);
    return wrapDocument(newDoc, this.collectionName);
  }

  async countDocuments(query = {}) {
    const list = readCollection(this.filePath);
    const filtered = list.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    return filtered.length;
  }

  async deleteMany(query = {}) {
    const list = readCollection(this.filePath);
    const kept = list.filter(item => {
      for (const key in query) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    writeCollection(this.filePath, kept);
    return { deletedCount: list.length - kept.length };
  }
}

module.exports = {
  initDb,
  User: new Model('users', usersPath),
  Chat: new Model('chats', chatsPath),
  Subscription: new Model('subscriptions', subsPath)
};
