# Component Documentation

## Overview

This document describes all reusable components in your application.

---

## Navigation Component

**File:** `src/components/Navigation.js`

### Purpose
Provides top navigation bar and bottom mobile navigation for the application.

### Features
- ✅ Fixed positioning (sticky at top/bottom)
- ✅ Mobile responsive with separate bottom nav
- ✅ Active route highlighting
- ✅ Hides on admin pages
- ✅ Book a Table button

### Props
None (uses `usePathname()` hook internally)

### Usage
```javascript
import Navigation from '@/components/Navigation';

export default function Layout({ children }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
```

### Component Structure
```
Navigation
├── Top Navigation (desktop)
│   ├── Logo
│   ├── Links (Home, Menu, Experience, Events, Memberships)
│   └── Book a Table Button
└── Bottom Navigation (mobile)
    ├── Home
    ├── Menu
    ├── Events
    └── Reserve
```

### Styling
- Uses Tailwind CSS
- Colors from design system (primary, stone-600, etc.)
- Material Symbols icons

---

## Admin Layout Component

**File:** `src/app/(admin)/layout.js`

### Purpose
Provides admin dashboard structure with sidebar navigation.

### Features
- ✅ Left sidebar with admin links
- ✅ Active route indicators
- ✅ Responsive design
- ✅ Sign out button (UI only, not functional)

### Routes
- `/admin/orders` - Incoming Orders
- `/admin/venue-bookings` - Venue Bookings

### Component Structure
```
AdminLayout
├── Sidebar
│   ├── Logo / Branding
│   ├── Admin Links
│   │   ├── Incoming Orders
│   │   └── Venue Bookings
│   ├── Divider
│   └── Sign Out
└── Main Content Area
    └── {children}
```

---

## Current Component Inventory

| Component | File | Type | Status |
|-----------|------|------|--------|
| Navigation | `src/components/Navigation.js` | Layout | ✅ Active |
| AdminLayout | `src/app/(admin)/layout.js` | Layout | ✅ Active |

---

## Adding New Components

### Example: Create a MenuItem Component

```javascript
// src/components/MenuItem.js
"use client";

export default function MenuItem({ name, description, price, imageUrl }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <img src={imageUrl} alt={name} className="w-full h-48 object-cover rounded mb-4" />
      <h3 className="font-headline text-lg">{name}</h3>
      <p className="text-stone-600 text-sm mb-2">{description}</p>
      <span className="font-bold text-primary">₹{price}</span>
    </div>
  );
}
```

### Best Practices

1. **Keep Components Pure**
   - Don't fetch data directly in components
   - Accept data as props
   - Separate UI from logic

2. **Use "use client" When Needed**
   ```javascript
   "use client";  // Only if component uses hooks, events, etc.
   ```

3. **Document Props**
   ```javascript
   /**
    * MenuItem component displays a single menu item
    * @param {string} name - Item name
    * @param {string} description - Item description
    * @param {number} price - Item price in rupees
    * @param {string} imageUrl - Image URL
    */
   ```

4. **Handle Loading States**
   ```javascript
   if (loading) return <div className="skeleton">Loading...</div>;
   if (error) return <div className="error">{error}</div>;
   return <div>{/* content */}</div>;
   ```

---

## Component Library Integration

Consider installing a component library for faster development:

```bash
# Popular options:
npm install shadcn/ui        # Accessible components
npm install headlessui        # Headless UI components
npm install react-icons       # Icon library
```

---

## Styling Approach

All components use **Tailwind CSS** with custom design tokens defined in `tailwind.config.ts`.

### Color Palette
- **Primary:** Emerald green
- **Secondary:** Stone gray
- **Surface:** Off-white backgrounds

### Font Usage
- **Headlines:** `font-headline` (serif)
- **Body:** `font-body` (sans-serif)
- **Labels:** `font-label` (uppercase)

---

## Next: Page-Specific Components

Page-specific components should live in the page folder:

```
src/app/(public)/interactive-menu/
├── page.js                 # Main component
├── page.module.css         # Page-specific styles
├── components/
│   ├── MenuGrid.js
│   ├── FilterBar.js
│   └── SearchBar.js
```

---

Does testing and migration section of the documentation:

## Common Component Patterns

### Loading State
```javascript
if (loading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
return <Content />;
```

### Conditional Rendering
```javascript
{isAdmin && <AdminPanel />}
{user?.role === 'admin' && <ProtectedFeature />}
```

### List Rendering
```javascript
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {items.map((item) => (
    <MenuItem key={item.id} {...item} />
  ))}
</div>
```

---

For more information, see:
- [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) - Where files go
- [API_ROUTES.md](API_ROUTES.md) - How to fetch data
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin-specific setup
