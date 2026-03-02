# CarbonTrack - Complete Testing Guide

## 🎯 Quick Start

1. **Start the server:**
   ```bash
   python server.py
   ```

2. **Open the test page:**
   - Navigate to http://localhost:8000/test_pages.html
   - This page has links to test all features

3. **Or go directly to the app:**
   - http://localhost:8000 (Home page)

## 🔧 What Was Fixed

### Critical Issues Resolved

1. **Duplicate HTML Documents** ✅
   - **Problem:** `index.html` contained 6 complete HTML documents concatenated together
   - **Impact:** Browser confusion, rendering issues, navigation problems
   - **Solution:** Cleaned up to single home page document
   - **Result:** Home page now loads correctly with proper animations

2. **Invalid Supabase API Key** ⚠️
   - **Problem:** Key format was `sb_publishable_...` instead of JWT token
   - **Impact:** Database connections would fail
   - **Solution:** Updated to proper JWT format with placeholder
   - **Action Required:** You need to add your actual Supabase anon key

3. **Page Separation** ✅
   - **Problem:** All pages were duplicated in index.html
   - **Impact:** Survey and other pages weren't loading independently
   - **Solution:** Each page now exists only in its proper location
   - **Result:** All navigation works correctly

## 📋 Complete Testing Checklist

### Phase 1: Visual Testing (No Database Required)

