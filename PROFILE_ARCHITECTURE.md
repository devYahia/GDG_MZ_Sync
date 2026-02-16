# /profile Architecture and Design Concept

## Overview
The Profile section serves as the "Developer Identity" within **Interna. Virtual**. It functions as a dynamic, premium resume/portfolio that tracks a user's virtual internship progress, technical skills, and behavioral data.

---

## Technical Architecture

### 1. Data Model (Supabase)
The profile is powered by the `public.profiles` table, extending the `auth.users` identity.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key (references `auth.users.id`) |
| `full_name` | Text | User's display name |
| `field` | Enum | Career path (Frontend, Backend, etc.) |
| `experience_level`| Enum | student, fresh_grad, or junior |
| `interests` | Array[Text]| Specific tech interests |
| `bio` | Text | Professional summary |
| `avatar_url` | Text | Path to Supabase Storage avatar |
| `region` | Text | Physical location (Region) |
| `completed_simulations_count` | Int | Counter for finished workloads |
| `onboarding_completed` | Bool | Flag for initialization status |

### 2. Security (RLS)
- **Select**: Publicly viewable (optionally restricted to authenticated users).
- **Update**: Only the owner (`auth.uid() = id`) can modify their own profile data.
- **Insert**: Automatically handled during signup via Server Action or DB trigger.

### 3. Server-Side Integration
- **Next.js Server Components**: Fetch profile data server-side to ensure SEO and fast initial renders.
- **Server Actions**: All mutations (updating bio, changing field, uploading avatar) are handled via Server Actions with Zod validation.

---

## Design Concept: "Liquid Glass HUD"

### 1. Aesthetic Direction
- **Theme**: Ultra-dark, premium noir.
- **Visuals**: High-gloss glassmorphism, subtle purple/indigo glows, and "liquid" surface textures.
- **Typography**: `Museo Moderno` for branding, `Geist Sans` for UI, and `Geist Mono` for technical data.

### 2. Layout Structure (Mobile-First)

#### **A. Header: Identity Card**
- A large, animated glass container (`liquid-glass` class).
- Floating Avatar with a status glow (online/active).
- Direct HUD-style display of "User Rank" and "Internship Path".

#### **B. The "Internship HUD": Progress Metrics**
- Bento-grid style layout.
- **Simulation Sync**: Real-time counter of completed tasks.
- **Efficiency Score**: A circular progress ring showing performance quality.
- **Region Radar**: Small map/location icon indicating their timezone.

#### **C. Technical Stack and Interests**
- Dynamic "pill" tags with glass backgrounds.
- High-contrast text with purple accents.
- Field selection (Frontend, Backend, etc.) using a premium custom dropdown.

#### **D. Biography and Story**
- Clean, focused text area.
- "Edit Mode" uses a seamless, minimalist inline-editor aesthetic.

---

## Interactions and Micro-animations
- **Hover States**: Glass cards should subtly tilt (perspective transform) and intensify their glow on hover.
- **Mutations**: Use `react-transition-group` or Framer Motion for smooth state transitions when switching fields or updating the bio.
- **Success Feedback**: Sonner notifications with the custom "Liquid Glass" styling established in `globals.css`.

---

## Implementation Checklist
1. [ ] Create `app/(dashboard)/profile/page.tsx`.
2. [ ] Implement `ProfileHeader`, `ProfileStats`, and `ProfileSettings` components.
3. [ ] Set up Supabase Storage bucket for `avatars`.
4. [ ] Create `updateProfile` Server Action in `app/(dashboard)/profile/actions.ts`.
5. [ ] Integrate `Zod` validation for field constraints.
