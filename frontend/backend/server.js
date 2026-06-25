import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, initializeDatabase } from './db.js';
import { seedIfEmpty } from './seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

const toPage = (row) => ({
  id: row.id,
  siteId: row.site_id,
  title: row.title,
  slug: row.slug,
  type: row.type,
  status: row.status,
  metaDescription: row.meta_description,
  seoTitle: row.seo_title,
  createdBy: { name: row.created_by_name, initials: row.created_by_initials },
  createdAt: row.created_at,
  updatedBy: { name: row.updated_by_name, initials: row.updated_by_initials },
  lastUpdated: row.last_updated,
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/status', async (req, res) => {
  try {
    const [userCount, pageCount] = await Promise.all([
      query('SELECT COUNT(*) FROM admin_users'),
      query('SELECT COUNT(*) FROM pages'),
    ]);
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      counts: {
        adminUsers: parseInt(userCount.rows[0].count),
        pages: parseInt(pageCount.rows[0].count),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// ── Auth ───────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  try {
    const result = await query('SELECT * FROM admin_users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.json({
      success: true,
      user: { name: user.name, initials: user.initials, role: user.role },
    });
  } catch (error) {
    console.error('❌ auth/login:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
  }
});

// ── Pages CMS ──────────────────────────────────────────────────────────────────
app.get('/api/sites/:siteId/pages', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM pages WHERE site_id = $1 ORDER BY sort_order ASC',
      [req.params.siteId]
    );
    res.json({ success: true, data: result.rows.map(toPage) });
  } catch (error) {
    console.error('❌ GET pages:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch pages.', error: error.message });
  }
});

app.post('/api/sites/:siteId/pages', async (req, res) => {
  const { title, slug, type } = req.body;
  if (!title || !slug) {
    return res.status(400).json({ success: false, message: 'Title and slug are required.' });
  }

  try {
    const { rows } = await query('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM pages WHERE site_id = $1', [req.params.siteId]);
    const result = await query(
      `INSERT INTO pages (
         site_id, title, slug, type, status, meta_description, seo_title, sort_order,
         created_by_name, created_by_initials, updated_by_name, updated_by_initials
       ) VALUES ($1,$2,$3,$4,'Published','','',$5,'Super Admin','SA','Super Admin','SA')
       RETURNING *`,
      [req.params.siteId, title, slug, type || 'Page', rows[0].next]
    );
    res.status(201).json({ success: true, data: toPage(result.rows[0]) });
  } catch (error) {
    console.error('❌ POST pages:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create page.', error: error.message });
  }
});

app.put('/api/pages/:id', async (req, res) => {
  const fields = {
    title: 'title',
    slug: 'slug',
    type: 'type',
    status: 'status',
    metaDescription: 'meta_description',
    seoTitle: 'seo_title',
  };

  const sets = [];
  const values = [];
  let i = 1;
  for (const [bodyKey, column] of Object.entries(fields)) {
    if (req.body[bodyKey] !== undefined) {
      sets.push(`${column} = $${i++}`);
      values.push(req.body[bodyKey]);
    }
  }

  if (sets.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update.' });
  }

  sets.push(`updated_by_name = $${i++}`, `updated_by_initials = $${i++}`, `last_updated = NOW()`);
  values.push('Super Admin', 'SA');
  values.push(req.params.id);

  try {
    const result = await query(
      `UPDATE pages SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Page not found.' });
    }
    res.json({ success: true, data: toPage(result.rows[0]) });
  } catch (error) {
    console.error('❌ PUT pages/:id:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update page.', error: error.message });
  }
});

app.delete('/api/pages/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM pages WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Page not found.' });
    }
    res.json({ success: true, message: 'Page deleted.', data: toPage(result.rows[0]) });
  } catch (error) {
    console.error('❌ DELETE pages/:id:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete page.', error: error.message });
  }
});

app.put('/api/sites/:siteId/pages/reorder', async (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ success: false, message: 'orderedIds must be an array.' });
  }

  try {
    await Promise.all(
      orderedIds.map((id, index) =>
        query('UPDATE pages SET sort_order = $1 WHERE id = $2 AND site_id = $3', [index, id, req.params.siteId])
      )
    );
    res.json({ success: true });
  } catch (error) {
    console.error('❌ PUT pages/reorder:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reorder pages.', error: error.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await initializeDatabase();
    await seedIfEmpty();
    let port = Number(PORT);
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await new Promise((resolve, reject) => {
          const server = app.listen(port, () => {
            console.log(`🚀 Admin backend running on port ${port}`);
            resolve();
          });
          server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              console.warn(`⚠️  Port ${port} in use, trying ${port + 1}…`);
              server.close();
              reject(err);
            } else {
              reject(err);
            }
          });
        });
        break;
      } catch (err) {
        if (err.code === 'EADDRINUSE') { port++; continue; }
        throw err;
      }
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
