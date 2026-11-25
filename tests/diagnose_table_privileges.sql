-- READ-ONLY: reports the permissions currently effective for API roles.
-- No user data is selected and no schema is modified.
WITH protected_tables(name) AS (
  VALUES ('user_profiles'),('app_config'),('inventory_events'),
   ('catalogue_events'),('legacy_import_metadata'),('legacy_inventory_raw'),
   ('legacy_catalogue_raw'),('legacy_import_raw'),('legacy_invoice_stage_raw'),
   ('legacy_user_labels'),('administration_events')
), roles(name) AS (VALUES ('anon'),('authenticated')),
operations(name) AS (
 VALUES ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')
)
SELECT r.name AS role_name, 'public.'||t.name AS table_name,
       op.name AS privilege, 
       has_table_privilege(r.name, 'public.'||t.name, op.name) AS effective_grant,
       (r.name='authenticated' AND t.name IN ('user_profiles','app_config') AND op.name='SELECT') AS expected_grant
FROM protected_tables t CROSS JOIN roles r CROSS JOIN operations op
WHERE has_table_privilege(r.name,'public.'||t.name,op.name) IS DISTINCT FROM
     (r.name='authenticated' AND t.name IN ('user_profiles','app_config') AND op.name='SELECT')
ORDER BY role_name,table_name,privilege;
-- Expected result after patch: 0 rows.
