# Admin User Management & Auth Enhancement Plan

## Overview

This plan covers:
1. **User Management Page** – Full CRUD for users in Admin
2. **Admin Auth Flow** – Always require login first, session expiry (2hrs + new day)
3. **Admin Routing** – Redirect `/admin` to login when unauthenticated, then to dashboard/home

---

## Current State

| Item | Current Behavior |
|------|------------------|
| `/admin` | Goes directly to Create Post page (index.js) |
| `/admin/login` | Admin login page |
| `/admin/dashboard` | Posts management dashboard |
| Admin JWT | Expires in 7 days |
| User model | No `lastLogin` field |
| User API | `/api/users/[id]` – GET, PATCH, DELETE (admin uses `decoded.role === 'admin'`) |
| Admin API | Uses `requireAdminAuth` from `lib/adminAuth.js` (verifies Admin model, not User) |

**Important:** Admin and regular users use different models (`Admin` vs `User`). Admin login uses `/api/admin/login` and Admin model. The `/api/users/[id]` DELETE checks `decoded.role === 'admin'` – but admin JWT comes from Admin model with `role: 'admin'`. Need to ensure admin JWT is accepted for user management APIs.

---

## Part 1: Admin Auth & Session Management

### 1.1 Admin Login Gate (Always First)

**Goal:** Any visit to `/admin` or `/admin/*` (except `/admin/login`) must first pass through admin login.

**Approach:**

1. **Create Admin Layout / Auth Guard**
   - Add `pages/admin/_app.js` or a shared `AdminLayout` component that:
     - Checks for valid admin token + expiry
     - Redirects to `/admin/login` if invalid/expired
     - Renders children only when authenticated

2. **Admin Token Storage**
   - Store `adminToken` and `adminTokenExpiry` (timestamp) in `localStorage`
   - On login: `adminTokenExpiry = Date.now() + (2 * 60 * 60 * 1000)` (2 hours)

3. **Session Expiry Rules**
   - **2-hour expiry:** Token considered expired after 2 hours from login
   - **New day:** If current date ≠ login date, require re-login

**Files to modify:**
- `pages/admin/login.js` – Store `adminTokenExpiry` and `adminLoginDate` on successful login
- New: `lib/adminSession.js` – Helper to check if admin session is valid (2hr + same day)
- All admin pages – Use session check before rendering (or via layout)

### 1.2 JWT Expiry vs Client-Side Session

- **Option A:** Keep JWT at 2h in `/api/admin/login` – server enforces expiry
- **Option B:** Keep JWT longer (e.g. 7d) but enforce 2h + new-day on client + optional server check

**Recommendation:** Use **Option A** – set JWT `expiresIn: '2h'` in admin login. Simpler and server-enforced.

For “new day” rule: store `adminLoginDate` (YYYY-MM-DD) in localStorage. On each admin page load, if `today !== adminLoginDate`, clear tokens and redirect to login.

### 1.3 Redirect Flow

| User Action | Result |
|-------------|--------|
| Visit `/admin` (not logged in) | → `/admin/login` |
| Visit `/admin` (logged in, valid session) | → `/admin/dashboard` (or new admin home) |
| Visit `/admin/dashboard`, `/admin/edit/xyz`, etc. (not logged in) | → `/admin/login` |
| Session expired (2h or new day) | → Clear tokens, redirect to `/admin/login` |

**Change:** `/admin` (index.js) should no longer be the Create Post page. Instead:
- **Option 1:** `/admin` redirects to `/admin/dashboard` when logged in
- **Option 2:** `/admin` becomes an admin “home” with links to Dashboard, Create Post, User Management
- **Option 3:** Move Create Post to `/admin/posts/create` and make `/admin` the redirect/dashboard entry

**Suggested structure:**
- `/admin` → Redirect to `/admin/dashboard` when authenticated, else `/admin/login`
- `/admin/dashboard` → Posts list (current dashboard)
- `/admin/posts/create` → Create post (current index.js content)
- `/admin/users` → New User Management page

---

## Part 2: User Management Page (Full CRUD)

### 2.1 User Model Updates

Add fields for login/activity tracking:

```javascript
// models/User.js - add:
lastLoginAt: { type: Date },
loginCount: { type: Number, default: 0 },
```

Update on login:
- `pages/api/auth/login.js` – Set `lastLoginAt`, increment `loginCount`
- `pages/api/auth/register.js` – Set `lastLoginAt` on first login after register (optional)

### 2.2 API Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/admin/users` | List all users (paginated, filterable) | Admin |
| GET | `/api/admin/users/[id]` | Get single user details | Admin |
| POST | `/api/admin/users` | Create user (optional) | Admin |
| PATCH | `/api/admin/users/[id]` | Update user | Admin |
| DELETE | `/api/admin/users/[id]` | Delete (soft: isActive=false) | Admin |

**Note:** `requireAdminAuth` from `lib/adminAuth.js` verifies Admin model. Ensure these routes use it so only admins can access.

### 2.3 Admin Users API Implementation

