const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedDatabase() {
    console.log('Connecting to MySQL database server...');
    let connection;
    try {
        // First connect without specifying database to create database if not exists
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        const dbName = process.env.DB_NAME || 'finova_db';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await connection.query(`USE \`${dbName}\`;`);
        console.log(`Database '${dbName}' selected.`);

        // Create users table
        const createTableSql = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('SUPPLIER', 'LENDER') NOT NULL,
                entity_name VARCHAR(255) NOT NULL,
                identifier VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await connection.query(createTableSql);
        console.log('Users table verified/created.');

        // Hash common password
        const passwordHash = await bcrypt.hash('demo123', 10);

        const seedUsers = [
            {
                email: 'alpha@supplier.com',
                password_hash: passwordHash,
                role: 'SUPPLIER',
                entity_name: 'Alpha Precision Components',
                identifier: '27AABCA1234F1Z9'
            },
            {
                email: 'beta@supplier.com',
                password_hash: passwordHash,
                role: 'SUPPLIER',
                entity_name: 'Beta Manufacturing Hub',
                identifier: '29BBDEF5678G2Y8'
            },
            {
                email: 'apex@lender.com',
                password_hash: passwordHash,
                role: 'LENDER',
                entity_name: 'Apex Institutional Bank',
                identifier: 'INST-8821'
            },
            {
                email: 'stride@lender.com',
                password_hash: passwordHash,
                role: 'LENDER',
                entity_name: 'Stride NBFC',
                identifier: 'INST-4432'
            },
            {
                email: 'harbor@lender.com',
                password_hash: passwordHash,
                role: 'LENDER',
                entity_name: 'Harbor Private Fund',
                identifier: 'INST-9910'
            }
        ];

        for (const user of seedUsers) {
            const sql = `
                INSERT INTO users (email, password_hash, role, entity_name, identifier)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                password_hash = VALUES(password_hash),
                role = VALUES(role),
                entity_name = VALUES(entity_name),
                identifier = VALUES(identifier);
            `;
            await connection.query(sql, [user.email, user.password_hash, user.role, user.entity_name, user.identifier]);
            console.log(`Seeded user: ${user.email} (${user.role})`);
        }

        console.log('Successfully seeded 5 demo accounts into MySQL users table!');

    } catch (err) {
        console.error('Seed Error:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

seedDatabase();
