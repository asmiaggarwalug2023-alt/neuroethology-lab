# Neuroethology Lab

A collaborative internal web app for the Neuroethology Lab.

## Current features
- “Make yourself at sea” home dashboard
- EB Garamond global typography
- Fish cursor (on by default)
- Shared task pages for feeding, cleaning, and other lab work
- Lab calendar with recurring ASP Thesis Meeting (Mon 9:30–10:30) and Lab Meeting (Wed 1:30–2:30)
- Fish Care knowledge section
- Lab Setups
- Project hubs
- Lab Handbook
- Research Catalogue
- Lab Stock
- People & Alumni
- Login screen and Supabase-ready structure

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Supabase
Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key when ready.

## Notes
This is an initial working prototype. Authentication and shared realtime data are scaffolded for Supabase but require a Supabase project to be connected.
