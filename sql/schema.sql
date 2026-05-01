-- SQL schema for Barangay Service & Complaint Management
CREATE DATABASE IF NOT EXISTS barangay_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE barangay_db;

-- Residents
CREATE TABLE IF NOT EXISTS Resident (
  resident_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255),
  middle_name VARCHAR(255),
  last_name VARCHAR(255),
  birth_date DATE,
  gender VARCHAR(32),
  address VARCHAR(500),
  contact_number VARCHAR(50),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  account_status VARCHAR(50) DEFAULT 'Pending',
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  api_token VARCHAR(255)
);

-- Staff
CREATE TABLE IF NOT EXISTS Staff (
  staff_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255),
  role VARCHAR(50),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  contact_number VARCHAR(50),
  account_status VARCHAR(50) DEFAULT 'Active',
  api_token VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Category (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(255),
  description VARCHAR(1000)
);

CREATE TABLE IF NOT EXISTS Complaint (
  complaint_id INT AUTO_INCREMENT PRIMARY KEY,
  resident_id INT,
  category_id INT,
  assigned_staff_id INT NULL,
  title VARCHAR(255),
  description TEXT,
  incident_location VARCHAR(255),
  incident_date DATE,
  status VARCHAR(50) DEFAULT 'Pending',
  resolution_notes TEXT,
  date_submitted DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_resolved DATETIME NULL,
  FOREIGN KEY (resident_id) REFERENCES Resident(resident_id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES Category(category_id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_staff_id) REFERENCES Staff(staff_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Complaint_Attachment (
  attachment_id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT,
  file_path VARCHAR(1000),
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES Complaint(complaint_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Document_Request (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  resident_id INT,
  processed_by INT NULL,
  document_type VARCHAR(255),
  purpose VARCHAR(1000),
  business_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Pending',
  reference_number VARCHAR(255) UNIQUE,
  date_requested DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_approved DATETIME NULL,
  date_released DATETIME NULL,
  FOREIGN KEY (resident_id) REFERENCES Resident(resident_id) ON DELETE SET NULL,
  FOREIGN KEY (processed_by) REFERENCES Staff(staff_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Digital_ID (
  digital_id INT AUTO_INCREMENT PRIMARY KEY,
  resident_id INT UNIQUE,
  id_number VARCHAR(255) UNIQUE,
  qr_token VARCHAR(255) UNIQUE,
  issue_date DATE,
  expiration_date DATE,
  status VARCHAR(50) DEFAULT 'Active',
  FOREIGN KEY (resident_id) REFERENCES Resident(resident_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Accessibility_Settings (
  accessibility_id INT AUTO_INCREMENT PRIMARY KEY,
  resident_id INT UNIQUE,
  text_to_speech_enabled BOOLEAN DEFAULT FALSE,
  high_contrast_mode BOOLEAN DEFAULT FALSE,
  dark_mode BOOLEAN DEFAULT FALSE,
  font_size VARCHAR(50) DEFAULT 'medium',
  FOREIGN KEY (resident_id) REFERENCES Resident(resident_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Notification (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  resident_id INT,
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resident_id) REFERENCES Resident(resident_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Report_Log (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  generated_by INT,
  report_type VARCHAR(255),
  date_generated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (generated_by) REFERENCES Staff(staff_id) ON DELETE SET NULL
);

-- Seed users (admin and resident) with provided credentials (passwords should be hashed by your app)
INSERT IGNORE INTO Staff (full_name, role, email, password, contact_number, account_status) VALUES ('Admin','Admin','admin','123','0000000000','Active');
INSERT IGNORE INTO Resident (first_name, middle_name, last_name, birth_date, gender, address, contact_number, email, password, account_status, registration_date) VALUES ('Carlo','','Resident','2000-01-01','Male','Sample Address','0000000000','carlo','123','Active',NOW());