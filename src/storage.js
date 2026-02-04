/**
 * Storage Layer for Bill Bot
 *
 * Provides persistent storage for conversation history with support
 * for multiple backends (SQLite, JSON files).
 */

import Database from 'better-sqlite3';

/**
 * Base Storage class - defines the interface all storage backends must implement
 */
export class Storage {
  /**
   * Get conversation history for a channel
   * @param {string} channelId - Discord channel ID
   * @param {number} limit - Maximum number of messages to return
   * @returns {Promise<Array<{role: string, content: string, timestamp: number}>>}
   */
  async getHistory(channelId, limit = 20) {
    throw new Error('getHistory() must be implemented by storage backend');
  }

  /**
   * Add a message to conversation history
   * @param {string} channelId - Discord channel ID
   * @param {string} role - Message role (user/assistant/system)
   * @param {string} content - Message content
   * @returns {Promise<void>}
   */
  async addMessage(channelId, role, content) {
    throw new Error('addMessage() must be implemented by storage backend');
  }

  /**
   * Prune old messages from storage
   * @param {number} daysOld - Delete messages older than this many days
   * @returns {Promise<number>} Number of messages deleted
   */
  async pruneOldMessages(daysOld) {
    throw new Error('pruneOldMessages() must be implemented by storage backend');
  }

  /**
   * Close/cleanup storage resources
   * @returns {Promise<void>}
   */
  async close() {
    // Default: no-op, backends can override if needed
  }
}

/**
 * In-Memory Storage - simple Map-based storage (no persistence)
 * Useful for testing and development
 */
export class MemoryStorage extends Storage {
  constructor() {
    super();
    this.conversations = new Map();
  }

  async getHistory(channelId, limit = 20) {
    const history = this.conversations.get(channelId) || [];
    return history.slice(-limit);
  }

  async addMessage(channelId, role, content) {
    if (!this.conversations.has(channelId)) {
      this.conversations.set(channelId, []);
    }
    const history = this.conversations.get(channelId);
    history.push({
      role,
      content,
      timestamp: Date.now()
    });
  }

  async pruneOldMessages(daysOld) {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    let deleted = 0;

    for (const [channelId, history] of this.conversations.entries()) {
      const originalLength = history.length;
      const filtered = history.filter(msg => msg.timestamp >= cutoff);
      this.conversations.set(channelId, filtered);
      deleted += originalLength - filtered.length;
    }

    return deleted;
  }
}

/**
 * SQLite Storage - persistent storage using SQLite database
 * Messages are stored in a single table indexed by channel_id
 */
export class SQLiteStorage extends Storage {
  /**
   * Create SQLite storage instance
   * @param {string} dbPath - Path to SQLite database file
   */
  constructor(dbPath = './data/conversations.db') {
    super();
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL'); // Better concurrency
    this._initDatabase();
  }

  /**
   * Initialize database schema
   * @private
   */
  _initDatabase() {
    // Create messages table with indexes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_channel_id ON messages(channel_id);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_channel_timestamp ON messages(channel_id, timestamp);
    `);
  }

  async getHistory(channelId, limit = 20) {
    const stmt = this.db.prepare(`
      SELECT role, content, timestamp
      FROM messages
      WHERE channel_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);

    const rows = stmt.all(channelId, limit);
    // Reverse to get chronological order (oldest first)
    return rows.reverse();
  }

  async addMessage(channelId, role, content) {
    const stmt = this.db.prepare(`
      INSERT INTO messages (channel_id, role, content, timestamp)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(channelId, role, content, Date.now());
  }

  async pruneOldMessages(daysOld) {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    const stmt = this.db.prepare(`
      DELETE FROM messages
      WHERE timestamp < ?
    `);

    const result = stmt.run(cutoff);
    return result.changes;
  }

  async close() {
    this.db.close();
  }
}

/**
 * Storage Factory - creates appropriate storage backend based on configuration
 */
export class StorageFactory {
  /**
   * Create a storage instance
   * @param {string} backend - Storage backend type ('memory', 'sqlite', 'json')
   * @param {Object} options - Backend-specific configuration
   * @returns {Storage}
   */
  static create(backend = 'memory', options = {}) {
    switch (backend.toLowerCase()) {
      case 'memory':
        return new MemoryStorage();

      case 'sqlite':
        return new SQLiteStorage(options.path || './data/conversations.db');

      case 'json':
        // JSON backend will be implemented in subtask after SQLite
        throw new Error('JSON storage not yet implemented');

      default:
        throw new Error(`Unknown storage backend: ${backend}`);
    }
  }
}
