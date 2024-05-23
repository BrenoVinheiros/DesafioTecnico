CREATE DATABASE IF NOT EXISTS iot_data_db;
USE iot_data_db;

CREATE TABLE IF NOT EXISTS iot_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imei VARCHAR(255) NOT NULL,
    tag VARCHAR(255) NOT NULL,
    valor TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    timesince TEXT
);