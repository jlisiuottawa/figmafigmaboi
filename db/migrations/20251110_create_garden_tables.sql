-- Garden items table (plants and backgrounds available for purchase)
CREATE TABLE IF NOT EXISTS garden_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('plant', 'background')),
  image_path VARCHAR(500) NOT NULL,
  cost_seeds INTEGER NOT NULL DEFAULT 100,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User garden table (tracks what users have purchased and placed)
CREATE TABLE IF NOT EXISTS user_garden (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES garden_items(id) ON DELETE CASCADE,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- User active background
CREATE TABLE IF NOT EXISTS user_garden_background (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  background_id INTEGER REFERENCES garden_items(id) ON DELETE SET NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_garden_user_id ON user_garden(user_id);
CREATE INDEX IF NOT EXISTS idx_user_garden_background_user_id ON user_garden_background(user_id);

-- Insert plant items - Tulips
INSERT INTO garden_items (name, item_type, image_path, cost_seeds, description) VALUES
  ('Hot Pink Tulip', 'plant', '/HotPinkTulip.png', 120, 'A vibrant hot pink tulip'),
  ('Light Pink Tulip', 'plant', '/LightPinkTulip.png', 110, 'A delicate light pink tulip'),
  ('Orange Tulip', 'plant', '/OrangeTulip.png', 130, 'A bright orange tulip'),
  ('Purple Tulip', 'plant', '/PurpleTulip.png', 140, 'A majestic purple tulip')
ON CONFLICT DO NOTHING;

-- Insert plant items - Cacti
INSERT INTO garden_items (name, item_type, image_path, cost_seeds, description) VALUES
  ('Orange Cactus', 'plant', '/OrangeCactus.png', 160, 'A hardy orange cactus'),
  ('Pink Cactus', 'plant', '/PinkCactus.png', 170, 'A rare pink cactus'),
  ('Red Cactus', 'plant', '/RedCactus.png', 180, 'A striking red cactus')
ON CONFLICT DO NOTHING;

-- Insert plant items - Sunflower
INSERT INTO garden_items (name, item_type, image_path, cost_seeds, description) VALUES
  ('Sunflower', 'plant', '/SunFlower.png', 220, 'A bright cheerful sunflower')
ON CONFLICT DO NOTHING;

-- Insert plant items - Golden variants
INSERT INTO garden_items (name, item_type, image_path, cost_seeds, description) VALUES
  ('Golden Tulip', 'plant', '/GoldenTulip.png', 360, 'A rare and luxurious golden tulip'),
  ('Golden Cactus', 'plant', '/GoldenCactus.png', 480, 'An extremely rare golden cactus'),
  ('Golden Sunflower', 'plant', '/GoldenSunFlower.png', 660, 'The rarest golden sunflower')
ON CONFLICT DO NOTHING;

-- Insert background items
INSERT INTO garden_items (name, item_type, image_path, cost_seeds, description) VALUES
  ('Chill Background', 'background', '/chill background.jpg', 0, 'A peaceful default background (Free!)'),
  ('Grass Backyard', 'background', '/grass backyard.jpg', 1500, 'A lush grass backyard'),
  ('Raised Beds', 'background', '/raised_beds.jpg', 2000, 'Beautiful raised garden beds'),
  ('Garden Background', 'background', '/GardenBackground.pdf', 2500, 'Classic garden scene')
ON CONFLICT DO NOTHING;
