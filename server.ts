import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database("blushbox.db");

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS confessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    color TEXT NOT NULL,
    mood TEXT NOT NULL DEFAULT 'Secret',
    reaction_love INTEGER DEFAULT 0,
    reaction_relate INTEGER DEFAULT 0,
    reaction_shocked INTEGER DEFAULT 0,
    reaction_funny INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    confession_id INTEGER NOT NULL,
    parent_id INTEGER,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (confession_id) REFERENCES confessions(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id)
  );
`);

// Add new columns if they don't exist (for existing DBs)
try { db.exec("ALTER TABLE confessions ADD COLUMN mood TEXT NOT NULL DEFAULT 'Secret'"); } catch (e) {}
try { db.exec("ALTER TABLE confessions ADD COLUMN reaction_love INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE confessions ADD COLUMN reaction_relate INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE confessions ADD COLUMN reaction_shocked INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE confessions ADD COLUMN reaction_funny INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE confessions ADD COLUMN report_count INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE comments ADD COLUMN parent_id INTEGER"); } catch (e) {}

// Insert mock data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM confessions").get() as { count: number };
if (count.count === 0) {
  const insertConfession = db.prepare("INSERT INTO confessions (content, category, color, mood, reaction_love, reaction_relate, reaction_shocked, reaction_funny, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))");
  
  insertConfession.run(
    "I've been leaving anonymous love notes in my best friend's locker for months. She thinks she has a secret admirer, but it's just me being too scared to confess.",
    "Romance",
    "bg-pink-100",
    "Love",
    120, 45, 10, 5,
    "-1 day"
  );
  
  insertConfession.run(
    "I pretended not to know how to use the printer so the cute IT guy would come over. He came over, fixed it in 2 seconds, and called me 'ma'am'. I'm 24. 💀",
    "Funny",
    "bg-yellow-100",
    "Funny",
    50, 200, 30, 400,
    "-8 hours"
  );
  
  insertConfession.run(
    "I bought a gym membership in January. The only thing I've exercised is my bank account's recurring payment feature.",
    "Misc",
    "bg-gray-100",
    "Sad",
    10, 350, 5, 120,
    "-12 hours"
  );
  
  insertConfession.run(
    "I still watch cartoons every Saturday morning with a bowl of cereal. I'm 32 years old and a corporate lawyer.",
    "Dark Secrets",
    "bg-purple-100",
    "Secret",
    80, 150, 40, 20,
    "-4 hours"
  );
  
  insertConfession.run(
    "My mom thinks I'm a vegetarian. I eat burgers in my car before family dinners so I'm not hungry. The guilt adds flavor.",
    "Family",
    "bg-green-100",
    "Secret",
    20, 80, 150, 300,
    "-2 days"
  );
  
  insertConfession.run(
    "Sometimes I feel like everyone else got a manual for life that I never received.",
    "Deep",
    "bg-blue-100",
    "Sad",
    300, 890, 10, 5,
    "-1 hour"
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/confessions", (req, res) => {
    const { mood, sort } = req.query;
    let query = `
      SELECT c.*, COUNT(cm.id) as comment_count 
      FROM confessions c
      LEFT JOIN comments cm ON c.id = cm.confession_id
    `;
    const params: any[] = [];

    if (mood && mood !== "All") {
      query += ` WHERE c.mood = ?`;
      params.push(mood);
    }

    query += ` GROUP BY c.id`;

    if (sort === "trending") {
      query += ` ORDER BY (c.reaction_love + c.reaction_relate + c.reaction_shocked + c.reaction_funny + COUNT(cm.id)) DESC`;
    } else {
      query += ` ORDER BY c.created_at DESC`;
    }

    const confessions = db.prepare(query).all(...params);
    res.json(confessions);
  });

  app.get("/api/confessions/daily", (req, res) => {
    const confession = db.prepare(`
      SELECT c.*, COUNT(cm.id) as comment_count 
      FROM confessions c
      LEFT JOIN comments cm ON c.id = cm.confession_id
      WHERE c.created_at >= datetime('now', '-1 day')
      GROUP BY c.id
      ORDER BY (c.reaction_love + c.reaction_relate + c.reaction_shocked + c.reaction_funny) DESC
      LIMIT 1
    `).get();
    res.json(confession || null);
  });

  app.get("/api/confessions/random", (req, res) => {
    const confession = db.prepare(`
      SELECT c.*, COUNT(cm.id) as comment_count 
      FROM confessions c
      LEFT JOIN comments cm ON c.id = cm.confession_id
      GROUP BY c.id
      ORDER BY RANDOM()
      LIMIT 1
    `).get();
    res.json(confession || null);
  });

  app.post("/api/confessions", (req, res) => {
    const { content, category, color, mood } = req.body;
    if (!content || !category || !color || !mood) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const stmt = db.prepare("INSERT INTO confessions (content, category, color, mood) VALUES (?, ?, ?, ?)");
    const info = stmt.run(content, category, color, mood);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/confessions/:id/react", (req, res) => {
    const { id } = req.params;
    const { type } = req.body; // love, relate, shocked, funny
    
    const validTypes = ["love", "relate", "shocked", "funny"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid reaction type" });
    }

    const stmt = db.prepare(`UPDATE confessions SET reaction_${type} = reaction_${type} + 1 WHERE id = ?`);
    stmt.run(id);
    res.json({ success: true });
  });

  app.post("/api/confessions/:id/report", (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare("UPDATE confessions SET report_count = report_count + 1 WHERE id = ?");
    stmt.run(id);
    res.json({ success: true });
  });

  app.get("/api/confessions/:id/comments", (req, res) => {
    const { id } = req.params;
    const comments = db.prepare("SELECT * FROM comments WHERE confession_id = ? ORDER BY created_at ASC").all(id);
    res.json(comments);
  });

  app.post("/api/confessions/:id/comments", (req, res) => {
    const { id } = req.params;
    const { content, parent_id } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Missing content" });
    }
    const stmt = db.prepare("INSERT INTO comments (confession_id, parent_id, content) VALUES (?, ?, ?)");
    const info = stmt.run(id, parent_id || null, content);
    res.json({ id: info.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
