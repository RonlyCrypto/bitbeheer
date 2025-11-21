# 🚀 Cycle Advisor Testing Guide

## Setup Instructions

### 1. Create Database Tables
Execute the SQL in Supabase SQL Editor:
```bash
# Copy & paste content from: setup-cycle-advisor-table.sql
# Into: Supabase Dashboard → SQL Editor → Run
```

### 2. Start Development Server
```bash
npm run dev
```

---

## Test Cases

### Test 1: User Dashboard Display
**Goal**: Widget appears on Portfolio page when wallet connected

**Steps**:
1. Login to user account
2. Go to Portfolio page (with at least 1 wallet)
3. Look for **Cycle Advisor Widget** below stats cards

**Expected Result**:
- ✅ Widget visible with gradient header
- ✅ Shows current recommendation (green/yellow/red)
- ✅ Displays Cycle 4, current phase
- ✅ Shows price vs previous ATH

**What to Check**:
```
Console (F12):
- No errors loading widget
- "✅ Cycle Advisor data loaded"
- "✅ Advisor recommendation logged"
```

---

### Test 2: Recommendation Logic
**Goal**: Correct recommendation based on price

**Current Market (Nov 2025)**:
- BTC Price: ~$90,000
- Cycle 4 Previous ATH: $69,000
- Status: **ABOVE** previous ATH (+30%)

**Expected Widget**:
- Header: 🟠 **CAUTION** (orange/red)
- Risk Level: **HIGH** or **VERY_HIGH**
- Message: "Voorzichtig - significant boven vorige ATH"

**Test Different Prices**:

| Price | Status | Recommendation |
|-------|--------|-----------------|
| $55,000 | -20% below ATH | 🟢 STRONG BUY |
| $62,000 | -10% below ATH | 🟢 BUY |
| $69,000 | At ATH | 🟡 WAIT |
| $75,000 | +8% above ATH | 🟡 WAIT |
| $90,000 | +30% above ATH | 🟠 CAUTION |

---

### Test 3: Expandable Sections

**Test Recommendation Details**:
1. Click "Waarom Deze Aanbeveling?"
2. Should show:
   - Risk Level badge
   - Current Price
   - Previous ATH

**Test ROI Projections**:
1. Click "ROI Scenario's"
2. Should show 4 scenarios:
   - Terug naar vorige ATH
   - Nieuwe ATH (+50%)
   - Massieve rally (2x)
   - Verdere dip (-10%)
3. Each should have:
   - Target price
   - Projected value
   - ROI percentage
   - Likelihood percentage

**Test Cycle Analysis**:
1. Click "Cycle Analyse"
2. Should show warnings about Cycle 4

---

### Test 4: Admin Panel

**Access Admin Panel**:
1. Login as admin
2. Go to Admin Dashboard
3. Click tab: **🚀 Cycle Advisor**

**Test Overview Tab**:
- ✅ Total users count
- ✅ Cycle Advisor enabled count
- ✅ Mode distribution chart

**Test Users Tab**:
1. Search for user by email
2. Toggle "Enable/Disable" button
   - Should update in real-time
   - Check Supabase: `cycle_advisor_settings.enabled` changes
3. Change mode dropdown
   - Select "Conservative"
   - Check Supabase: mode changes
   - Reload portfolio page
   - Widget should show more conservative recommendation

**Test Settings Tab**:
- ✅ Mode explanations visible
- ✅ Bitcoin cycles data shown

---

### Test 5: Database Logging

**Check Supabase Tables**:

**Table 1: cycle_advisor_settings**
```sql
SELECT * FROM cycle_advisor_settings LIMIT 5;
```
Expected columns:
- `user_id` - User ID
- `enabled` - true/false
- `mode` - 'conservative'/'balanced'/'aggressive'
- `updated_at` - Last change timestamp

**Table 2: cycle_advisor_log**
```sql
SELECT * FROM cycle_advisor_log ORDER BY created_at DESC LIMIT 5;
```
Expected data:
- `user_id` - User ID
- `cycle_number` - 4
- `current_phase` - 'bullRun'
- `price_position_status` - 'above_ath'
- `recommendation_level` - 'caution'
- `roi_projection` - JSON with 4 scenarios

---

### Test 6: Mode Differences