- [ ] **Home Page** (http://localhost:8000)
  - [ ] Page loads without errors
  - [ ] Particle animation in background works
  - [ ] Navigation menu is visible
  - [ ] All buttons are clickable
  - [ ] Spline 3D Earth loads (or fallback shows)
  - [ ] Scroll animations trigger on scroll
  - [ ] Footer is visible

- [ ] **Survey Page** (http://localhost:8000/pages/survey.html)
  - [ ] Page loads correctly
  - [ ] Progress bar is visible at top
  - [ ] Sidebar shows 6 steps
  - [ ] Step 1 (Household) is active
  - [ ] Form fields are visible and editable
  - [ ] "Next" button works
  - [ ] Can navigate through all 6 steps
  - [ ] "Back" button appears after step 1
  - [ ] Live preview shows on step 5 (Waste)

- [ ] **Dashboard Page** (http://localhost:8000/pages/dashboard.html)
  - [ ] Page loads correctly
  - [ ] Shows "No Data Yet" message (expected without survey)
  - [ ] "Take Survey Now" button is visible

- [ ] **Comparison Page** (http://localhost:8000/pages/comparison.html)
  - [ ] Page loads correctly
  - [ ] Shows "Not Enough Data" message (expected)

- [ ] **AI Suggestions Page** (http://localhost:8000/pages/suggestions.html)
  - [ ] Page loads correctly
  - [ ] Shows "No Data Found" message (expected)

- [ ] **Impact Page** (http://localhost:8000/pages/impact.html)
  - [ ] Page loads correctly
  - [ ] Shows "Complete a Survey First" message (expected)

### Phase 2: Database Setup

- [ ] **Get Supabase Key**
  1. Go to https://supabase.com/dashboard/project/truoxyqyzuygobiendjy/settings/api
  2. Copy the "anon" public key (starts with `eyJ...`)
  3. Open `js/supabase.js`
  4. Replace `SUPABASE_KEY` value with your actual key
  5. Save the file

- [ ] **Create Database Table**
  1. Go to https://supabase.com/dashboard/project/truoxyqyzuygobiendjy/editor
  2. Click "New Query"
  3. Copy the SQL from `README.md` (the CREATE TABLE section)
  4. Run the query
  5. Verify table `carbon_entries` is created

### Phase 3: Full Functionality Testing (After Database Setup)

- [ ] **Complete Survey Flow**
  1. Go to http://localhost:8000
  2. Click "Start Your Assessment"
  3. Fill out all 6 steps:
     - Step 1: City, People, House Type
     - Step 2: Electricity (bill or units)
     - Step 3: Transportation (km per month)
     - Step 4: Cooking (LPG, PNG, Induction)
     - Step 5: Appliances (AC, washing, laptop, TV, fridge)
     - Step 6: Waste (kg/day, segregation)
  4. Check live preview on step 6
  5. Click "Submit & Calculate"
  6. Wait for success modal
  7. Click "View Dashboard"

- [ ] **Dashboard Verification**
  - [ ] Total CO₂ displays correctly
  - [ ] Grade badge shows (A+, A, B, C, or D)
  - [ ] KPI cards show values
  - [ ] Pie chart renders
  - [ ] Line chart shows (after 2+ surveys)
  - [ ] Bar chart shows "Complete second survey" message
  - [ ] City info displays

- [ ] **Second Survey for Comparison**
  1. Click "New Survey" button
  2. Fill out survey with different values
  3. Submit
  4. Go to Dashboard
  5. Bar chart should now show comparison
  6. Change indicator should appear

- [ ] **Comparison Page**
  - [ ] Shows "Previous vs Current" data
  - [ ] Banner shows improvement or increase
  - [ ] Side-by-side columns display
  - [ ] Category breakdown shows
  - [ ] Chart renders correctly

- [ ] **AI Suggestions Page**
  - [ ] Header shows your footprint
  - [ ] Suggestion cards display
  - [ ] Filter tabs work (All, High, Medium, Low)
  - [ ] Suggestions are relevant to your data

- [ ] **Impact Page**
  - [ ] Hero section shows total CO₂
  - [ ] Equivalents cards display (trees, flights, etc.)
  - [ ] Annual projection shows
  - [ ] Global context cards display
  - [ ] Pledge button works

### Phase 4: Mobile Testing

- [ ] **Responsive Design**
  - [ ] Open in mobile browser or use DevTools mobile view
  - [ ] Navigation hamburger menu works
  - [ ] All pages are readable on mobile
  - [ ] Forms are usable on mobile
  - [ ] Charts render correctly on mobile

## 🐛 Troubleshooting

### Issue: "Failed to load dashboard data"
**Solution:** Check that:
1. Supabase key is correct in `js/supabase.js`
2. Database table is created
3. You've completed at least one survey

### Issue: Survey doesn't submit
**Solution:** Check browser console for errors. Likely causes:
1. Supabase key not updated
2. Database table not created
3. Network connection issue

### Issue: Charts don't render
**Solution:** 
1. Check that Chart.js CDN is loading (check browser console)
2. Ensure you have data (complete a survey first)
3. Try hard refresh (Ctrl+Shift+R)

### Issue: Navigation doesn't work
**Solution:**
1. Check that `js/nav.js` is loading
2. Verify file paths are correct
3. Check browser console for errors

### Issue: Animations don't work
**Solution:**
1. Check that CSS files are loading
2. Verify `js/home.js` is loading on home page
3. Try in a different browser

## 📊 Expected Behavior

### First Survey
- Dashboard shows your data
- No comparison available yet
- Suggestions based on your inputs
- Impact visualization works

### Second Survey
- Comparison page now works
- Dashboard shows trend
- Bar chart compares previous vs current
- Change indicators appear

### Third+ Survey
- Line chart shows trend over time
- More accurate suggestions
- Better comparison data

## 🎨 Features to Verify

### Visual Effects
- [ ] Glassmorphism cards
- [ ] Particle background on home
- [ ] Fade-up animations on scroll
- [ ] Smooth transitions
- [ ] Toast notifications

### Functionality
- [ ] Anonymous device ID (no login)
- [ ] Data persists across sessions
- [ ] Live calculation preview
- [ ] Chart interactions (hover, click)
- [ ] Filter tabs on suggestions

### Data Accuracy
- [ ] CO₂ calculations are reasonable
- [ ] Grade matches per-person CO₂
- [ ] Trees needed calculation
- [ ] Energy kWh calculation
- [ ] Percentage changes are correct

## 🚀 Deployment Testing (Optional)

If deploying to Vercel:

1. **Pre-deployment:**
   - [ ] Supabase key is updated
   - [ ] All files are committed
   - [ ] `vercel.json` is present

2. **Post-deployment:**
   - [ ] All pages load on production URL
   - [ ] Database connections work
   - [ ] No console errors
   - [ ] Mobile works correctly
   - [ ] HTTPS is working

## ✅ Success Criteria

Your app is working correctly if:

1. ✅ All pages load without errors
2. ✅ Survey can be completed and submitted
3. ✅ Dashboard displays data after survey
4. ✅ Comparison works after 2 surveys
5. ✅ AI suggestions are relevant
6. ✅ Impact page shows equivalents
7. ✅ Navigation works on all pages
8. ✅ Mobile responsive design works
9. ✅ No console errors
10. ✅ Data persists across page reloads

## 📞 Support

If you encounter issues:

1. Check browser console for errors (F12)
2. Verify Supabase key is correct
3. Ensure database table exists
4. Try in incognito/private mode
5. Clear browser cache and localStorage
6. Check `FIXES_APPLIED.md` for known issues

## 🎉 You're Done!

Once all tests pass, your CarbonTrack app is fully functional and ready to use!
