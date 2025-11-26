-- Clear existing garden items
DELETE FROM garden_items;

-- Insert new plant items (only sunflowers and golden variants)
-- Sunflower (220 seeds)
INSERT INTO garden_items (name, item_type, image_path, cost_seeds, description) VALUES
  ('Sunflower', 'plant', '/SunFlower.png', 220, 'A bright cheerful sunflower');

-- Golden variants (premium plants, 360-660 seeds)
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
