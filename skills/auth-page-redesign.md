---
title: Auth Page Redesign - SunnyNow
category: frontend
---

## Auth Page Redesign - SunnyNow

### Objective
Redesign the login/authentication page for the SunnyNow e-commerce application to simplify user flow:
- Remove country code prefix (+1) for Canadian mobile numbers
- Add nickname/username field alongside phone number
- Unified single-step form submission

### Implementation Details

#### Component: Auth.vue
- **File**: `frontend/src/pages/Auth.vue`
- **Framework**: Vue 3 with script setup

#### Form Structure
```
1. 📱 手机号 (Phone Number)
   - Input: tel type, maxlength=10
   - Placeholder: "请输入加拿大手机号"

2. 用户昵称 (Nickname)
   - Input: text type, maxlength=20
   - Placeholder: "群昵称注册"
   - Required field

3. 提交按钮 (Submit Button)
   - Disabled when: phone.length !== 10 OR nickname.trim() is empty
   - Enabled state: Proceed to logic check
```

#### Business Logic
- **Old User Detection**: Check localStorage for existing phone number (`+1{phone}`)
- **Old User Flow**: `localStorage.setItem("currentUser", ...)` → `router.push("/products")`
- **New User Flow**: `router.push({ path: "/register", query: { phone, nickname } })`

#### Key Features
- Real-time form validation
- LocalStorage persistence for user sessions
- Router-based navigation with query parameters
- Responsive mobile-first design (iPhone frame)

### Notes
- Removed country code prefix to simplify Canadian mobile input
- Nickname required for both new and returning users
- Form disabled until both fields are valid
- Uses existing localStorage user management system