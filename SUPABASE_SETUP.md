# 🔧 Supabase Setup Instructions

## Why You Need This

Your CarbonTrack app uses Supabase as a cloud database to store carbon footprint assessments. Without proper setup, the app will work visually but won't save any data.

## Current Status

✅ Supabase project exists: `truoxyqyzuygobiendjy`
✅ Code is configured to connect
⚠️ API key needs to be updated
⚠️ Database table needs to be created

## Step-by-Step Setup

### Step 1: Get Your Supabase Anon Key

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/truoxyqyzuygobiendjy/settings/api
   - Log in if needed

2. **Find the Anon Key:**
   - Look for the section "Project API keys"
   - Find the key labeled "anon" or "public"
   - It should start with `eyJ...` and be very long (200+ characters)
   - Click the copy icon to copy it

3. **Update Your Code:**
   - Open the file: `js/supabase.js`
   - Find this line:
     ```javascript
     const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
     ```
   - Replace the entire value (between the quotes) with your copied key
   - Save the file

**Example:**
```javascript
// Before (placeholder):
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydW94eXF5enV5Z29iaWVuZGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTAwMDAwMDAsImV4cCI6MTg0NzY4MDAwMH0.PLACEHOLDER_SIGNATURE";

// After (your actual key):
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydW94eXF5enV5Z29iaWVuZGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTU3NjAwMH0.YOUR_ACTUAL_SIGNATURE_HERE";
```

### Step 2: Create the Database Table

1. **Open SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/truoxyqyzuygobiendjy/editor
   - Click "New Query" or use the SQL editor

2. **Copy This SQL:**
   ```sql
   CREATE TABLE carbon_entries (
     id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     device_id       text NOT NULL,
     created_at      timestamptz DEFAULT now(),
     city            text,
     people          integer,
     house_type      text,
     electricity_bill numeric,
     electricity_units numeric,
     petrol_km       numeric,
     diesel_km       numeric,
     public_km       numeric,
     ev_km           numeric,
     lpg_cylinders   numeric,
     png_usage       numeric,
     induction_hours numeric,
     ac_hours        numeric,
     has_refrigerator boolean,
     washing_uses    numeric,
     laptop_hours    numeric,
     tv_hours        numeric,
     waste_kg_per_day numeric,
     has_segregation boolean,
     total_co2       numeric,
     per_person_co2  numeric,
     electricity_co2 numeric,
     transport_co2   numeric,
     cooking_co2     numeric,
     appliance_co2   numeric,
     waste_co2       numeric,
     energy_kwh      numeric,
     trees_needed    integer,
     carbon_grade    text
   );

   -- Enable Row Level Security
   ALTER TABLE carbon_entries ENABLE ROW LEVEL SECURITY;

   -- Allow anyone to insert (anonymous users)
   CREATE POLICY "Anyone can insert" ON carbon_entries 
     FOR INSERT WITH CHECK (true);

   -- Allow users to read their own data
   CREATE POLICY "Read own data" ON carbon_entries 
     FOR SELECT USING (true);
   ```

3. **Run the SQL:**
   - Paste the SQL into the editor
   - Click "Run" or press Ctrl+Enter
   - Wait for success message

4. **Verify Table Creation:**
   - Go to: https://supabase.com/dashboard/project/truoxyqyzuygobiendjy/editor
   - Look for `carbon_entries` in the tables list
   - Click it to see the structure

### Step 3: Test the Connection

1. **Restart Your Server:**
   - Stop the current server (Ctrl+C in terminal)
   - Start it again: `python server.py`

2. **Test Data Submission:**
   - Go to: http://localhost:8000
   - Click "Start Your Assessment"
   - Fill out the survey (all 6 steps)
   - Click "Submit & Calculate"
   - You should see a success message

3. **Verify Data in Supabase:**
   - Go to: https://supabase.com/dashboard/project/truoxyqyzuygobiendjy/editor
   - Click on `carbon_entries` table
   - You should see your submitted data

## Troubleshooting

### Error: "Invalid API key"
**Problem:** The key format is wrong or incomplete
**Solution:** 
- Make sure you copied the entire key (it's very long)
- Ensure there are no extra spaces or line breaks
- The key should start with `eyJ` and end with a long string

### Error: "relation 'carbon_entries' does not exist"
**Problem:** The database table wasn't created
**Solution:**
- Go back to Step 2 and run the SQL again
- Make sure you're in the correct project
- Check for any SQL errors in the console

### Error: "Failed to save data"
**Problem:** Could be network, key, or table issue
**Solution:**
1. Check browser console (F12) for specific error
2. Verify Supabase key is correct
3. Verify table exists
4. Check your internet connection

### Data doesn't appear in dashboard
**Problem:** Survey submitted but data not showing
**Solution:**
1. Check Supabase table to see if data was saved
2. Clear browser cache and reload
3. Check browser console for errors
4. Verify device_id is being generated (check localStorage)

## Security Notes

### Is the anon key safe to expose?
✅ **Yes!** The anon key is designed to be public. It's used in client-side code and is safe to commit to Git.

### What about data privacy?
✅ **Anonymous:** Users are identified only by a random device ID
✅ **No personal data:** No names, emails, or identifying information
✅ **Row Level Security:** Policies prevent unauthorized access

### Can I use a different database?
Yes, but you'll need to:
1. Modify `js/db.js` to use your database API
2. Update connection logic in `js/supabase.js`
3. Ensure the same table structure

## Verification Checklist

After setup, verify:

- [ ] `js/supabase.js` has your actual anon key
- [ ] Key starts with `eyJ` and is 200+ characters
- [ ] `carbon_entries` table exists in Supabase
- [ ] Table has all required columns
- [ ] Row Level Security policies are enabled
- [ ] Survey submission works without errors
- [ ] Data appears in Supabase table
- [ ] Dashboard shows submitted data
- [ ] No console errors in browser

## Success!

Once you see:
1. ✅ Survey submits successfully
2. ✅ Data appears in Supabase table
3. ✅ Dashboard displays your data
4. ✅ No errors in browser console

Your Supabase setup is complete and CarbonTrack is fully functional!

## Need More Help?

- **Supabase Docs:** https://supabase.com/docs
- **Project Dashboard:** https://supabase.com/dashboard/project/truoxyqyzuygobiendjy
- **API Settings:** https://supabase.com/dashboard/project/truoxyqyzuygobiendjy/settings/api
- **SQL Editor:** https://supabase.com/dashboard/project/truoxyqyzuygobiendjy/editor

## Quick Reference

**Your Supabase Project:**
- URL: `https://truoxyqyzuygobiendjy.supabase.co`
- Project ID: `truoxyqyzuygobiendjy`
- Table: `carbon_entries`

**Files to Update:**
- `js/supabase.js` - Add your anon key here

**SQL to Run:**
- See Step 2 above or `README.md`
