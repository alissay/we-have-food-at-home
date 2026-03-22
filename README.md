# Family Recipes

A high-protein meal planning app built for 3 adults in Scottsdale, AZ.

## What this is

A single-file HTML app — no build step, no dependencies, no server required. Everything runs in the browser. Open `index.html` and it works.

## Features

- **275 recipes** across 10 tabs: Italian, American, Mexican, Chinese, Thai, Japanese, Make It Now (pantry), Breakfast, Desserts, Favorites
- **Week planner** — drag recipes into a 7-day × 3-meal calendar
- **Shopping list** — generates from the planner or cart, with price estimates for Fry's/Safeway, Amazon Fresh, and Costco (15255 N Hayden Rd, Scottsdale)
- **Cooking history** — mark recipes as made, tracks frequency and recency
- **Pantry stock** — auto-tracks ingredient usage, Full/Low/Out status
- **Favorites** — star any recipe, persisted across sessions
- **Sync** — export/import state as JSON to share between devices
- **Serves toggle** — scale macros and ingredient quantities for 1, 2, or 3 people

## Dietary constraints

- No pork, no beef
- Nothing spicy
- No raw fish
- Targets: ~1,500 cal/day · 130g protein/day per person

## Local pantry

Heavy stock of: Just Bare chicken (multiple cuts, frozen), frozen ground turkey, Kirkland almond flour (3lb), frozen corn (7+ bags), Campbell's Cream of Mushroom (8+ cans), Pacific chicken broth (4 cartons), Cento San Marzano tomatoes, StarKist tuna (4 cans), assorted Mexican salsas, Toll House chocolate chips, Jell-O Banana Cream pudding (5 boxes), pumpkin puree (2 cans), CocoLopez cream of coconut (2 cans), Jennie-O turkey patties, Ling Ling potstickers, assorted frozen vegetables.

Nearest stores: Fry's, Safeway, Costco (15255 N Hayden Rd 85260), Amazon Fresh.

## Data persistence

All state saves to `localStorage` — favorites, week plan, cooking history, pantry stock, serves preference. Use the ☁ Sync panel to export/import state between devices.

## Deployment

Hosted on Vercel as a static site. Push to `main` to redeploy.

## Future

- [ ] Real-time sync via Vercel KV (endpoint slot already in the Sync panel)
- [ ] More Make It Now recipes as pantry evolves
- [ ] Ingredient consolidation improvements in shopping list
