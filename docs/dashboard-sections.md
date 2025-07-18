# Dashboard Sections Overview

This document lists the planned dashboard sections for each role and notes which UI pieces can be shared between Store users and Talent users.

## Common Components

- **DashboardCard** – reusable card container with title, description, icon and CTA.
- **NotificationItem** – single notification display used inside lists.
- **EmptyState** – simple empty state with illustration, description and action button.

## Store Dashboard

Sections displayed:

1. **Offer Stats** – summary of offers received recently.
2. **Next Event** – upcoming confirmed schedule.
3. **Unread Messages** – badge showing unread message count.

These can all be presented using `DashboardCard` with specific content.

## Talent Dashboard

Sections displayed:

1. **Pending Offers** – list of received offers awaiting response.
2. **This Week's Schedule** – upcoming schedule items.
3. **Notifications** – list of notifications using `NotificationItem`.
4. **Profile Progress** – progress bar for profile completion.
5. **Reviews Summary** – recent review statistics.
6. **Payment Status** – latest payment details.

## Shared vs. Role‑Specific Parts

- **Shared**
  - `DashboardCard`, `NotificationItem`, `EmptyState` components
  - Basic layout structure for cards and lists
- **Role Specific**
  - Data fetching logic within pages
  - Certain card variations (e.g. `StoreDashboardCard`, `TalentTaskCard`) that extend `DashboardCard`

The goal is to keep styling and props compatible so each role can reuse these UI pieces while supplying role‑specific data and actions.
