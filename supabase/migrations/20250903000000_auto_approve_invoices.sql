-- Convert existing submitted invoices to approved
update invoices set status = 'approved' where status = 'submitted';
