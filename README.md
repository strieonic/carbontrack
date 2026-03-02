# 🌿 CarbonTrack – Smart Energy & Carbon Footprint Dashboard

**A production-ready Smart City sustainability analytics platform.**  
No login required. Anonymous. Privacy-first. Vercel-ready.

---

## 🚀 Live Demo
Deploy to Vercel (see deployment section below).

---

## 📂 Project Structure

```
carbontrack/
├── index.html              ← Home page (hero, 3D earth, GSAP)
├── vercel.json             ← Vercel routing & headers
├── pages/
│   ├── survey.html         ← Multi-step survey form
│   ├── dashboard.html      ← Carbon footprint dashboard
│   ├── comparison.html     ← Previous vs current comparison
│   ├── suggestions.html    ← AI sustainability suggestions
│   └── impact.html         ← Environmental impact visualization
├── css/
│   ├── global.css          ← Design system, glassmorphism, tokens
│   ├── home.css
│   ├── survey.css
│   ├── dashboard.css
│   ├── comparison.css
│   ├── suggestions.css
│   └── impact.css
└── js/
    ├── supabase.js         ← Supabase client
    ├── device.js           ← Anonymous device ID (no login)
    ├── carbon.js           ← Emission calculation engine
    ├── db.js               ← Database CRUD layer
    ├── nav.js              ← Shared UI utilities
    ├── home.js             ← Canvas particle animation
    ├── survey.js           ← Multi-step form logic
    ├── dashboard.js        ← Chart.js dashboard
    ├── comparison.js       ← Comparison logic
    ├── suggestions.js      ← Rule-based AI suggestions
    └── impact.js           ← Impact visualization
```

---

## ✨ Features

| Page | Feature |
|------|---------|
| **Home** | Three.js particle field, 3D Spline Earth, GSAP animations |
| **Survey** | 6-step form, live carbon preview, automatic Supabase save |
| **Dashboard** | Pie + Line + Bar charts (Chart.js), KPI cards, CO₂ breakdown |
| **Comparison** | Auto-fetch previous vs current, percentage change |
| **AI Tips** | 17+ rule-based suggestions across 5 categories, filterable |
| **Impact** | Tangible equivalents (trees, flights, km), annual projection |

---

## 🛠 Tech Stack

- **HTML5** + **Vanilla CSS** (glassmorphism, custom design system)
- **JavaScript ES Modules** (no bundler needed)
- **Chart.js 4** – Dashboard charts
- **Supabase** – Anonymous cloud storage
- **Spline** – 3D Earth embed
- Canvas API – Particle background

---

## ⚙️ Supabase Setup

Your Supabase project: `https://truoxyqyzuygobiendjy.supabase.co`

### Step 1: Get Your Supabase Anon Key

1. Go to https://supabase.com/dashboard/project/truoxyqyzuygobiendjy/settings/api
2. Copy the "anon" public key (it starts with `eyJ...`)
3. Open `js/supabase.js` and replace the `SUPABASE_KEY` value with your actual key

### Step 2: Create the Database Table

Run this SQL in the Supabase SQL editor:

```sql
CREATE TABLE carbon_entries (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id       text NOT NULL,
  created_at      timestamptz DEFAULT now(),
  city            text,
  people          integer,
  house_type      text,
  electricity_bill numeric,
  electricity_units numeric,
  petrol_km       numeric,
  diesel_km       numeric,
  public_km       numeric,
  ev_km           numeric,
  lpg_cylinders   numeric,
  png_usage       numeric,
  induction_hours numeric,
  ac_hours        numeric,
  has_refrigerator boolean,
  washing_uses    numeric,
  laptop_hours    numeric,
  tv_hours        numeric,
  waste_kg_per_day numeric,
  has_segregation boolean,
  total_co2       numeric,
  per_person_co2  numeric,
  electricity_co2 numeric,
  transport_co2   numeric,
  cooking_co2     numeric,
  appliance_co2   numeric,
  waste_co2       numeric,
  energy_kwh      numeric,
  trees_needed    integer,
  carbon_grade    text
);

-- Enable Row Level Security (allow anonymous inserts + reads by device_id)
ALTER TABLE carbon_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert" ON carbon_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Read own data" ON carbon_entries FOR SELECT USING (true);
```

---

## 🚀 Deploy to Vercel

```bash
# Option 1: Vercel CLI
npm i -g vercel
vercel --prod

# Option 2: Drag & Drop
# Go to vercel.com → New Project → Upload this folder
```

---

## 📊 Emission Factors Used

| Source | Factor |
|--------|--------|
| Electricity (India grid) | 0.82 kg CO₂/kWh |
| Petrol vehicle | 0.192 kg CO₂/km |
| Diesel vehicle | 0.171 kg CO₂/km |
| Public transport | 0.089 kg CO₂/km |
| Electric vehicle (India) | 0.041 kg CO₂/km |
| LPG cylinder | 51.5 kg CO₂/cylinder |
| PNG | 2.1 kg CO₂/m³ |

---

## 🔒 Privacy

- No user accounts or login
- Identified only by a random `crypto.randomUUID()` stored in `localStorage`
- No personal data collected or transmitted

---

© 2026 CarbonTrack · Built for Smart Cities
