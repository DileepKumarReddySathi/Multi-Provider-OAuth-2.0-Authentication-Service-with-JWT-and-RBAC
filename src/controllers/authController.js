import * as userService from '../services/userService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );
    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );
    return { accessToken, refreshToken };
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const existingUser = await userService.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const user = await userService.createUser(email, password, name);
        res.status(201).json(user);
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await userService.findUserByEmail(email);
        if (!user || !user.password_hash) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokens = generateTokens(user);
        res.status(200).json(tokens);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// OAuth Helpers
const getGoogleUser = async (code) => {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: `http://localhost:${process.env.API_PORT}/api/auth/google/callback`
        })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) throw new Error('Failed to get Google token');

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userResponse.json();
    return { email: userData.email, name: userData.name, id: userData.id };
};

const getGithubUser = async (code) => {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) throw new Error('Failed to get GitHub token');

    const userResponse = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userResponse.json();
    return { email: userData.email || `${userData.login}@github.com`, name: userData.name || userData.login, id: String(userData.id) };
};

export const googleInit = (req, res) => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:${process.env.API_PORT}/api/auth/google/callback&response_type=code&scope=profile email`;
    res.redirect(url);
};

export const githubInit = (req, res) => {
    const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=http://localhost:${process.env.API_PORT}/api/auth/github/callback&scope=user:email`;
    res.redirect(url);
};

export const googleCallback = async (req, res) => {
    try {
        const { code } = req.query;
        let profile;
        if (req.query.mock_email && process.env.NODE_ENV !== 'production') {
            profile = {
                email: req.query.mock_email,
                name: req.query.mock_name || 'Mock User',
                id: req.query.mock_id || 'mock_id'
            };
        } else {
            if (!code) return res.status(400).json({ message: 'No code provided' });
            profile = await getGoogleUser(code);
        }
        await handleOAuthLogin(res, profile, 'google');
    } catch (error) {
        console.error('Google Callback Error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
};

export const githubCallback = async (req, res) => {
    try {
        const { code } = req.query;
        let profile;
        if (req.query.mock_email && process.env.NODE_ENV !== 'production') {
            profile = {
                email: req.query.mock_email,
                name: req.query.mock_name || 'Mock User',
                id: req.query.mock_id || 'mock_id'
            };
        } else {
            if (!code) return res.status(400).json({ message: 'No code provided' });
            profile = await getGithubUser(code);
        }
        await handleOAuthLogin(res, profile, 'github');
    } catch (error) {
        console.error('GitHub Callback Error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
};

const handleOAuthLogin = async (res, profile, provider) => {
    let user = await userService.findUserByProvider(provider, profile.id);

    if (!user) {
        user = await userService.findUserByEmail(profile.email);
        if (user) {
            await userService.createProvider(user.id, provider, profile.id);
        } else {
            user = await userService.createUser(profile.email, 'oauth_placeholder', profile.name);
            await userService.createProvider(user.id, provider, profile.id);
        }
    }

    const tokens = generateTokens(user);
    res.status(200).json(tokens);
};

export const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No token provided' });

    try {
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await userService.findUserById(payload.id);

        if (!user) return res.status(401).json({ message: 'User not found' });

        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        res.json({ accessToken });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
};
