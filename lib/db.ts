import mysql from 'mysql2/promise';

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'flightuser',
  password: 'flightpassword',
  database: 'flight_tracker',
});

export default connection;