-- Allow users to mark their own notifications as read
DROP POLICY IF EXISTS notifications_update_self ON notifications;
CREATE POLICY notifications_update_self
ON notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
