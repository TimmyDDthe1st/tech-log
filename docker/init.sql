CREATE DATABASE IF NOT EXISTS flight_tracker;
USE flight_tracker;

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
    comments TEXT
);

INSERT INTO flights (date, pilotName, startTime, endTime, comments) VALUES
('2024-01-15 08:00:00', 'testpilotName', 2.50, 3.30, 'January flight'),
('2024-02-16 09:30:00', 'testpilotName', 3.30, 4.15, 'February flight'),
('2024-03-17 14:15:00', 'testpilotName', 4.15, 5.00, 'March flight'),
('2024-04-18 10:45:00', 'testpilotName', 5.00, 6.30, 'April flight'),
('2024-05-19 16:20:00', 'testpilotName', 6.30, 7.45, 'May flight');