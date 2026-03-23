const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { Server } = require('socket.io');
const http = require('http');

// (Unified fetch-based Turso client enabled)

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// REQ LOGGER
app.use((req, res, next) => {
    console.log(`📡 [${req.method}] ${req.path}`);
    next();
});

let db;

// Turso/SQLite Compatibility Wrapper
class Database {
    constructor(isLibsql = false, url = null, authToken = null, localDb = null) {
        this.isLibsql = isLibsql;
        this.url = url;
        this.authToken = authToken;
        this.localDb = localDb;
    }

    async executeTurso(sql, params = []) {
        const response = await fetch(`${this.url}/v1/execute`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                stmt: { sql, args: params.map(p => this.formatParam(p)) }
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || JSON.stringify(data));
        return data.result;
    }

    formatParam(p) {
        if (p === null || p === undefined) return { type: 'null' };
        if (typeof p === 'number') return { type: 'integer', value: p.toString() };
        if (typeof p === 'boolean') return { type: 'integer', value: p ? '1' : '0' };
        return { type: 'text', value: p.toString() };
    }

    async get(sql, params = []) {
        if (this.isLibsql) {
            const res = await this.executeTurso(sql, params);
            // res.rows is [ [val1, val2], ... ]
            // res.cols is [ {name: 'id'}, ... ]
            if (!res.rows || res.rows.length === 0) return null;
            const obj = {};
            res.cols.forEach((col, i) => obj[col.name] = res.rows[0][i]);
            return obj;
        }
        return await this.localDb.get(sql, params);
    }

    async all(sql, params = []) {
        if (this.isLibsql) {
            const res = await this.executeTurso(sql, params);
            if (!res.rows) return [];
            return res.rows.map(row => {
                const obj = {};
                res.cols.forEach((col, i) => obj[col.name] = row[i]);
                return obj;
            });
        }
        return await this.localDb.all(sql, params);
    }

    async run(sql, params = []) {
        if (this.isLibsql) {
            return await this.executeTurso(sql, params);
        }
        return await this.localDb.run(sql, params);
    }

    async exec(sql) {
        if (this.isLibsql) {
            const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
            for (const s of statements) {
                console.log("Executing SQL:", s.substring(0, 50) + "...");
                await this.executeTurso(s);
            }
            return;
        }
        return await this.localDb.exec(sql);
    }
}

async function initDB() {
    let url = process.env.TURSO_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (url) {
        url = url.trim().replace(/\/$/, ""); 
        // Force HTTPS for fetch client
        if (url.startsWith("libsql://")) {
            url = url.replace("libsql://", "https://");
        }
        console.log(`☁️  CONNECTING TO TURSO (FETCH-MODE): ${url}...`);
        db = new Database(true, url, authToken);
    } else {
        console.log("📁 USING LOCAL SQLITE...");
        const localDb = await open({ filename: './database.sqlite', driver: sqlite3.Database });
        db = new Database(false, null, null, localDb);
    }

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            password TEXT,
            name TEXT,
            full_name TEXT,
            role TEXT,
            phone_number TEXT,
            hostel_name TEXT,
            room_number TEXT,
            preferences TEXT DEFAULT '{}'
        );
        CREATE TABLE IF NOT EXISTS delivery_locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            description TEXT,
            fee REAL DEFAULT 0,
            is_active INTEGER DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS requests (
            id TEXT PRIMARY KEY,
            student_id TEXT,
            delivery_location_id INTEGER,
            request_text TEXT,
            budget_range TEXT,
            status TEXT,
            rider_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            request_id TEXT,
            sender_id TEXT,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Insert hardcoded locations if empty
    const locs = await db.all("SELECT * FROM delivery_locations");
    if (locs.length === 0) {
        await db.run("INSERT INTO delivery_locations (name, description, fee) VALUES ('Joseph Hall', 'Male Undergraduate Hostel', 1.50), ('Levi Hall', 'Male Undergraduate Hostel', 1.50), ('Esme Hall', 'Female Undergraduate Hostel', 2.00), ('Babcock Library', 'Central Study Area', 0.50)");
    }
}

// REST ENDPOINTS
app.get('/api/auth/signup', (req, res) => {
    res.status(405).json({ error: "Please use POST to sign up. If you are seeing this in the browser, it is expected. If you see this in the app, the frontend is sending the wrong method." });
});

