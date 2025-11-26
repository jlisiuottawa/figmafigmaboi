# Garden Feature Setup Guide

This guide explains how to set up the new garden feature with plant health tracking.

## Database Migrations

The garden feature requires two new database migrations:

1. **20251121_add_plant_health_tracking.sql** - Adds plant health tracking columns to the users table
2. **20251121_update_garden_items.sql** - Updates garden items with new plants and backgrounds

### Running Migrations

#### Option 1: Using the migration script (recommended)

```bash
# Set your database URL
export DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Run the garden migrations
node scripts/run-garden-migrations.js
```

#### Option 2: Manual SQL execution

Connect to your PostgreSQL database and execute the SQL files in order:

```bash
psql $DATABASE_URL -f db/migrations/20251121_add_plant_health_tracking.sql
psql $DATABASE_URL -f db/migrations/20251121_update_garden_items.sql
```

## New Database Columns

The following columns are added to the `users` table:

- `plant_health` (INTEGER, 0-3): Tracks the health of the user's plants
- `last_watered_at` (TIMESTAMP): Timestamp of when plants were last watered
- `consecutive_water_days` (INTEGER): Tracks consecutive days of watering for health regeneration

## Garden Items

The migration adds the following new items:

### Plants (Regular Variants)
- Hot Pink Tulip: 120 seeds
- Light Pink Tulip: 110 seeds
- Orange Tulip: 130 seeds
- Purple Tulip: 140 seeds
- Orange Cactus: 160 seeds
- Pink Cactus: 170 seeds
- Red Cactus: 180 seeds
- Sunflower: 220 seeds

### Plants (Golden Variants - Premium Pricing)
- Golden Tulip: 360 seeds (3x regular tulip price)
- Golden Cactus: 480 seeds (3x regular cactus price)
- Golden Sunflower: 660 seeds (3x sunflower price)

### Backgrounds
- Chill Background: **FREE** (0 seeds) - Default background for all users
- Grass Backyard: 1500 seeds
- Raised Beds: 2000 seeds
- Garden Background: 2500 seeds

## Plant Health System

### How It Works

1. **Daily Watering**: Users must water their plants at least once per day
2. **Health Degradation**: Each day without watering reduces plant health by 1 bar
3. **Plant Death**: Plants die on the 3rd day without watering (when health reaches 0)
4. **Health Regeneration**: Watering plants for 3 consecutive days restores 1 health bar

### Purchase Limits

- Users can purchase up to **2 of each plant type**
- Users can own **1 background at a time** (but can switch between purchased backgrounds)
- The Chill Background is provided free to all users by default

## API Endpoints

### Water Plants
```
POST /api/user/garden/water
```
Waters the user's plants. Can only be called once per day.

### Check Plant Health
```
GET /api/user/garden/health-check
```
Checks and updates plant health based on watering schedule. Automatically deletes plants if health reaches 0.

## Frontend Features

The new Garden page includes:

1. **Two-tab interface**:
   - Garden Tab: View and place plants on backgrounds
   - Shop Tab: Purchase plants and backgrounds

2. **Plant Health Meter**: Visual indicator showing current plant health (0-3 bars)

3. **Drag-and-Drop**: Place purchased plants on your garden background

4. **Visual Indicators**:
   - Golden plants have special styling
   - Active backgrounds are highlighted
   - Placed plants show placement status

## Troubleshooting

### Migration Errors

If you encounter errors during migration:

1. Check that you have the correct database permissions
2. Verify the DATABASE_URL is correct
3. Ensure PostgreSQL is running and accessible
4. Check if the columns already exist (migrations use IF NOT EXISTS)

### Plants Not Appearing

If new plants don't show up in the shop:

1. Verify the migration ran successfully
2. Check the `garden_items` table for the new items
3. Clear the frontend cache and reload

### Default Background Not Set

New users should automatically receive the free Chill Background. If they don't:

1. Check that the migration created the "Chill Background" item
2. Verify the User creation code in `backend/src/models/User.js`
3. Manually set a background using the purchase endpoint with `itemId` for Chill Background

## Notes

- The PDF background (`GardenBackground.pdf`) is rotated 90 degrees for proper display
- Plant health checks are performed when the user loads the garden page
- Consecutive watering counter resets if a day is missed or if health degrades
