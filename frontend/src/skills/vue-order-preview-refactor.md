---
category: frontend
tags:
  - vue
  - order-flow
  - cart-refactor
description: >
  Consolidates order creation into a single page, replaces duplicate cart entry,
  adds top-right order preview modal with localStorage persistence, and fixes
  reactive state/import issues.
author: system
date: 2026-04-22
---
# Vue Order Preview & Cart Refactor

## Problem
- Duplicate shopping-cart UI (bottom nav + top-right icon) caused inconsistent field mapping between pages.
- `index.vue` referenced undeclared reactive `orders`, causing runtime ReferenceError.
- Missing `watch` import in `index.vue` triggered "watch is not defined" during setup.
- Top-right cart icon needed replacement with order-preview button showing badge count.

## Solution
### 1) Remove duplicate entry point
- Deleted `src/pages/order/create.vue` and its route.
- This eliminated divergent order-data shape issues and consolidates flow.

### 2) Centralize order handling (GroupBuyingOrder.vue)
- Added explicit pick-up point selection (Toronto/Mississauga/Scarborough).
- Added `selectedPickupPoint`, `pickupTime` reactive state.
- Added computed `pickupAddress` mapping and inline address/time UI.
- Updated `canSubmit` validator to require `pickupTime`.
- Submit payload now includes `pickup_point`, `pickup_address`, `pickup_time`.
- Preserved merchant selection, contact fields, notes, and validation.

### 3) Top navigation order preview (index.vue)
- Replaced `.cart-icon` with `<button class="order-preview-btn">` showing 📋.
- Added `showOrderPreview` reactive and derived `showOrderPreviewModal` computed for two-way binding.
- Created `OrderPreviewModal.vue` component:
  - Modal fade transition.
  - Displays saved orders from localStorage key `userOrders`.
  - Empty state: "Please select products".
  - Each order shows ID, status, items, totals.
  - "View My Orders" button routes to `/my-orders`.
- Added `orders` reactive (`ref([])`) and related computed:
  - `orderCount`
  - `hasOrders`
- Added `watch(orders, ..., { deep: true })` to persist changes to localStorage.
- Added `loadOrders()` on mount and synced back to localStorage.
- Fixed missing `watch` import.

### 4) Fix status class binding (OrderPreview.vue)
- Changed `class="order-status" :class="[order.status.toLowerCase()]"` to `:class="['order-status', order.status.toLowerCase()]"`.

## Validation
- Build succeeds without warnings/errors.
- Runtime ReferenceError resolved by declaring `orders` and importing `watch`.
- Preview modal reads/writes localStorage correctly.
- Form validation and API payload shape consistent with backend expectations.

## Reusable Patterns
- Centralize order creation in one page to avoid schema drift.
- Keep top-level navigation actions semantic and scoped (preview vs cart).
- Always declare reactive state before derived/computed consumers.
- Sync side-effects (localStorage) via `watch` with deep options and lifecycle awareness.
- Use consistent kebab-case payload keys (`pickup_point`, `pickup_address`, `pickup_time`).