-- =========================================================
--  Mini E-Commerce - Skema Database MySQL
--  Jalankan: mysql -u root -p < backend/sql/schema.sql
--  atau   : npm run db:init
-- =========================================================

CREATE DATABASE IF NOT EXISTS mini_ecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mini_ecommerce;

-- -------------------------
-- Tabel users
-- -------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  role       ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------
-- Tabel products
-- -------------------------
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)   NOT NULL,
  description TEXT,
  price       DECIMAL(12,2)  NOT NULL DEFAULT 0,
  stock       INT            NOT NULL DEFAULT 0,
  category    VARCHAR(80)    NOT NULL DEFAULT 'Umum',
  image_url   VARCHAR(500),
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_products_category (category)
) ENGINE=InnoDB;

-- -------------------------
-- Tabel orders
-- -------------------------
CREATE TABLE IF NOT EXISTS orders (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT            NOT NULL,
  total       DECIMAL(12,2)  NOT NULL DEFAULT 0,
  status      ENUM('pending','paid','shipped','done','cancelled')
              NOT NULL DEFAULT 'pending',
  address     TEXT,
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------
-- Tabel order_items
-- -------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT           NOT NULL,
  product_id INT           NOT NULL,
  name       VARCHAR(150)  NOT NULL,
  price      DECIMAL(12,2) NOT NULL,
  qty        INT           NOT NULL DEFAULT 1,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id)
    REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
