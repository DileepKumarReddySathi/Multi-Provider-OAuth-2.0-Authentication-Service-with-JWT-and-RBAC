import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8080/api';

async function verify() {
    console.log('Starting verification...');

    // 1. Health Check
    try {
        const health = await fetch('http://localhost:8080/health').then(r => r.json());
        console.log('Health Check:', health);
    } catch (e) {
        console.error('Health Check Failed:', e.message);
        return;
    }

    // 2. Login as Admin
    let adminToken;
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'AdminPassword123!' })
        });
        const data = await res.json();
        if (res.ok) {
            console.log('Admin Login Success');
            adminToken = data.accessToken;
        } else {
            console.error('Admin Login Failed:', data);
        }
    } catch (e) {
        console.error('Admin Login Error:', e);
    }

    // 3. Get Me (Admin)
    if (adminToken) {
        const res = await fetch(`${BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const data = await res.json();
        console.log('Get Me (Admin):', res.status, data.email === 'admin@example.com' ? 'OK' : 'FAIL');
    }

    // 4. Register New User
    const newUserEmail = `newuser_${Date.now()}@example.com`;
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'New User', email: newUserEmail, password: 'Password123!' })
        });
        const data = await res.json();
        console.log('Register User:', res.status, res.ok ? 'OK' : data);
    } catch (e) {
        console.error('Register Error:', e);
    }

    // 5. Admin Access to User List
    if (adminToken) {
        const res = await fetch(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const data = await res.json();
        console.log('List Users (Admin):', res.status, Array.isArray(data) ? 'OK' : 'FAIL');
    }
}

// Check if services are up before running? No, user needs to run docker-compose first.
verify();
