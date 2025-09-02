CREATE DATABASE IF NOT EXISTS flight_tracker;
USE flight_tracker;

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    role ENUM('super_user', 'admin', 'pilot', 'accountant') NOT NULL DEFAULT 'pilot',
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    createdBy INT NULL,
    updatedBy INT NULL,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS flights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME NOT NULL,
    pilotName VARCHAR(255) NOT NULL,
    startTime DECIMAL(10,2) NOT NULL,
    endTime DECIMAL(10,2) NOT NULL,
    totalTime DECIMAL(10,2) GENERATED ALWAYS AS (
        -- Convert hours.minutes format to proper time calculation
        -- Convert to total minutes, subtract, then convert back to hours.minutes
        FLOOR(
            ((FLOOR(endTime) * 60 + (endTime - FLOOR(endTime)) * 100) - 
             (FLOOR(startTime) * 60 + (startTime - FLOOR(startTime)) * 100)) / 60
        ) + 
        (((FLOOR(endTime) * 60 + (endTime - FLOOR(endTime)) * 100) - 
          (FLOOR(startTime) * 60 + (startTime - FLOOR(startTime)) * 100)) % 60) / 100
    ) STORED,
    comments TEXT,
    createdBy INT NOT NULL,
    updatedBy INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS aircraft (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration VARCHAR(10) NOT NULL UNIQUE,
    baseHours DECIMAL(10,2) NOT NULL DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    createdBy INT NOT NULL,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT
);

-- Insert default super users and admin user
-- Super user accounts (password: SuperUser2024!)
INSERT INTO users (email, password, firstName, lastName, role, isActive) 
VALUES 
    ('tim@flighttracker.com', '$2a$12$9vKe7ZwJpLJzQWJf8mGZjuYHDqOL6XvMzNPw8Fq2Kd4LnWcBvE3yG', 'Tim', 'Super User', 'super_user', TRUE),
    ('thedimdom@flighttracker.com', '$2a$12$9vKe7ZwJpLJzQWJf8mGZjuYHDqOL6XvMzNPw8Fq2Kd4LnWcBvE3yG', 'TheDimDom', 'Super User', 'super_user', TRUE),
    ('admin@flighttracker.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNSBdAqOD6eeS', 'Admin', 'User', 'admin', TRUE)
ON DUPLICATE KEY UPDATE email = email;

