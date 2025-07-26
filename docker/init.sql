CREATE DATABASE IF NOT EXISTS flight_tracker;
USE flight_tracker;

CREATE TABLE IF NOT EXISTS flights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME NOT NULL,
    pilotName VARCHAR(255) NOT NULL,
    startTime DECIMAL(10,2) NOT NULL,
    endTime DECIMAL(10,2) NOT NULL,
    totalTime DECIMAL(10,2) GENERATED ALWAYS AS (endTime - startTime) STORED,
    comments TEXT
);

INSERT INTO flights (date, pilotName, startTime, endTime, comments) VALUES
('2024-01-15 08:00:00', 'testpilotName', 250.00, 251.00, 'testcomments'),
('2024-01-16 09:30:00', 'testpilotName', 250.00, 251.00, 'testcomments'),
('2024-01-17 14:15:00', 'testpilotName', 250.00, 251.00, 'testcomments'),
('2024-01-18 10:45:00', 'testpilotName', 250.00, 251.00, 'testcomments'),
('2024-01-19 16:20:00', 'testpilotName', 250.00, 251.00, 'testcomments');