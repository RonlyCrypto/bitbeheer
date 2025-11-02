# Console Logs Removal Guide

## Status
✅ Logger utility created (`src/utils/logger.ts`)
✅ SupabaseAuthContext cleaned
✅ PermissionsContext cleaned

## Remaining Work

To fully remove console logs from production:

1. **Replace all `console.log` with `logger.log`** (only logs in development)
2. **Remove debug console statements** that are not needed
3. **Keep only essential error logging** using `logger.error`

### Files with most console statements:
- `src/services/bitcoinDataManager.ts` (67 logs)
- `src/services/dataManager.ts` (35 logs)  
- `src/components/BitcoinHistory.tsx` (50 logs)
- `src/components/PriceChart.tsx` (37 logs)
- `src/components/DCASimulator.tsx` (15 logs)
- `src/components/AdminAppointmentManagement.tsx` (49 logs)
- `src/components/AccountBeheer.tsx` (24 logs)
- `src/components/AppointmentBookingPopup.tsx` (28 logs)
- `src/utils/emailUtils.ts` (13 logs)
- `src/utils/impersonation.ts` (6 logs)

### Quick Fix Command (run in project root):
```bash
# Find all console.log statements
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\.log" | wc -l

# To replace (be careful, test first):
# sed -i '' "s/console\.log(/logger.log(/g" src/**/*.{ts,tsx}
# sed -i '' "s/console\.warn(/logger.warn(/g" src/**/*.{ts,tsx}
# sed -i '' "s/console\.debug(/logger.debug(/g" src/**/*.{ts,tsx}
# Keep console.error as logger.error (errors should still log)
```

## Security Best Practices
- ✅ No sensitive data in logs
- ✅ No API keys or tokens
- ✅ Minimal production logging
- ✅ Errors only logged when necessary

## Import Logger
```typescript
import logger from '../utils/logger';
// or
import { logger } from '../utils/logger';
```

