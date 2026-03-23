const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function check() {
    const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });
    const rows = await db.all('SELECT id, status, rider_id, request_text FROM requests');
    console.log(JSON.stringify(rows, null, 2));
}
check();
