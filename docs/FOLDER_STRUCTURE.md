# Project Folder Structure

## Complete Directory Map

```
the-grove-nextjs-final/
│
├── 📁 src/                                    # Source code root
│   │
│   ├── 📁 app/                               # Next.js App Router (contains all routes)
│   │   ├── 📁 (public)/                      # PUBLIC-FACING PAGES (Customer facing)
│   │   │   ├── 📁 interactive-menu/          # Menu page
│   │   │   ├── 📁 experience-gallery/        # Gallery and content
│   │   │   ├── 📁 venue-booking/             # Event venue booking
│   │   │   ├── 📁 memberships/               # Membership information
│   │   │   ├── 📁 reservations/              # Table reservation system
│   │   │   ├── 📁 dynamic-ordering-menu/     # Dynamic menu with cart
│   │   │   └── 📁 sms-auth-checkout/         # SMS authentication checkout
│   │   │
│   │   ├── 📁 (admin)/                       # ADMIN PAGES (Protected dashboard)
│   │   │   ├── 📁 orders/                    # Order management dashboard
│   │   │   └── 📁 venue-bookings/            # Venue booking management
│   │   │
│   │   ├── 📁 api/                           # API ROUTES (Backend endpoints)
│   │   │   └── 📁 menu/                      # GET /api/menu - Menu data
│   │   │
│   │   ├── layout.js                         # Root layout wrapper (global styles, nav)
│   │   ├── page.js                           # Home page (/)
│   │   ├── page.module.css                   # Home page styles
│   │   ├── globals.css                       # Global CSS (Tailwind, fonts)
│   │   └── favicon.ico                       # Browser tab icon
│   │
│   ├── 📁 components/                        # Reusable React Components
│   │   ├── Navigation.js                     # Top/bottom navigation bar
│   │   └── [Other components...]             # Additional components here
│   │
│   ├── 📁 lib/                               # Utilities & Libraries
│   │   └── db.js                             # MongoDB connection & management
│   │
│   ├── 📁 models/                            # Mongoose Database Schemas
│   │   └── Menu.js                           # Menu item schema
│   │   └── [Other models...]                 # Other database models
│   │
│   ├── 📁 hooks/                             # Custom React Hooks
│   │   └── [Created for future hooks]        # useCart, useAuth, etc.
│   │
│   ├── 📁 utils/                             # Helper Functions
│   │   └── [Utility functions here]          # formatPrice, validateEmail, etc.
│   │
│   └── 📁 constants/                         # App Constants
│       └── [Constants here]                  # API_BASE_URL, ROUTES, etc.
│
├── 📁 public/                                 # Static Files (images, icons)
│   └── [Public assets]                       # Served as-is, never modified
│
├── 📁 docs/                                   # Documentation
│   ├── FOLDER_STRUCTURE.md                   # This file
│   ├── COMPONENTS.md                         # Component documentation
│   ├── API_ROUTES.md                         # API endpoint docs
│   └── ADMIN_GUIDE.md                        # Admin setup & security
│
├── 📁 scripts/                                # Utility Scripts
│   └── convert.js                            # Data conversion utility
│
├── 📁 node_modules/                          # Dependencies (auto-generated)
│   └── [Do not edit]
│
├── 📁 .next/                                  # Next.js build output (auto-generated)
│   └── [Do not edit]
│
├── .gitignore                                # Git ignore rules
├── package.json                              # Project dependencies & scripts
├── package-lock.json                         # Locked dependency versions
├── tailwind.config.ts                        # Tailwind CSS configuration
├── next.config.mjs                           # Next.js configuration
├── postcss.config.mjs                        # PostCSS configuration
├── jsconfig.json                             # JavaScript path aliases
├── eslint.config.mjs                         # ESLint configuration
├── GETTING_STARTED.md                        # Quick start guide
├── README.md                                 # Project overview
└── The_Grove_Quotation.html                  # Reference file
```

---

## Key Folder Purposes

### `src/app/`
**Next.js's special "App Router" folder**. All routes are automatically generated based on folder structure.
- Folders in parentheses like `(public)` and `(admin)` are **route groups** - they don't appear in the URL
- Example: `src/app/(public)/menu/page.js` creates the route `/interactive-menu`

### `src/components/`
**Reusable UI components** used across multiple pages.
- Keep components small and focused
- Examples: Navigation, Card, Modal, Form inputs

### `src/lib/`
**Business logic and external service connections**.
- Database connections
- Authentication helpers
- Third-party API integrations

### `src/models/`
**Mongoose database schemas** (blueprints for data structure).
- Define what data looks like in MongoDB
- Create new model for each data type

### `src/hooks/`
**Custom React hooks** for shared stateful logic.
- Examples: `useCart`, `useAuth`, `useFetch`

### `src/utils/`
**Pure utility functions** with no dependencies.
- Examples: formatPrice(), validateEmail(), parseDate()

### `src/constants/`
**Hardcoded values** used throughout the app.
- API endpoints, magic numbers, route definitions

### `public/`
**Static files served directly** (images, icons, fonts).
- Anything here is never modified by the build process

### `docs/`
**User-friendly documentation** for developers working on the project.

---

## 📋 Current Component Map

| Component | Location | Purpose |
|-----------|----------|---------|
| Navigation | `src/components/Navigation.js` | Top & bottom nav bar |
| AdminOrders | `src/app/(admin)/orders/page.js` | Order management UI |
| Menu API | `src/app/api/menu/route.js` | Fetch menu items from DB |
| MenuSchema | `src/models/Menu.js` | Database blueprint for menu items |

---

## 🚀 Adding New Features

### To Add a New Page:
1. Create: `src/app/(public)/your-page-name/page.js`
2. Add navigation link if needed
3. Create CSS module: `src/app/(public)/your-page-name/page.module.css`

### To Add a New API Endpoint:
1. Create: `src/app/api/your-endpoint/route.js`
2. Export handlers: `export async function GET() {...}`
3. Use `dbConnect()` if database access needed

### To Add a New Database Model:
1. Create: `src/models/YourModel.js`
2. Define Mongoose schema
3. Import and use in API routes

### To Create a Reusable Component:
1. Create: `src/components/YourComponent.js`
2. Keep it pure (no page logic)
3. Import and use in pages/other components

---

## 🗂️ Best Practices

✅ **DO:**
- Keep components small and focused
- Use descriptive folder/file names
- Put shared logic in `lib/` or `hooks/`
- Document complex logic with comments
- Use constants for repeated values

❌ **DON'T:**
- Put business logic in components (move to utils/hooks)
- Create deeply nested folder structures (2-3 levels max)
- Mix different concerns in one file
- Hardcode values (use constants instead)
- Modify auto-generated folders (.next, node_modules)

---

## 📖 Quick Navigation

- 🏠 Home page: `src/app/page.js`
- 🍽️ Menu display: `src/app/(public)/interactive-menu/page.js`
- 📊 Admin orders: `src/app/(admin)/orders/page.js`
- 🔌 Database connection: `src/lib/db.js`
- 🗄️ Menu data model: `src/models/Menu.js`
- 🧭 Navigation UI: `src/components/Navigation.js`

---

## 🆘 Troubleshooting

**Can't find a component?** → Check `src/components/`
**Looking for a page?** → Check folder in `src/app/`
**Need database access?** → See `src/lib/db.js`
**Want to add an endpoint?** → Create folder in `src/app/api/`

For more details, see other documentation files in `docs/` folder.
