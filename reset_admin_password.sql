-- Reset admin password to admin123
UPDATE users SET password = '$2a$10$N.DL/.2PFOA1MaXfDJ8Cr.PGGjXJLTWMK2bH7nQ/Ea3EpO/eubVHS' WHERE username = 'admin';
