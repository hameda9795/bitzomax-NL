-- Reset admin password to admin123
-- This is a BCrypt hash for "admin123"
UPDATE users 
SET password = '$2a$10$Yl5r8hgYz7qKyOkYnT.GEe9Vq8K7VKdJx8HqF9q8X1JKqF2KqF3K.'
WHERE username = 'admin';

-- Verify the update
SELECT id, username, email, role, 
       LEFT(password, 20) || '...' as password_preview 
FROM users WHERE username = 'admin';