**Setup**: Login user account

**Test Conservative Mode**:
1. Admin: Set mode to "Conservative"
2. Portfolio page: Check recommendation
3. Expected: More cautious (🟡 WAIT instead of 🟢 BUY)

**Test Balanced Mode**:
1. Admin: Set mode to "Balanced"
2. Portfolio page: Check recommendation
3. Expected: Moderate stance

**Test Aggressive Mode**:
1. Admin: Set mode to "Aggressive"
2. Portfolio page: Check recommendation
3. Expected: More optimistic (🟢 BUY at higher prices)

---

### Test 7: Edge Cases

**Test 1: Multiple Wallets**
- Add 2-3 wallets
- Widget should still show (uses highest price)
- ✅ Check no errors in console

**Test 2: No Wallets**
- Widget should NOT appear
- ✅ Verify in Portfolio page

**Test 3: Disabled by Admin**
- Admin: Disable widget for user
- User portfolio page: Widget should disappear
- ✅ Verify instantly

**Test 4: High Price**
- Manually set high price ($150,000+)
- Expected: "Unknown territory" warning
- ✅ Disclaimer visible

---

## Browser Console Logs

**Expected Console Output** (F12 → Console):

```javascript
// When loading portfolio:
✅ Cycle Advisor data loaded
✅ Advisor recommendation logged

// When expanding sections:
// (should be smooth, no errors)

// When saving admin changes:
✅ Cycle advisor enabled/disabled for user@example.com
✅ Mode changed to conservative for user@example.com
```

**Red Flags**:
- ❌ `TypeError: Cannot read property`
- ❌ `Failed to fetch from Supabase`
- ❌ Widget doesn't appear with wallets
- ❌ Admin changes don't update user view

---

## Quick Checklist

- [ ] Database tables created (setup-cycle-advisor-table.sql)
- [ ] Widget appears on portfolio page with wallet
- [ ] Recommendation colors match price position
- [ ] Expandable sections work (click to expand/collapse)
- [ ] ROI scenarios show correct calculations
- [ ] Admin panel loads without errors
- [ ] Toggle enable/disable works in real-time
- [ ] Mode changes update recommendations
- [ ] Supabase tables have data (check settings & log tables)
- [ ] Console has no errors
- [ ] Responsive on mobile (squeeze browser width)
- [ ] Widget disappears when disabled by admin
- [ ] Disclaimer visible when above ATH

---

## Testing Commands

**Check Component Rendering**:
```javascript
// In browser console:
document.querySelector('[data-testid="cycle-advisor-widget"]')?.style
```

**Check Current Price**:
```javascript
// In browser console:
window.currentBTCPrice // Should be ~90000
```

**Force Reload Widget** (if stuck):
```javascript
// In portfolio page console:
window.location.reload()
```

---

## Common Issues & Fixes

### Issue: Widget not appearing
**Fix**:
1. Ensure wallet is connected
2. Check F12 console for errors
3. Verify `currentPrice > 0`
4. Check admin hasn't disabled it

### Issue: Supabase tables not found
**Fix**:
1. Run setup-cycle-advisor-table.sql in Supabase SQL editor
2. Verify tables exist in Supabase dashboard
3. Check RLS policies are enabled

### Issue: Recommendation text not showing
**Fix**:
1. Clear browser cache (Cmd+Shift+Delete)
2. Check for console errors
3. Verify cycleAdvisorService is imported

### Issue: Admin panel shows no users
**Fix**:
1. Check Supabase `users` table has data
2. Verify admin account permissions
3. Check RLS policies allow admin read

---

## Success Criteria ✅

**All Tests Pass When**:
1. ✅ Widget displays on portfolio with correct recommendation
2. ✅ All 4 expandable sections work
3. ✅ Admin can enable/disable users
4. ✅ Mode changes update recommendations
5. ✅ Database tables have data
6. ✅ Console has no critical errors
7. ✅ Mobile responsive
8. ✅ Real-time updates work

---

## Next Steps After Testing

1. **Fix any bugs** found during testing
2. **Optimize performance** if needed
3. **Add notifications** (optional Phase 4)
4. **Deploy to production**
5. **Monitor analytics** in cycle_advisor_log table

---

**Happy Testing! 🚀**

