import { generateHash, generateSalt } from '../utils/hash.js';
import { generateKey, encryptData, decryptData } from '../utils/crypts.js';

// ⚠️ Simulação de banco de dados JSON
const dbKey = 'super-secret-pass'; // Defina uma senha forte aqui
const usersFile = '/data/users.json';

// 📦 Mock do banco
let users = JSON.parse(localStorage.getItem('users') || '[]');

// 🔐 Registro de usuário
export async function registerUser(username, password, email) {
    if (users.find(u => u.username === username)) {
        throw new Error('Usuário já existe');
    }

    const salt = generateSalt();
    const passwordHash = await generateHash(password, salt);

    const key = await generateKey(dbKey);
    const encryptedEmail = await encryptData(key, email);

    const user = {
        username,
        salt,
        passwordHash,
        email: encryptedEmail
    };

    users.push(user);
    saveUsers();
}

// 🔓 Login
export async function loginUser(username, password) {
    const user = users.find(u => u.username === username);
    if (!user) return false;

    const hash = await generateHash(password, user.salt);
    if (hash === user.passwordHash) {
        sessionStorage.setItem('loggedInUser', username);
        return true;
    }
    return false;
}

// 🔍 Verificar se está logado
export function isLoggedIn() {
    return sessionStorage.getItem('loggedInUser') !== null;
}

// 🔐 Logout
export function logoutUser() {
    sessionStorage.removeItem('loggedInUser');
}

// 🔓 Descriptografar email
export async function getUserEmail(username) {
    const user = users.find(u => u.username === username);
    if (!user) return null;

    const key = await generateKey(dbKey);
    const email = await decryptData(key, user.email);
    return email;
}

// 💾 Salvar no "banco" (simulado no localStorage)
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}