**`/api/admin/users/index.js` (GET list)**
- Use `requireAdminAuth`
- Query User model with pagination, search, filters
- Return: id, firstName, lastName, email, companyName, location, role, isActive, createdAt, lastLoginAt, loginCount
- Exclude password

**`/api/admin/users/[id].js` (GET, PATCH, DELETE)**
- Use `requireAdminAuth`
- GET: Return full user (no password)
- PATCH: Allow admin to update user fields
- DELETE: Soft delete (isActive = false)

### 2.4 User Management UI

**`pages/admin/users/index.js`** – User list
- Table: Name, Email, Company, Location, Role, Registered, Last Login, Login Count, Status, Actions
- Search, pagination
- Actions: View, Edit, Delete (soft)
- Link from admin nav/sidebar

**`pages/admin/users/[id].js`** – User detail + edit
- View all user fields
- Edit form (firstName, lastName, email, companyName, location, etc.)
- Delete button

---

## Part 3: Admin Navigation & Routing ✅

### 3.1 Admin Layout / Sidebar

Create shared admin layout with:
- **Create Post** → `/admin/posts/create`
- **Manage Posts** → `/admin/dashboard`
- **User Management** → `/admin/users`
- **Logout** → Clear tokens, redirect to `/admin/login`

### 3.2 File Structure After Changes

```
pages/
  admin/
    _app.js              # Optional: Admin layout + auth guard
    index.js             # Redirect: /admin → /admin/login or /admin/dashboard
    login.js             # Admin login (store expiry + login date)
    dashboard.js         # Posts list (unchanged, add nav)
    users/
      index.js           # User list
      [id].js            # User detail + edit
    posts/
      create.js          # Create post (moved from admin/index.js)
    edit/
      [slug].js          # Edit post (unchanged)

pages/api/
  admin/
    login.js             # JWT expiresIn: '2h'
    users/
      index.js           # GET list
      [id].js            # GET, PATCH, DELETE
    posts.js             # Existing
```

---

## Part 4: Implementation Order

### Phase 1: Auth & Session (Priority)
1. Update `/api/admin/login.js` – JWT `expiresIn: '2h'`
2. Update `pages/admin/login.js` – Store `adminTokenExpiry`, `adminLoginDate`
3. Create `lib/adminSession.js` – `isAdminSessionValid()`
4. Create `pages/admin/_app.js` or wrapper – Auth guard for all admin routes except login
5. Update `pages/admin/index.js` – Redirect to login or dashboard (no longer create post)
6. Move create post to `pages/admin/posts/create.js` and add redirect from old `/admin`

### Phase 2: User Management Backend
7. Update `models/User.js` – Add `lastLoginAt`, `loginCount`
8. Update `pages/api/auth/login.js` – Set lastLoginAt, loginCount
9. Create `pages/api/admin/users/index.js` – GET list
10. Create `pages/api/admin/users/[id].js` – GET, PATCH, DELETE (use `requireAdminAuth`)

### Phase 3: User Management UI
11. Create `pages/admin/users/index.js` – User list page
12. Create `pages/admin/users/[id].js` – User detail/edit page
13. Add User Management link to admin nav (dashboard, create post page, etc.)

### Phase 4: Polish
14. Add admin sidebar/nav component for consistent navigation
15. Ensure all admin pages use session check and redirect on expiry
16. Test 2h expiry and new-day re-login

---

## Part 5: Session Check Logic (Pseudocode)

```javascript
// lib/adminSession.js
export function isAdminSessionValid() {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('adminToken');
  const loginDate = localStorage.getItem('adminLoginDate');
  if (!token || !loginDate) return false;

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (today !== loginDate) return false; // New day

  const expiry = parseInt(localStorage.getItem('adminTokenExpiry'), 10);
  if (Date.now() > expiry) return false; // 2h passed

  return true;
}

export function clearAdminSession() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('token');
  localStorage.removeItem('adminTokenExpiry');
  localStorage.removeItem('adminLoginDate');
}
```

---

## Part 6: Admin Login Response Update

```javascript
// pages/admin/login.js - on success:
const expiresAt = Date.now() + (2 * 60 * 60 * 1000); // 2 hours
const loginDate = new Date().toISOString().split('T')[0];
localStorage.setItem('adminToken', response.token);
localStorage.setItem('adminTokenExpiry', expiresAt.toString());
localStorage.setItem('adminLoginDate', loginDate);
```

---

## Summary Checklist

- [x] Admin JWT expires in 2 hours
- [x] Store adminLoginDate for new-day re-login
- [x] Auth guard on all admin routes (except login)
- [x] `/admin` redirects to login or dashboard (not create post)
- [x] Create post moved to `/admin/posts/create`
- [x] User model: lastLoginAt, loginCount
- [x] Login API updates lastLoginAt, loginCount
- [x] `/api/admin/users` – list users
- [x] `/api/admin/users/[id]` – get, update, delete
- [x] `pages/admin/users` – list + detail/edit UI
- [x] Admin nav with Dashboard, Create Post, User Management, Logout
