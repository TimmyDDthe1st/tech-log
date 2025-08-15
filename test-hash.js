const bcrypt = require('bcryptjs');

// Generate new hashes
console.log('Generating password hashes...');
const superUserHash = bcrypt.hashSync('SuperUser2024!', 12);
const adminHash = bcrypt.hashSync('Admin2024!', 12);

console.log('SuperUser2024! hash:', superUserHash);
console.log('Admin2024! hash:', adminHash);

// Test the existing hashes
const existingHash = '$2a$12$9vKe7ZwJpLJzQWJf8mGZjuYHDqOL6XvMzNPw8Fq2Kd4LnWcBvE3yG';
console.log('Testing SuperUser2024! against existing hash:', bcrypt.compareSync('SuperUser2024!', existingHash));

const existingAdminHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNSBdAqOD6eeS';
console.log('Testing Admin2024! against existing hash:', bcrypt.compareSync('Admin2024!', existingAdminHash));
