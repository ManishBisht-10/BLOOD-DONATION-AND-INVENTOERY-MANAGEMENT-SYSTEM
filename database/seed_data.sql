USE blood_donation_system;

-- Insert sample hospitals
INSERT INTO Hospital (name, email, contact, address, password, status)
VALUES
('City Blood Bank', 'citybb@gmail.com', '9876543210', 'Downtown City', '1234', 'approved'),
('Green Valley Hospital', 'gvh@gmail.com', '9123456780', 'Green Road, Sector 15', 'abcd', 'approved');

-- Insert sample donors
INSERT INTO Donor (name, gender, age, blood_group, contact, address, last_donation_date, password)
VALUES
('Riya Patel', 'Female', 24, 'A+', '9898989898', 'Sector 12', '2025-01-10', '12345'),
('Arjun Mehta', 'Male', 30, 'O+', '9876543210', 'MG Road', '2024-12-20', '54321'),
('Sara Khan', 'Female', 27, 'B-', '9988776655', 'Hill View', '2024-11-15', '11111');

-- Insert sample admin
INSERT INTO Admin (name, email, password)
VALUES
('System Admin', 'admin@bdims.com', 'admin123');

-- Insert initial inventory for hospitals
INSERT INTO Inventory (hospital_id, blood_group, quantity, expiry_date)
VALUES
(1, 'A+', 5, '2025-11-01'),
(1, 'O+', 3, '2025-10-25'),
(2, 'B-', 2, '2025-10-18');

-- Insert sample donation records
INSERT INTO Donation (donor_id, hospital_id, donation_date, quantity, status)
VALUES
(1, 1, '2025-02-01', 1, 'approved'),
(2, 1, '2025-03-05', 1, 'approved'),
(3, 2, '2025-03-10', 1, 'pending');

-- Insert sample requests
INSERT INTO Request (hospital_id, blood_group, quantity, status, request_date, fulfilled_by)
VALUES
(2, 'A+', 2, 'pending', '2025-04-15', NULL),
(1, 'B-', 1, 'approved', '2025-04-20', 2);
