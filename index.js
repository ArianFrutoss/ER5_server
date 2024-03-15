import pkg from 'pg';
import 'dotenv/config';
const {Pool} = pkg;

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl:{
        rejectUnauthorized: false
    }
})

export const query = (text, params, callback) => {
    return pool.query(text, params, callback)
}