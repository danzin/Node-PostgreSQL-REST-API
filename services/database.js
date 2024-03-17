const { Pool }= require('pg');
require('dotenv').config();

//Connection string for ElephantSQL
const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING
});

module.exports = { pool }

