CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'mechanic'))
);

CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    identifier VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL CHECK (
        year > 1885
        AND year <= EXTRACT(YEAR FROM CURRENT_DATE)
    )
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS supplies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS service_orders (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
    services JSONB NOT NULL,
    supplies JSONB NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (
        status IN (
            'RECEIVED',
            'IN_DIAGNOSIS',
            'IN_PROGRESS',
            'WAITING_FOR_APPROVAL',
            'APPROVED',
            'FINISHED',
            'DELIVERED',
            'CANCELLED'
        )
    ),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finalized_at TIMESTAMP,
    CONSTRAINT finalized_at_status CHECK (
        (status IN ('FINISHED', 'CANCELLED') AND finalized_at IS NOT NULL)
        OR (status NOT IN ('FINISHED', 'CANCELLED') AND finalized_at IS NULL)
    )
);
