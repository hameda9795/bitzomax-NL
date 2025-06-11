# تست سناریو صفحه‌تازه (Page Refresh)

## گام‌های تست:

### 1. تست محیط development:
```bash
# مرحله 1: رفتن به localhost:4200
# مرحله 2: باز کردن DevTools (F12)
# مرحله 3: لاگین با admin/admin123
# مرحله 4: بررسی localStorage
# مرحله 5: رفرش صفحه (F5)
# مرحله 6: بررسی اینکه آیا لاگین باقی مانده یا نه
```

### 2. Console output مورد انتظار:
```
=== initializeAuthState called ===
Getting initial auth state: {token: true, user: true, hasInitialAuth: true}
✅ User is authenticated, setting loggedIn to true
```

### 3. مشکل احتمالی:
- BehaviorSubject مقدار اولیه false دارد
- حتی اگر localStorage موجود باشد، ممکن است timing issue وجود داشته باشد
- APP_INITIALIZER ممکن است با constructor تداخل داشته باشد

### 4. راه‌حل پیشنهادی:
```typescript
// در constructor، مقدار اولیه را درست تنظیم کن
const initialState = this.getInitialAuthState();
this.loggedIn.next(initialState);
```
