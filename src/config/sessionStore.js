const { Store } = require('express-session');

class MyCustomSQLStore extends Store {
  constructor(db) {
    super();
    this.db = db;
  }

  async get(sid, callback) {
    try {
            const now = Math.floor(Date.now() / 1000); // Node's time
            const [rows] = await this.db.execute(
                'SELECT data FROM sessions WHERE session_id = ? AND expires > ?',
                [sid, now]
            );

            if (rows.length === 0) return callback(null, null);
            callback(null, JSON.parse(rows[0].data));
        } catch (err) {
            callback(err);
        }
    }

  async set(sid, session, callback) {
    try {
      const expires =
        session.cookie && session.cookie.expires
          ? Math.floor(new Date(session.cookie.expires).getTime() / 1000)
          : Math.floor(Date.now() / 1000) + 86400;

      const data = JSON.stringify(session);

      await this.db.execute(
        `INSERT INTO sessions (session_id, expires, data)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE expires = VALUES(expires), data = VALUES(data)`,
        [sid, expires, data]
      );

      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async destroy(sid, callback) {
    try {
      await this.db.execute('DELETE FROM sessions WHERE session_id = ?', [sid]);
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async touch(sid, session, callback) {
    try {
      const expires =
        session.cookie && session.cookie.expires
          ? Math.floor(new Date(session.cookie.expires).getTime() / 1000)
          : Math.floor(Date.now() / 1000) + 86400;

      await this.db.execute(
        'UPDATE sessions SET expires = ? WHERE session_id = ?',
        [expires, sid]
      );

      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

module.exports = MyCustomSQLStore;