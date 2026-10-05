# Animalia

A kid-friendly animal encyclopedia: search, continent browsing, quizzes, comparisons, a tank-mate checker and a step-by-step Drawing Academy.

## Run it

    npm install
    npm run dev      # http://localhost:3000

## How it is organised

- `data/` holds the animal records (never hard-coded in the UI). `lib/types.ts` defines the record shape.
- `lib/db.ts` is the only file that reads the data (search, filters, paging, quiz, recommendations). Swap its insides for Postgres or a search engine later and nothing else changes.
- `app/api/*` are the server routes the UI calls.
- `components/` are reusable UI pieces. `lib/settings.tsx` holds Kid / Explorer / Scientist mode, dark mode and the "Gentle" switch that hides potentially frightening animals.
- `lib/store.ts` keeps favourites, progress and streaks in the browser only.

## Data honesty

24 sample animals. Facts were written from general knowledge and show "Not yet verified" until checked against the listed sources (IUCN Red List, Animal Diversity Web, Catalogue of Life). Pictures are emoji placeholders, not photographs.

## Not built yet

Real photos, audio, country-level map, tree of life, food-web diagram, photo identification, accounts, PWA/offline, worksheets and report builder.
