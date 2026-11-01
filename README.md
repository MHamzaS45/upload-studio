<div align="center">


# [TierStudio](https://tierstudiotierlist.vercel.app/) 
(logo.png)

**A high-performance, responsive tier list editor with a custom Canvas 2D export engine deployed on Vercel.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)


[Features](#features) &nbsp;|&nbsp; [Tech Stack](#tech-stack) &nbsp;|&nbsp; [Getting Started](#getting-started) &nbsp;|&nbsp; [License](#license)

</div>

---

## Overview

Hello esteemed user! Have you ever find the conventional tierlist creation sites to be a bit...suffocating. Having to go through multiple hoops to create an account, just to make tierlists. Then right after, be greeted with a limited variety of customization features for your tierlist cards, especially without labels...

Well then you are in luck, because this is what you might be looking for!

TierStudio is a tier list editor designed to address such limitations within those tierlist creation sites. With the assistance of the  `@dnd-kit/react` drag-and-drop workspace and a custom HTML Canvas 2D rendering pipeline, users can build, share, and export boards at high resolution without the overhead of DOM screenshotting libraries.

The project is architected for low-latency client-side interaction, local-first recovery, and secure cloud synchronization, using **React**, **TypeScript**, **Zustand**, and **Supabase**.

---

## Features

### Responsive Drag-and-Drop Workspace

Board rearrangement is powered by `@dnd-kit/react`. Cards wrap into grid-aligned columns inside each tier row, and item dimensions are recalculated during drag operations to prevent layout shift and keep interactions smooth.

### Hybrid Persistence: Autosave and Recovery

| Layer | Behavior |
| --- | --- |
| **Local cache** | Rather than overengineering with Redis, every card placement, crop adjustment, and color change is written to `localStorage` immediately, protecting sessions from connection drops and accidental tab closures. |
| **Debounced sync** | Writes to Supabase are wrapped in a 750 ms quiet-period debounce and sent as bulk upserts once editing pauses, reducing unnecessary network traffic. |
| **Failure recovery** | If a server write fails, the local backup is retained. On reconnect, the app detects the difference and prompts the user to restore unsaved changes. |

### Canvas Export Engine

The export pipeline renders directly to a canvas instead of relying on slow, low-resolution HTML screenshotting.

- **Programmatic grid layout:** Row planning, column indices (via modulo arithmetic), and line-wrapping indices are computed on the fly.
- **Asynchronous image preloading:** Promise-based loading with `crossOrigin = "anonymous"` fetches assets from remote Supabase storage without tainting the canvas context.
- **Crop and scale:** The 9-parameter `drawImage` call applies cropping, scaling, and offsets based on each item's zoom and pan values.
- **High-resolution output:** Internal canvas dimensions are scaled to 2x so that typography and edges remain sharp.

### Secure Sharing

Shareable links use randomized, collision-resistant slugs generated with `crypto.randomUUID()`. Links map to these slugs rather than primary keys, so database identifiers are never exposed and lists can be published without any additional authentication setup.

---

## The Tech Stack

| Category | Technology |
| --- | --- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS |
| **State management** | Zustand, Manual store subscriptions for work outside the React render loop |
| **Drag and drop** | `@dnd-kit/react`, `@dnd-kit/helpers` |
| **Backend** | Supabase (PostgreSQL) |
| **Security** | Row Level Security (RLS) policies with server-side session checks via `auth.uid()` |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (bundled with Node.js)
- A [Supabase](https://supabase.com/) account and a project to connect to (For more information, consult the official Supabase docs)

### 1. Clone and install

```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
npm install
```

### 2. Configure the database

Run the following script in the **Supabase SQL Editor** to create the schema, enable Row Level Security, and apply the access policies.

<details>
<summary><strong>Show SQL setup script</strong></summary>

```sql
-- Tier lists (parent table)
CREATE TABLE public.tier_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL DEFAULT 'Untitled Board',
  is_public BOOLEAN NOT NULL DEFAULT false,
  public_slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tiers
CREATE TABLE public.tiers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  list_id UUID NOT NULL REFERENCES public.tier_lists(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Tier items
CREATE TABLE public.tier_items (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  crop_x NUMERIC NOT NULL DEFAULT 50,
  crop_y NUMERIC NOT NULL DEFAULT 50,
  zoom NUMERIC NOT NULL DEFAULT 1,
  tier_id UUID REFERENCES public.tiers(id) ON DELETE SET NULL,
  list_id UUID NOT NULL REFERENCES public.tier_lists(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.tier_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_items ENABLE ROW LEVEL SECURITY;

-- Access policies
CREATE POLICY "Allow public select on lists" ON public.tier_lists
  FOR SELECT USING (owner_id = auth.uid() OR is_public = true);

CREATE POLICY "Allow users to insert lists" ON public.tier_lists
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Allow users to update lists" ON public.tier_lists
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Allow owners to manage tiers" ON public.tiers
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.tier_lists WHERE id = list_id AND owner_id = auth.uid()
  ));

CREATE POLICY "Allow owners to manage tier_items" ON public.tier_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.tier_lists WHERE id = list_id AND owner_id = auth.uid()
  ));
```

</details>

### 3. Set environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_publishable_key
```

### 4. Start the development server
Finally, when all of the following crietia are met,  run the command
```bash
npm run dev
```

The app will then be available at [http://localhost:5173](http://localhost:5173).


---

## Planned Features

### v0.2.0
- Improving bugs and allowing users to add/delete tier rows

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.