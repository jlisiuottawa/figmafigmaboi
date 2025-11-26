-- Migration: Remove old garden items that are no longer used
-- The new garden items are: Tulips, Cacti (colored), Sunflowers, and their Golden variants
-- Backgrounds: Chill Background, Grass Backyard, Raised Beds, Garden Background

-- Remove old plants that are no longer in the current item set
DELETE FROM garden_items 
WHERE name IN (
  'Cactus', 
  'Carnivorous Plant', 
  'Carnivorous Plant Art',
  'Pine Tree', 
  'Pine Tree Classic',
  'Exotic Palm', 
  'Palm Tree',
  'Desert Plants', 
  'Flower Bouquet', 
  'Potted Plant', 
  'Pandanus Plant',
  'Cactus Pot',
  'Watercolor Cactus',
  'May Flowers',
  'White Flowers'
) AND item_type = 'plant';

-- Remove old backgrounds that are no longer used
DELETE FROM garden_items 
WHERE name IN (
  'Abstract Garden',
  'Backyard',
  'Sunset Garden'
) AND item_type = 'background';
