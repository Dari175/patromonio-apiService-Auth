/**
 * app.js  –  Punto de entrada del microservicio
 */

require('dotenv').config();

const express  = require('express');
const morgan   = require('morgan');
const { connectDB } = require('./config/database');

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/usuarios');
const roleRoutes    = require('./routes/roles');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares globales ─────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan(process.env.NODE_ENV === 'atlas' ? 'combined' : 'dev'));

const cors = require('cors');

app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'ngrok-skip-browser-warning'
  ]
}));

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const module = req.headers['x-module'];

  console.log('MODULE:', module, 'PATH:', req.path);

  if (module === 'usuarios') {
    return userRoutes.handle(req, res, next);
  }

  if (module === 'roles') {
    return roleRoutes.handle(req, res, next);
  }

  return authRoutes.handle(req, res, next);
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ ok: true, entorno: process.env.NODE_ENV, ts: new Date().toISOString() })
);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' })
);

// ─── Error handler global ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});

// ─── Arranque ─────────────────────────────────────────────────────────────────
(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀  Auth Service corriendo en http://localhost:${PORT}`);
    console.log(`📡  Entorno: ${process.env.NODE_ENV || 'local'}`);
  });
})();
