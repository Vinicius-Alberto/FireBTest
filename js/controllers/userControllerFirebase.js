// Importa funções auxiliares se necessário
import { hashPassword } from '../utils/hash.js';

// ----------------------
// Dados de exemplo (pode ser Firebase, localStorage ou outro backend futuramente)
const USERS_KEY = 'users_db';

// ----------------------
// Funções auxiliares de persistência

function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ----------------------
// Função de cadastro

export async function registerUser(username, password) {
    const users = getUsers();

    const exists = users.find(u => u.username === username);
    if (exists) {
        throw new Error('Usuário já existe');
    }

    const passwordHash = await hashPassword(password);

    users.push({ username, passwordHash });
    saveUsers(users);
}

// ----------------------
// Função de login

export async function loginUser(username, password) {
    const users = getUsers();

    const user = users.find(u => u.username === username);
    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    const inputHash = await hashPassword(password);

    if (inputHash !== user.passwordHash) {
        throw new Error('Senha incorreta');
    }

    // Salva sessão
    sessionStorage.setItem('loggedUser', username);
}

// ----------------------
// Função de logout

export function logoutUser() {
    sessionStorage.removeItem('loggedUser');
}

// ----------------------
// Checar se está logado

export function getLoggedUser() {
    return sessionStorage.getItem('loggedUser');
}

export function isLoggedIn() {
    return !!getLoggedUser();
}