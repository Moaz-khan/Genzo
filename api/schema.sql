-- Run once in TiDB Cloud SQL Editor.
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(40),
  password_hash VARCHAR(255),
  auth_provider ENUM('local', 'google', 'guest') NOT NULL DEFAULT 'local',
  avatar_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_tokens (
  user_id VARCHAR(80) NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id VARCHAR(80) PRIMARY KEY,
  phone VARCHAR(40),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  order_number VARCHAR(40) PRIMARY KEY,
  user_id VARCHAR(80) NOT NULL,
  guest_name VARCHAR(160) NOT NULL,
  guest_email VARCHAR(255),
  guest_phone VARCHAR(40),
  shipping_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  payment_method VARCHAR(30) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_user_created (user_id, created_at),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(40) NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  image_url TEXT,
  size VARCHAR(50) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_number) REFERENCES orders(order_number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_addresses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(80) NOT NULL,
  recipient_name VARCHAR(160) NOT NULL,
  phone VARCHAR(40),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_addresses_user (user_id),
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlists (
  user_id VARCHAR(80) NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  CONSTRAINT fk_wishlists_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
