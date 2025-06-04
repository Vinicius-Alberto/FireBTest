import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import userRoutes from './routes/userRoutes.js'; // suas rotas de usuários
// importe outras rotas quando criar

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/users', userRoutes);

// Servir arquivos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Inicializa servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});