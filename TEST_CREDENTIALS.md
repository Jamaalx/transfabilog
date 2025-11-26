# Test Credentials

## Demo Login Credentials

Use these credentials to test the application:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.ro | Demo123! |
| Manager | manager@demo.ro | Demo123! |
| Operator | operator@demo.ro | Demo123! |

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize

### 2. Run Database Schema

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and paste the contents of `database/schema.sql`
3. Run the query

### 3. Create Test Users

1. Go to **Authentication** > **Users** in Supabase Dashboard
2. Click **Add User** > **Create New User**
3. Create each user:

   **Admin User:**
   - Email: `admin@demo.ro`
   - Password: `Demo123!`
   - Auto Confirm User: ✓

   **Manager User:**
   - Email: `manager@demo.ro`
   - Password: `Demo123!`
   - Auto Confirm User: ✓

   **Operator User:**
   - Email: `operator@demo.ro`
   - Password: `Demo123!`
   - Auto Confirm User: ✓

4. After creating each user, copy the **User UID** from the user details

### 4. Update User Metadata

For each user, update their metadata to include company_id and role:

1. Go to **Authentication** > **Users**
2. Click on each user
3. Edit the **raw_user_meta_data** field:

```json
{
  "full_name": "Admin Demo",
  "company_id": "11111111-1111-1111-1111-111111111111",
  "role": "admin"
}
```

Use these values for each role:
- Admin: `"role": "admin"`
- Manager: `"role": "manager"`
- Operator: `"role": "operator"`

### 5. Run Seed Data

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and paste the contents of `database/seed.sql`
3. Update the user profile INSERT statements with actual User UIDs
4. Run the query

### 6. Configure Environment Variables

**Backend** (`backend/.env`):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
PORT=3001
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api/v1
```

### 7. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### 8. Access the Application

Open http://localhost:5173 and login with any of the test credentials above.

## Test Data Included

The seed file creates:
- **1 Company**: Transport Demo SRL
- **5 Trucks**: Various brands (Volvo, Mercedes, MAN, Scania, DAF)
- **5 Trailers**: Different types (prelata, frigorific, cisterna)
- **5 Drivers**: With license and medical expiry dates
- **6 Trips**: 2 active, 1 planned, 3 completed
- **8 Trip Expenses**: Fuel, tolls, parking
- **7 Transactions**: Income and expenses
- **8 Documents**: Some with expiring alerts

## Role Permissions

| Feature | Admin | Manager | Operator | Viewer |
|---------|-------|---------|----------|--------|
| View Dashboard | ✓ | ✓ | ✓ | ✓ |
| Manage Vehicles | ✓ | ✓ | ✓ | - |
| Delete Vehicles | ✓ | - | - | - |
| Manage Drivers | ✓ | ✓ | ✓ | - |
| Manage Trips | ✓ | ✓ | ✓ | - |
| Cancel Trips | ✓ | ✓ | - | - |
| View Finances | ✓ | ✓ | ✓ | ✓ |
| Edit Finances | ✓ | ✓ | - | - |
| Delete Records | ✓ | - | - | - |
