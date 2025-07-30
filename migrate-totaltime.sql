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

