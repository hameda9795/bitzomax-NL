CREATE USER IF NOT EXISTS bitzomax_admin WITH PASSWORD 'admin123';
INSERT INTO users (id, email, password, username, created_at, updated_at)
VALUES (1, 'admin@bitzomax.com', '$2a$10$IfIL2CJ9XtmHgPPZGFuRjuhn4m8xYzUud5edCGiQjy371PTa1JmDi', 'admin', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1) ON CONFLICT (user_id, role_id) DO NOTHING;
INSERT INTO user_roles (user_id, role_id) VALUES (1, 2) ON CONFLICT (user_id, role_id) DO NOTHING;
