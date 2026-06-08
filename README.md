# Basso Global Partners — Website

Marketing site for Basso Global Partners (brand of Basso Global Advisors AG, Zürich — FINMA-licensed). Static **HTML / CSS / vanilla JS**, no build step.

## Run locally

```bash
python -m http.server 8731
# → http://127.0.0.1:8731
```

Any static file server works (no build/deps).

## Structure

```
index.html            Single-page site (hash routing: #home #strategy #team #news #contact)
admin.html            News admin dashboard (see "Admin" below)
css/
  styles.css          Design (extracted, unchanged look)
  animations.css      Subtle scroll/hover motion (reduced-motion safe)
  responsive.css      Breakpoints (≤1024 / ≤760 / ≤640) — desktop untouched
js/
  main.js             Team data + page router + map tooltips + accordions
  enhance.js          Reveal, stat count-up, hash routing, contact mailto, mobile nav
  news-store.js       News data layer — localStorage now, swappable to Supabase
  news.js             Public News rendering + live subscribe
  admin.js            Admin logic (upload / list / delete)
assets/               All images (logos, hero, world map, team photos)
```

## Content

Page copy + team bios match the client script **v14**. Office-map markers are calibrated to the stylized `assets/world-map.png` (image-specific — recalibrate if the map image changes).

## News + Admin

- **Public News** (`#news`) renders cards from `news-store.js` and updates live when news changes.
- **Admin** (`admin.html`) uploads a PDF + title/date/excerpt; published items appear on the News page.
- **Data layer is a stub**: persists to `localStorage` (per-browser). Each `news-store.js` method is commented with its **Supabase** target — swap that one file for a real backend (DB + Storage + Auth + Realtime). Nothing else changes.

> ⚠️ **The admin login is a client-side demo gate — NOT real authentication.** It protects nothing and must be replaced by Supabase Auth before production. Do not store anything sensitive.

## Status / next

- Backend (Supabase recommended) for real news persistence + auth + realtime — **pending decision**.
- Contact form = `mailto:` placeholder; newsletter = client-side stub → planned: HubSpot Forms.
- Deploy target: Vercel/Netlify (static — upload `index.html`, `admin.html`, `css/`, `js/`, `assets/`).
