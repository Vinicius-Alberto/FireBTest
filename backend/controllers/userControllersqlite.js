import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { hashPassword, generateSalt } from '../utils/crypto.js';

export async function openDb() {
    return open({
        filename: './backend/database.db',
        driver: sqlite3.Database
    });
}

// 🚀 Inicializa o banco e cria a tabela se não existir
export async function initDb() {
    const db = await openDb();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            passwordHash TEXT,
            salt TEXT,
            role TEXT
        )
    `);
}

// 🔐 Registro de usuário
export async function registerUser(username, password, role = 'viewer') {
    const db = await openDb();

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    try {
        await db.run(
            `INSERT INTO users (username, passwordHash, salt, role)
             VALUES (?, ?, ?, ?)`,
            [username, passwordHash, salt, role]
        );
        return { success: true, message: 'Usuário registrado com sucesso' };
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            throw new Error('Usuário já existe');
        }
        throw err;
    }
}

// 🔑 Login
export async function loginUser(username, password) {
    const db = await openDb();
    const user = await db.get(
        `SELECT * FROM users WHERE username = ?`,
        username
    );
    if (!user) return false;

    const inputHash = hashPassword(password, user.salt);
    const isValid = inputHash === user.passwordHash;

    if (isValid) {
        return {
            username: user.username,
            role: user.role
        };
    } else {
        return false;
    }
}

// 🎫 Buscar role do usuário
export async function getUserRole(username) {
    const db = await openDb();
    const user = await db.get(
        `SELECT role FROM users WHERE username = ?`,
        username
    );
    return user ? user.role : null;
}

// 🔍 Verificar se usuário existe (opcional)
export async function getUserByUsername(username) {
    const db = await openDb();
    return await db.get(
        `SELECT * FROM users WHERE username = ?`,
        username
    );
}