app.post('/api/auth/signup', async (req, res) => {
    console.log("Signup attempt:", req.body.email, req.body.role);
    try {
        const { email, password, full_name, phone_number, hostel_name, room_number, role } = req.body;
        const id = Date.now().toString() + Math.random().toString(36).substring(7);
        const userRole = role || 'student'; // Fallback to student
        
        await db.run(`INSERT INTO users (id, email, password, name, full_name, role, phone_number, hostel_name, room_number)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                      [id, email, password, full_name, full_name, userRole, phone_number, hostel_name, room_number]);
        
        console.log("Signup success:", email, "Role:", userRole);
        res.status(201).json({ id, email, name: full_name, full_name, role: userRole });
    } catch(err) {
        console.error("Signup error:", err);
        if(err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        res.status(500).json({ error: err.message || "Database error during signup" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    console.log("Login attempt:", req.body.email);
    try {
        const { email, password } = req.body;
        const user = await db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
        if (!user) {
            console.log("Login failed: Invalid credentials for", email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        console.log("Login success:", email);
        res.json({ id: user.id, email: user.email, name: user.name, full_name: user.full_name, role: user.role });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: err.message || "Database error during login" });
    }
});

app.get('/api/locations', async (req, res) => {
    // web-app fetches only active by default
    res.json(await db.all("SELECT * FROM delivery_locations WHERE is_active = 1 ORDER BY name"));
});

async function getPopulatedRequest(reqId) {
    return await db.get(`
        SELECT r.*, l.name as delivery_location_name 
        FROM requests r 
        LEFT JOIN delivery_locations l ON r.delivery_location_id = l.id 
        WHERE r.id = ?`, [reqId]);
}

// Student API: Get Active Request
app.get('/api/requests/student/:id', async (req, res) => {
    const reqs = await db.all(`
        SELECT r.*, l.name as delivery_location_name 
        FROM requests r 
        LEFT JOIN delivery_locations l ON r.delivery_location_id = l.id 
        WHERE r.student_id = ? AND r.status != 'delivered'
        ORDER BY r.created_at DESC LIMIT 1`, [req.params.id]);
    res.json(reqs);
});

// Rider API: Get Available Requests
app.get('/api/requests/available', async (req, res) => {
    const reqs = await db.all(`
        SELECT r.*, l.name as delivery_location_name 
        FROM requests r 
        LEFT JOIN delivery_locations l ON r.delivery_location_id = l.id 
        WHERE r.status = 'request_sent'`);
    res.json(reqs);
});

// Create Request
app.post('/api/requests', async (req, res) => {
    const { student_id, delivery_location_id, request_text, budget_range } = req.body;
    const id = 'req_' + Date.now();
    await db.run(`INSERT INTO requests (id, student_id, delivery_location_id, request_text, budget_range, status)
                  VALUES (?, ?, ?, ?, ?, 'request_sent')`, 
                  [id, student_id, delivery_location_id, request_text, budget_range]);
    
    const newReq = await getPopulatedRequest(id);
    io.emit('new_request', newReq); // Global broadcast to riders
    res.json(newReq);
});

// Update Request Status / Accept Delivery
app.put('/api/requests/:id', async (req, res) => {
    const { status, rider_id } = req.body;
    if (rider_id) {
        await db.run(`UPDATE requests SET status = ?, rider_id = ? WHERE id = ?`, [status, rider_id, req.params.id]);
    } else {
        await db.run(`UPDATE requests SET status = ? WHERE id = ?`, [status, req.params.id]);
    }
    const updatedReq = await getPopulatedRequest(req.params.id);
    io.emit('request_updated', updatedReq);
    res.json(updatedReq);
});

// Messages
app.get('/api/messages/:requestId', async (req, res) => {
    const msgs = await db.all("SELECT * FROM messages WHERE request_id = ? ORDER BY created_at ASC", [req.params.requestId]);
    res.json(msgs);
});

app.post('/api/messages', async (req, res) => {
    const { request_id, sender_id, content } = req.body;
    const id = 'msg_' + Date.now();
    await db.run(`INSERT INTO messages (id, request_id, sender_id, content) VALUES (?, ?, ?, ?)`, 
                  [id, request_id, sender_id, content]);
    const newMsg = await db.get("SELECT * FROM messages WHERE id = ?", [id]);
    io.to(`chat_${request_id}`).emit('new_message', newMsg);
    res.json(newMsg);
});

// ============================================
// PROFILE API ENDPOINTS
// ============================================
app.get('/api/profile/:id', async (req, res) => {
    console.log(`Profile request for ID: ${req.params.id}`);
    const user = await db.get("SELECT id, email, name, full_name, role, phone_number, hostel_name, room_number, preferences FROM users WHERE id = ?", [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

app.put('/api/profile/:id', async (req, res) => {
    const { full_name, phone_number, hostel_name, room_number } = req.body;
    await db.run(`UPDATE users SET full_name = ?, name = ?, phone_number = ?, hostel_name = ?, room_number = ? WHERE id = ?`,
        [full_name, full_name, phone_number, hostel_name, room_number, req.params.id]);
    const updated = await db.get("SELECT id, email, name, full_name, role, phone_number, hostel_name, room_number FROM users WHERE id = ?", [req.params.id]);
    res.json(updated);
});

// ============================================
// ADMIN API ENDPOINTS
// ============================================
app.get('/api/admin/users', async (req, res) => {
    res.json(await db.all("SELECT * FROM users"));
});

app.patch('/api/admin/users/:id', async (req, res) => {
    const { preferences } = req.body;
    await db.run(`UPDATE users SET preferences = ? WHERE id = ?`, [preferences, req.params.id]);
    res.json({ success: true });
});

app.get('/api/admin/requests', async (req, res) => {
    const reqs = await db.all(`
        SELECT r.*, l.name as location_name 
        FROM requests r 
        LEFT JOIN delivery_locations l ON r.delivery_location_id = l.id 
        ORDER BY r.created_at DESC`);
    
    // Map output to match admin-dashboard expected field (req.delivery_locations.name)
    const mappedReqs = reqs.map(r => ({
        ...r,
        delivery_locations: { name: r.location_name }
    }));
    res.json(mappedReqs);
});

app.get('/api/admin/locations', async (req, res) => {
    res.json(await db.all("SELECT * FROM delivery_locations ORDER BY name"));
});

app.patch('/api/admin/locations/:id', async (req, res) => {
    const { is_active } = req.body;
    await db.run(`UPDATE delivery_locations SET is_active = ? WHERE id = ?`, [is_active ? 1 : 0, req.params.id]);
    res.json({ success: true });
});

app.get('/api/admin/stats', async (req, res) => {
    const reqs = await db.all("SELECT * FROM requests");
    const activeReqs = reqs.filter(r => r.status !== 'delivered').length;
    const activeDeliveries = reqs.filter(r => r.rider_id && r.status !== 'delivered').length;
    
    const locationCounts = {};
    reqs.forEach(r => {
        if(r.delivery_location_id) {
            locationCounts[r.delivery_location_id] = (locationCounts[r.delivery_location_id] || 0) + 1;
        }
    });

    let topZoneId = null, max = 0;
    Object.keys(locationCounts).forEach(id => {
        if (locationCounts[id] > max) { max = locationCounts[id]; topZoneId = id; }
    });

    const topZoneRow = topZoneId ? await db.get("SELECT name FROM delivery_locations WHERE id = ?", [topZoneId]) : null;

    res.json({
        requests: activeReqs,
        deliveries: activeDeliveries,
        topZone: topZoneRow ? topZoneRow.name : 'N/A'
    });
});

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'CampusEats Backend Online', timestamp: new Date().toISOString() });
});

// SOCKETS 
io.on('connection', (socket) => {
    socket.on('join_chat', (requestId) => socket.join(`chat_${requestId}`));
});

const PORT = process.env.PORT || 3001;

// Middleware to ensure DB is initialized before processing requests
app.use((req, res, next) => {
    if (!db && req.path !== '/') {
        return res.status(503).json({ error: "Database initializing. Please try again in a few seconds." });
    }
    next();
});

// Start server IMMEDIATELY so Render's health check passes
server.listen(PORT, () => {
    console.log(`🚀 CAMPUS-EATS BACKEND LISTENING ON PORT ${PORT} 🚀`);
    console.log("🛠️  INITIALIZING DATABASE...");
    
    initDB().then(() => {
        console.log("✅ DATABASE INITIALIZED SUCCESSFULLY");
    }).catch(err => {
        console.error("❌ CRITICAL ERROR DURING DATABASE INIT:");
        console.error(err);
        // We don't exit here so we can still see the logs via the health check endpoint
    });
});

