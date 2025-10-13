-- =============================================
-- BLOOD DONATION AND INVENTORY MANAGEMENT SYSTEM
-- DATABASE SCHEMA
-- =============================================

CREATE DATABASE IF NOT EXISTS blood_donation_system;
USE blood_donation_system;

-- ======================
-- TABLE: Donor
-- ======================
CREATE TABLE Donor (
  donor_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  gender VARCHAR(10),
  age INT CHECK (age >= 18),
  blood_group VARCHAR(5) NOT NULL,
  contact VARCHAR(20) UNIQUE,
  address VARCHAR(255),
  last_donation_date DATE,
  password VARCHAR(255) NOT NULL
);

-- ======================
-- TABLE: Hospital
-- ======================
CREATE TABLE Hospital (
  hospital_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  contact VARCHAR(20),
  address VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  status ENUM('approved','pending','blocked') DEFAULT 'pending'
);

-- ======================
-- TABLE: Inventory
-- ======================
CREATE TABLE Inventory (
  inventory_id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT,
  blood_group VARCHAR(5),
  quantity INT DEFAULT 0,
  expiry_date DATE,
  FOREIGN KEY (hospital_id) REFERENCES Hospital(hospital_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- ======================
-- TABLE: Donation
-- ======================
CREATE TABLE Donation (
  donation_id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT,
  hospital_id INT,
  donation_date DATE,
  quantity INT DEFAULT 1,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  FOREIGN KEY (donor_id) REFERENCES Donor(donor_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (hospital_id) REFERENCES Hospital(hospital_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- ======================
-- TABLE: Request
-- ======================
-- Renamed to `Requests` to avoid possible reserved-word conflicts
CREATE TABLE Requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT,
  blood_group VARCHAR(5),
  quantity INT,
  status ENUM('pending','approved','rejected','fulfilled') DEFAULT 'pending',
  request_date DATE,
  fulfilled_by INT,
  FOREIGN KEY (hospital_id) REFERENCES Hospital(hospital_id),
  FOREIGN KEY (fulfilled_by) REFERENCES Hospital(hospital_id)
);

-- ======================
-- TABLE: Admin
-- ======================
CREATE TABLE Admin (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);
