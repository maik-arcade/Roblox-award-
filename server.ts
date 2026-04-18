import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON and large payloads (for images)
  app.use(express.json({ limit: '10mb' }));

  // Mock "Database" - Persistent in memory for current session
  const registrations: any[] = [];

  // API Routes
  app.get('/api/registrations', (req, res) => {
    // Public list only returns non-sensitive info if needed, 
    // but for now we keep it as is.
    res.json(registrations);
  });

  app.post('/api/admin/verify', (req, res) => {
    const { password } = req.body;
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPass) {
      res.json({ success: true, registrations });
    } else {
      res.status(401).json({ error: 'Contraseña incorrecta' });
    }
  });

  app.post('/api/registrations', (req, res) => {
    const { username, description, reason, image } = req.body;
    
    if (!username || !description || !reason) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const newRegistration = {
      id: Date.now(),
      username,
      description,
      reason,
      image, // Base64 image
      createdAt: new Date().toISOString(),
    };

    registrations.push(newRegistration);
    res.status(201).json(newRegistration);
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
