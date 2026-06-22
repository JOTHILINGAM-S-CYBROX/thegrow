# API Routes Documentation

## Overview

This document describes all API endpoints available in your application.

---

## GET /api/menu

**Endpoint:** `http://localhost:3000/api/menu`

### Purpose
Retrieves all menu items from the database.

### Method
`GET`

### Response Format

**Success (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Kerala Chicken",
    "description": "Slow-roasted with hand-ground spices, caramelized shallots, and fresh coconut slivers from our grove.",
    "price": 850,
    "category": "Main Course",
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2024-03-01T10:00:00Z",
    "updatedAt": "2024-03-01T10:00:00Z"
  },
  ...
]
```

**Error (500):**
```json
{
  "error": "MongoDB connection failed"
}
```

### Usage Examples

#### JavaScript/Fetch
```javascript
// In a component or page
async function getMenu() {
  try {
    const response = await fetch('/api/menu');
    const menus = await response.json();
    return menus;
  } catch (error) {
    console.error('Failed to fetch menu:', error);
    return [];
  }
}
```

#### Using in Next.js Page
```javascript
// src/app/(public)/interactive-menu/page.js

export default async function MenuPage() {
  const menus = await fetch('http://localhost:3000/api/menu')
    .then(res => res.json())
    .catch(err => {
      console.error(err);
      return [];
    });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {menus.map((item) => (
        <MenuItem key={item._id} {...item} />
      ))}
    </div>
  );
}
```

#### PowerShell Test
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/menu" -UseBasicParsing
$data = $response.Content | ConvertFrom-Json
$data | Format-Table -Property name, price, category
```

### File Location
`src/app/api/menu/route.js`

### Implementation
```javascript
import dbConnect from '@/lib/db';
import Menu from '@/models/Menu';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const menus = await Menu.find({});
    return NextResponse.json(menus);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## Adding New API Routes

### Step 1: Create Route File
```bash
# Create folder for new endpoint
mkdir src/app/api/your-endpoint

# Create route file
# src/app/api/your-endpoint/route.js
```

### Step 2: Implement Handler
```javascript
import dbConnect from '@/lib/db';
import Model from '@/models/Model';
import { NextResponse } from 'next/server';

// GET handler
export async function GET(request) {
  try {
    await dbConnect();
    const data = await Model.find({});
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const result = await Model.create(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

// PUT handler
export async function PUT(request) {
  try {
    await dbConnect();
    const { id, ...data } = await request.json();
    const result = await Model.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

// DELETE handler
export async function DELETE(request) {
  try {
    await dbConnect();
    const { id } = await request.json();
    const result = await Model.findByIdAndDelete(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

---

## HTTP Methods Reference

| Method | Purpose | Response |
|--------|---------|----------|
| GET | Retrieve data | 200 OK |
| POST | Create new data | 201 Created |
| PUT | Update existing data | 200 OK |
| DELETE | Remove data | 200 OK |

---

## Error Handling

Always include try-catch blocks:

```javascript
export async function GET() {
  try {
    // Successful operation
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

### Status Codes
- `200` - OK (successful GET, PUT, DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (auth required)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error (unexpected failure)

---

## Database Connection

All API routes should use the shared connection:

```javascript
import dbConnect from '@/lib/db';

export async function GET() {
  await dbConnect(); // Connect to MongoDB
  // Use models here
}
```

See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for database model documentation.

---

## Testing API Endpoints

### Using JavaScript Console
```javascript
fetch('/api/menu')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Using cURL (PowerShell)
```powershell
curl -Uri "http://localhost:3000/api/menu"
```

### Using Postman
1. Import URL: `http://localhost:3000/api/menu`
2. Select GET method
3. Send request
4. View response

---

## Route Pagination Example

For endpoints returning large datasets:

```javascript
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  await dbConnect();
  const items = await Model.find()
    .skip(skip)
    .limit(limit);
  
  const total = await Model.countDocuments();
  
  return NextResponse.json({
    items,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
}
```

Usage: `GET /api/menu?page=2&limit=20`

---

## Common Patterns

### Filtering
```javascript
const category = searchParams.get('category');
const query = category ? { category } : {};
const items = await Model.find(query);
```

### Sorting
```javascript
const sort = searchParams.get('sort') || '-createdAt';
const items = await Model.find().sort(sort);
```

### Search
```javascript
const search = searchParams.get('search');
const query = search 
  ? { $text: { $search: search } }
  : {};
const items = await Model.find(query);
```

---

## Next Steps

1. Test existing `/api/menu` endpoint
2. Review [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for database schema
3. Add new endpoints following this pattern
4. Secure endpoints with authentication

For more info, see [GETTING_STARTED.md](../GETTING_STARTED.md)
