const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function initializeDatabase() {
    try {
        // Read the SQL file
        const sqlFile = path.join(__dirname, 'init.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Execute the SQL
        await pool.query(sql);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        // Close the pool
        await pool.end();
    }
}

// Run the initialization
initializeDatabase(); 