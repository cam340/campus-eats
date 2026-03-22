-- Seed the precisely two identical cafeterias
INSERT INTO cafeterias (id, name, status) VALUES 
('c0000000-0000-0000-0000-000000000001', 'North Campus Main Cafeteria', 'open'),
('c0000000-0000-0000-0000-000000000002', 'South Plaza Dining Hall', 'open');

-- Seed Admin Managed Delivery Locations
INSERT INTO delivery_locations (id, name, description, is_active, fee) VALUES 
('l0000000-0000-0000-0000-000000000001', 'Hostel Block A', 'Main entrance of Hostel A', TRUE, 1.50),
('l0000000-0000-0000-0000-000000000002', 'Hostel Block B', 'Back gate of Hostel B', TRUE, 1.50),
('l0000000-0000-0000-0000-000000000003', 'Engineering Building', 'Lobby area near elevators', TRUE, 2.00),
('l0000000-0000-0000-0000-000000000004', 'Library Steps', 'Front steps outside the library', TRUE, 1.00);

-- Seed an Admin User
INSERT INTO users (id, email, role, name) VALUES 
('u0000000-0000-0000-0000-000000000000', 'admin@campus.edu', 'admin', 'System Administrator');

-- Seed a dummy Student and Rider
INSERT INTO users (id, email, role, name) VALUES 
('u1111111-1111-1111-1111-111111111111', 'student1@campus.edu', 'student', 'John Appleseed'),
('u2222222-2222-2222-2222-222222222222', 'rider1@campus.edu', 'rider', 'Alice Speed');
