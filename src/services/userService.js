import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createUser = async (email, password, name) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await pool.query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, name, email, role',
        [email, hashedPassword, name]
    );
    return result.rows[0];
};

export const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

export const findUserById = async (id) => {
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

export const createProvider = async (userId, provider, providerUserId) => {
    await pool.query(
        'INSERT INTO auth_providers (user_id, provider, provider_user_id) VALUES ($1, $2, $3)',
        [userId, provider, providerUserId]
    );
};

export const findUserByProvider = async (provider, providerUserId) => {
    const result = await pool.query(
        'SELECT u.* FROM users u JOIN auth_providers ap ON u.id = ap.user_id WHERE ap.provider = $1 AND ap.provider_user_id = $2',
        [provider, providerUserId]
    );
    return result.rows[0];
};

export const updateUser = async (id, { name }) => {
    const result = await pool.query(
        'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role',
        [name, id]
    );
    return result.rows[0];
};

export const findAllUsers = async () => {
    const result = await pool.query('SELECT id, name, email, role FROM users');
    return result.rows;
};
