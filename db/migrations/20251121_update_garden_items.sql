-- Clear existing garden items
DELETE FROM garden_items;

-- Insert new plant items (regular variants)
-- Tulips (100-150 seeds)
INSERT INTO garden_items (name, item_type, image_path, cost_seeds, description) VALUES
  ('Hot Pink Tulip', 'plant', '/HotPinkTulip.png', 120, 'A vibrant hot pink tulip'),
  ('Light Pink Tulip', 'plant', '/LightPinkTulip.png', 110, 'A delicate light pink tulip'),
  ('Orange Tulip', 'plant', '/OrangeTulip.png', 130, 'A bright orange tulip'),
  ('Purple Tulip', 'plant', '/PurpleTulip.png', 140, 'A majestic purple tulip');

-- Cacti (150-200 seeds)
INSERT INTO garden_items (name, item_type, image_path, cost_seeds, description) VALUES
  ('Orange Cactus', 'plant', '/OrangeCactus.png', 160, 'A hardy orange cactus'),
  ('Pink Cactus', 'plant', '/PinkCactus.png', 170, 'A rare pink cactus'),
  ('Red Cactus', 'plant', '/RedCactus.png', 180, 'A striking red cactus');

-- Sunflower (200-250 seeds)
INSERT INTO garden_items (name, item_type, image_path, cost_seeds, description) VALUES
  ('Sunflower', 'plant', '/SunFlower.png', 220, 'A bright cheerful sunflower');

-- Golden variants (2-3x the cost of similar regular plants)
INSERT INTO garden_items (name, item_type, image_path, cost_seeds, description) VALUES
  ('Golden Tulip', 'plant', '/GoldenTulip.png', 360, 'A rare and luxurious golden tulip'),
  ('Golden Cactus', 'plant', '/GoldenCactus.png', 480, 'An extremely rare golden cactus'),
  ('Golden Sunflower', 'plant', '/GoldenSunFlower.png', 660, 'The rarest golden sunflower');

-- Insert new backgrounds
-- chill background.jpg is free (0 seeds) as default
INSERT INTO garden_items (name, item_type, image_path, cost_seeds, description) VALUES
  ('Chill Background', 'background', '/chill background.jpg', 0, 'A peaceful default background (Free!)'),
  ('Grass Backyard', 'background', '/grass backyard.jpg', 1500, 'A lush grass backyard'),
  ('Raised Beds', 'background', '/raised_beds.jpg', 2000, 'Beautiful raised garden beds'),
  ('Garden Background', 'background', '/GardenBackground.pdf', 2500, 'Classic garden scene');
