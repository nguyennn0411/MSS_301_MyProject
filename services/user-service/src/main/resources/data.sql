INSERT INTO app_users (id, full_name, email, phone, active)
SELECT 'user-nguyen', 'Cao Phúc Nguyên', 'he191659@example.test', '0900000000', TRUE
WHERE NOT EXISTS (SELECT 1 FROM app_users WHERE id = 'user-nguyen');
