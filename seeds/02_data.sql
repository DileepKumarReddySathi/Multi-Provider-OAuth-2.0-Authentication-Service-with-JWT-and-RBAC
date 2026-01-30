-- Insert Users
INSERT INTO users (id, email, password_hash, name, role) VALUES 
(gen_random_uuid(), 'admin@example.com', '$2a$10$P3PhfV374owX.2mZNDABSTnaGPa7qoKydK/HTKmXsF4On2eS', 'Admin User', 'admin'),
(gen_random_uuid(), 'user@example.com', '$2a$10$ocKYj1ujtArft8MScpsxuMe0XMi2bA5HnKO1CdcdxcyDe7eu', 'Regular User', 'user')
ON CONFLICT (email) DO NOTHING;
