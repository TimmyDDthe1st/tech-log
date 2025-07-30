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

