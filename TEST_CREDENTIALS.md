# Test Credentials

## Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.ro | Demo123! |
| Manager | manager@demo.ro | Demo123! |
| Operator | operator@demo.ro | Demo123! |
| Viewer | viewer@demo.ro | Demo123! |

## Reference UUIDs

All test data is linked to these UUIDs:

| Entity | UUID |
|--------|------|
| **Company** | `11111111-1111-1111-1111-111111111111` |
| Admin User | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` |
| Manager User | `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` |
| Operator User | `cccccccc-cccc-cccc-cccc-cccccccccccc` |
| Viewer User | `dddddddd-dddd-dddd-dddd-dddddddddddd` |

## Quick Setup (3 Steps)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for initialization
3. Copy your project URL and keys from Settings > API

### 2. Run SQL Scripts (in order!)

Go to **SQL Editor** in Supabase Dashboard and run these scripts in order:

```
1. database/schema.sql        -- Creates all tables
2. database/create_test_users.sql  -- Creates users linked to company
3. database/seed.sql          -- Populates test data
```

### 3. Configure & Run

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
PORT=3001
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api/v1
```

Then run:
```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
```

Open http://localhost:5173 and login!

---

## How User-Company Linking Works

Each user has their `company_id` stored in two places:

1. **auth.users.raw_user_meta_data** - JWT token includes this
   ```json
   {
     "full_name": "Admin Demo",
     "company_id": "11111111-1111-1111-1111-111111111111",
     "role": "admin"
   }
   ```

2. **user_profiles table** - Links auth user to company
   ```sql
   user_profiles.id = auth.users.id
   user_profiles.company_id = companies.id
   ```

When a user logs in:
- The JWT token contains their `company_id` and `role`
- Backend middleware extracts this from the token
- All database queries filter by `company_id`
- RLS policies also enforce this at database level

---

## Test Data Included

| Entity | Count | Details |
|--------|-------|---------|
| Company | 1 | Transport Demo SRL |
| Users | 4 | Admin, Manager, Operator, Viewer |
| Trucks | 5 | Volvo, Mercedes, MAN, Scania, DAF |
| Trailers | 5 | Prelata, Frigorific, Cisterna |
| Drivers | 5 | With license/medical expiry dates |
| Trips | 6 | 2 active, 1 planned, 3 completed |
| Expenses | 8 | Fuel, tolls, parking |
| Transactions | 7 | Income and expenses |
| Documents | 8 | Some with expiry alerts |

---

## Role Permissions

| Feature | Admin | Manager | Operator | Viewer |
|---------|:-----:|:-------:|:--------:|:------:|
| View Dashboard | ✓ | ✓ | ✓ | ✓ |
| View Vehicles | ✓ | ✓ | ✓ | ✓ |
| Add/Edit Vehicles | ✓ | ✓ | ✓ | - |
| Delete Vehicles | ✓ | - | - | - |
| View Drivers | ✓ | ✓ | ✓ | ✓ |
| Add/Edit Drivers | ✓ | ✓ | ✓ | - |
| Delete Drivers | ✓ | - | - | - |
| View Trips | ✓ | ✓ | ✓ | ✓ |
| Create Trips | ✓ | ✓ | ✓ | - |
| Cancel Trips | ✓ | ✓ | - | - |
| View Finances | ✓ | ✓ | ✓ | ✓ |
| Edit Finances | ✓ | ✓ | - | - |
| Delete Transactions | ✓ | - | - | - |

---

## Troubleshooting

### "Invalid login credentials"
- Make sure you ran `create_test_users.sql` in Supabase SQL Editor
- Check that the script completed without errors

### "No data showing after login"
- Verify the user's `company_id` matches the test company UUID
- Run verification query:
  ```sql
  SELECT email, raw_user_meta_data->>'company_id' as company_id
  FROM auth.users WHERE email LIKE '%@demo.ro';
  ```

### "Permission denied" errors
- Check RLS policies are enabled
- Verify `user_profiles` table has the user linked to company
- Run:
  ```sql
  SELECT * FROM user_profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@demo.ro'
  );
  ```
