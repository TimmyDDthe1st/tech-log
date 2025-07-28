-- Migration to fix totalTime calculation for hours.minutes format
USE flight_tracker;

-- Drop the existing table (this will recreate with new calculation)
DROP TABLE IF EXISTS flights;

-- Recreate table with correct totalTime calculation
CREATE TABLE flights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME NOT NULL,
    pilotName VARCHAR(255) NOT NULL,
    startTime DECIMAL(10,2) NOT NULL,
    endTime DECIMAL(10,2) NOT NULL,
    totalTime DECIMAL(10,2) GENERATED ALWAYS AS (
        -- Convert hours.minutes format to proper time calculation
        -- End time in minutes: hours * 60 + minutes
        -- Start time in minutes: hours * 60 + minutes  
        -- Result: convert back to hours.minutes format
        FLOOR(
            (FLOOR(endTime) * 60 + (endTime - FLOOR(endTime)) * 100) - 
            (FLOOR(startTime) * 60 + (startTime - FLOOR(startTime)) * 100)
        ) / 60 + 
        (
            (FLOOR(endTime) * 60 + (endTime - FLOOR(endTime)) * 100) - 
            (FLOOR(startTime) * 60 + (startTime - FLOOR(startTime)) * 100)
        ) % 60 / 100
    ) STORED,
    comments TEXT
);

-- Insert sample data with correct hours.minutes format
INSERT INTO flights (date, pilotName, startTime, endTime, comments) VALUES
('2024-01-15 08:00:00', 'testpilotName', 2.50, 3.30, 'January flight - 40 minutes'),
('2024-02-16 09:30:00', 'testpilotName', 3.30, 4.15, 'February flight - 45 minutes'),
('2024-03-17 14:15:00', 'testpilotName', 4.15, 5.00, 'March flight - 45 minutes'),
('2024-04-18 10:45:00', 'testpilotName', 5.00, 6.30, 'April flight - 1 hour 30 minutes'),
('2024-05-19 16:20:00', 'testpilotName', 6.30, 7.45, 'May flight - 1 hour 15 minutes');