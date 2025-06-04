import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database/database.db');

async function openDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

export async function registerUser(req, res) {
  const { username, password, role = 'viewer' } = req.body;
  const db = await openDb();

  const existing = await db.get('SELECT * FROM users WHERE username = ?', username);
  if (existing) {
    return res.status(400).json({ error: 'Usuário já existe' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [
    username,
    hashedPassword,
    role
  ]);

  res.json({ message: 'Usuário registrado com sucesso' });
}

export async function loginUser(req, res) {
  const { username, password } = req.body;
  const db = await openDb();

  const user = await db.get('SELECT * FROM users WHERE username = ?', username);
  if (!user) {
    return res.status(400).json({ error: 'Usuário não encontrado' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(400).json({ error: 'Senha incorreta' });
  }

  // Retorna apenas os dados necessários
  res.json({ message: 'Login bem-sucedido', user: { id: user.id, username: user.username, role: user.role } });
}