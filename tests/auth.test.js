import { jest } from '@jest/globals';

// Define mocks before imports
jest.unstable_mockModule('../src/services/userService.js', () => ({
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    createProvider: jest.fn(),
    findUserByProvider: jest.fn(),
}));

jest.unstable_mockModule('bcryptjs', () => ({
    default: {
        hashSync: jest.fn(),
        compare: jest.fn(),
    }
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
        sign: jest.fn(),
        verify: jest.fn(),
    }
}));

// Dynamic imports
const request = (await import('supertest')).default;
const app = (await import('../src/index.js')).default;
const userService = await import('../src/services/userService.js');
const bcrypt = (await import('bcryptjs')).default;
const jwt = (await import('jsonwebtoken')).default;

describe('Auth Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const mockUser = { id: '1', name: 'Test', email: 'test@example.com', role: 'user' };
            userService.findUserByEmail.mockResolvedValue(null);
            userService.createUser.mockResolvedValue(mockUser);
            bcrypt.hashSync.mockReturnValue('hashed_password');

            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Test', email: 'test@example.com', password: 'password123' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockUser);
        });

        it('should return 409 if user exists', async () => {
            userService.findUserByEmail.mockResolvedValue({ id: '1' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Test', email: 'test@example.com', password: 'password123' });

            expect(res.statusCode).toBe(409);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully', async () => {
            const mockUser = { id: '1', email: 'test@example.com', password_hash: 'hashed', role: 'user' };
            userService.findUserByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('token');

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
        });
    });
});
