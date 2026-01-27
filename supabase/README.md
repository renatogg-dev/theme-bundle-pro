# Supabase Setup for Theme Bundle

This folder contains database migrations and configuration for the Theme Bundle backend.

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project credentials:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Service Role Key**: Found in Settings > API > service_role key (keep secret!)

## Setup Steps

### 1. Configure Environment Variables

Create or update `.env.local` in the project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Run Database Migrations

#### Option A: Via Supabase Dashboard (SQL Editor)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New query**
4. Copy and paste the contents of `migrations/001_initial_schema.sql`
5. Click **Run**

#### Option B: Via Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

### 3. Create Storage Bucket

The `downloads` bucket needs to be created for storing theme ZIP files.

#### Via Dashboard:

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name: `downloads`
4. **Uncheck** "Public bucket" (keep it private)
5. Click **Create bucket**

#### Via CLI:

```bash
# Note: May require the bucket to be defined in config
supabase storage create downloads
```

### 4. Verify Setup

Run the following SQL in the SQL Editor to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- `theme_sessions`
- `download_tokens`

## Schema Overview

### `theme_sessions`

Temporary storage for theme configurations during purchase flow.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| theme_config | JSONB | Theme colors and metadata |
| product_type | TEXT | 'single', 'bundle', or 'team' |
| created_at | TIMESTAMPTZ | Creation timestamp |
| expires_at | TIMESTAMPTZ | Expiration time (24h) |

### `download_tokens`

Download access tokens for purchased themes.

| Column | Type | Description |
|--------|------|-------------|
| token | UUID | Primary key (used in download URL) |
| storage_path | TEXT | Path to ZIP in storage |
| purchase_id | TEXT | Gumroad sale ID |
| theme_name | TEXT | Display name of theme |
| created_at | TIMESTAMPTZ | Creation timestamp |
| expires_at | TIMESTAMPTZ | Expiration time (7 days) |

## Maintenance

### Cleanup Expired Data

Call the cleanup function periodically (e.g., via cron or Supabase Edge Function):

```sql
SELECT * FROM cleanup_expired_data();
```

This returns the number of expired sessions and tokens deleted.

### Storage Cleanup

Expired files in storage are not automatically deleted. Consider:
1. Setting up a scheduled Edge Function
2. Using Supabase's storage lifecycle policies (if available)
3. Manual cleanup via dashboard

## Security Notes

- The **service role key** has full access to your database. Never expose it client-side.
- All storage operations use the service role, so files are private by default.
- Download URLs contain a token that expires after 7 days.
- Sessions expire after 24 hours automatically.
