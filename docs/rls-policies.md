# RLS Policy Summary

## Companies

- **Authenticated read/write** (`ALL`) – `true`
- **company can insert self** (`INSERT`) – `(auth.uid() = user_id)`
- **company can read self** (`SELECT`) – `(auth.uid() = user_id)`
- **company can update self** (`UPDATE`) – `(auth.uid() = user_id)`

## Invoices

- **Authenticated read/write** (`ALL`) – `true`
- **store can insert invoices** (`INSERT`) – `(auth.uid() = store_id)`
- **store or talent can view invoices** (`SELECT`) – `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- **store can update invoices** (`UPDATE`) – `(auth.uid() = store_id)`

## Messages

- **Messages: user can view their own messages** (`SELECT`) – `((auth.uid() = sender_id) OR (auth.uid() = receiver_id))`

## Notifications

- **Authenticated read/write** (`ALL`) – `true`
- **only service role can insert notifications** (`INSERT`) – `true`
- **only recipient can view notifications** (`SELECT`) – `(auth.uid() = user_id)`

## Offers

- **Authenticated read/write** (`ALL`) – `true`
- **store can insert offers** (`INSERT`) – `(auth.uid() = store_id)`
- **store can delete their offers** (`DELETE`) – `(auth.uid() = store_id)`
- **store or talent can view their offers** (`SELECT`) – `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- **store can update their offers** (`UPDATE`) – `(auth.uid() = store_id)`

## Payments

- **Authenticated read/write** (`ALL`) – `true`
- **store can insert payments** (`INSERT`) – `(auth.uid() = ( SELECT invoices.store_id    FROM invoices   WHERE (invoices.offer_id = payments.offer_id)))`
- **store can delete their payments** (`DELETE`) – `(auth.uid() = ( SELECT invoices.store_id    FROM invoices   WHERE (invoices.offer_id = payments.offer_id)))`
- **store can view their payments** (`SELECT`) – `(auth.uid() = ( SELECT invoices.store_id    FROM invoices   WHERE (invoices.offer_id = payments.offer_id)))`
- **store can update payments** (`UPDATE`) – `(auth.uid() = ( SELECT invoices.store_id    FROM invoices   WHERE (invoices.offer_id = payments.offer_id)))`

## Reviews

- **Authenticated read/write** (`ALL`) – `true`
- **store can insert reviews for own offer** (`INSERT`) – `((auth.uid() = store_id) AND (offer_id IN ( SELECT offers.id    FROM offers   WHERE (offers.store_id = auth.uid()))))`
- **related users can read reviews** (`SELECT`) – `((auth.uid() = store_id) OR (auth.uid() = talent_id))`

## Schedules

- **Authenticated read/write** (`ALL`) – `true`
- **user can insert own schedules** (`INSERT`) – `(auth.uid() = user_id)`
- **user can read own schedules** (`SELECT`) – `(auth.uid() = user_id)`
- **user can update own schedules** (`UPDATE`) – `(auth.uid() = user_id)`

## Stores

- **Authenticated read/write** (`ALL`) – `true`
- **Allow authenticated insert** (`INSERT`) – `(auth.uid() = user_id)`
- **Allow store owner insert** (`INSERT`) – `(auth.uid() = user_id)`
- **Allow store owner read** (`SELECT`) – `(auth.uid() = user_id)`
- **Allow store owner update** (`UPDATE`) – `(auth.uid() = user_id)`
- **Allow authenticated user to update own store** (`UPDATE`) – `(user_id = auth.uid())`

## Talents

- **Authenticated read/write** (`ALL`) – `true`
- **talent can insert self** (`INSERT`) – `(auth.uid() = user_id)`
- **store can view completed public talents** (`SELECT`) – `(is_profile_complete = true)`
- **talent can read self** (`SELECT`) – `(auth.uid() = user_id)`
- **talent can update self** (`UPDATE`) – `(auth.uid() = user_id)`

## Visits

- **Authenticated read/write** (`ALL`) – `true`
- **related users can view visits** (`SELECT`) – `((auth.uid() = store_id) OR (auth.uid() = talent_id))`
- **store can update visits** (`UPDATE`) – `(auth.uid() = store_id)`

