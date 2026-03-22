-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) CHECK (role IN ('student', 'rider', 'staff', 'admin')) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CAFETERIAS TABLE (Strictly 2 rows expected in seed)
CREATE TABLE cafeterias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('open', 'closed')) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DELIVERY LOCATIONS (Admin managed)
CREATE TABLE delivery_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    fee DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- REQUESTS TABLE (Student creates these)
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    delivery_location_id UUID REFERENCES delivery_locations(id),
    request_text TEXT NOT NULL,
    budget_range VARCHAR(100),
    preferences TEXT,
    status VARCHAR(50) CHECK (status IN ('request_sent', 'accepted', 'at_cafeteria', 'confirming_items', 'on_way', 'delivered')) DEFAULT 'request_sent',
    payment_status VARCHAR(50) CHECK (payment_status IN ('unpaid', 'pending_verification', 'paid', 'refunded')) DEFAULT 'unpaid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- REQUEST UPDATES TABLE
CREATE TABLE request_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    update_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DELIVERIES TABLE (Rider accepts and fulfills)
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID UNIQUE REFERENCES requests(id) ON DELETE CASCADE,
    rider_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cafeteria_id UUID REFERENCES cafeterias(id),
    final_price DECIMAL(10, 2),
    status VARCHAR(50) CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- MESSAGES FOR REAL-TIME CHAT
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PAYMENTS / REFUNDS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50) CHECK (method IN ('cash', 'transfer')),
    status VARCHAR(50) CHECK (status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
    proof_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmed_by UUID REFERENCES users(id),
    notes TEXT
);

-- PAYMENT PROOFS (Optional explicit table if multiple proofs or history needed)
CREATE TABLE payment_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    proof_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- REALTIME CONFIGURATION (Enable realtime tracking for these tables in Supabase)
-- ALTER PUBLICATION supabase_realtime ADD TABLE requests;
-- ALTER PUBLICATION supabase_realtime ADD TABLE request_updates;
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE deliveries;
-- ALTER PUBLICATION supabase_realtime ADD TABLE payments;
