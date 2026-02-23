-- ============================================================================
-- SANRACHNA.AI SEED DATA - PostgreSQL
-- ============================================================================
-- Description: Initial seed data for Sanrachna.AI database
-- Database:    PostgreSQL 14+
-- Created:     2024-01-01
-- Updated:     2026-02-23
-- Migrated:    From MySQL 8.0 to PostgreSQL
-- ============================================================================
-- EXECUTION ORDER: Run 01_create_tables_postgres.sql FIRST, then this script
-- ============================================================================

-- ============================================================================
-- SEED: Roles
-- Description: System roles for access control
-- ============================================================================
INSERT INTO "Roles" ("Id", "Name", "Description", "IsSystemRole", "CreatedAt")
VALUES 
    (1, 'admin', 'System Administrator with full access', TRUE, '2024-01-01 00:00:00'),
    (2, 'user', 'Standard user with limited access', TRUE, '2024-01-01 00:00:00'),
    (3, 'guest', 'Guest user with read-only access', TRUE, '2024-01-01 00:00:00')
ON CONFLICT ("Id") DO UPDATE SET
    "Name" = EXCLUDED."Name",
    "Description" = EXCLUDED."Description",
    "IsSystemRole" = EXCLUDED."IsSystemRole";

-- Reset the sequence to continue after our manual IDs
SELECT setval('"Roles_Id_seq"', (SELECT MAX("Id") FROM "Roles"));

-- ============================================================================
-- SEED: Applications
-- Description: Available applications in the system
-- ============================================================================
INSERT INTO "Applications" (
    "Id", 
    "Name", 
    "Description", 
    "Url", 
    "Icon", 
    "IconColor", 
    "Category", 
    "IsSupported", 
    "RequiresAuth", 
    "DisplayOrder", 
    "IsActive", 
    "CreatedAt"
)
VALUES 
    -- Communication Applications
    (1, 'Email', 'Corporate email system', 'http://localhost:4201', 'mail', 'bg-blue-500', 'Communication', TRUE, TRUE, 1, TRUE, '2024-01-01 00:00:00'),
    (2, 'Team Hub', 'Team collaboration', 'http://localhost:4202', 'groups', 'bg-orange-500', 'Communication', TRUE, TRUE, 2, TRUE, '2024-01-01 00:00:00'),
    (3, 'Chat', 'Instant messaging', 'http://localhost:4203', 'chat', 'bg-teal-500', 'Communication', TRUE, TRUE, 3, TRUE, '2024-01-01 00:00:00'),
    
    -- Productivity Applications
    (4, 'Documents', 'Document management', 'http://localhost:4204', 'description', 'bg-green-500', 'Productivity', TRUE, TRUE, 4, TRUE, '2024-01-01 00:00:00'),
    (5, 'Calendar', 'Schedule & meetings', 'http://localhost:4205', 'calendar_today', 'bg-red-500', 'Productivity', TRUE, TRUE, 5, TRUE, '2024-01-01 00:00:00'),
    (6, 'File Storage', 'Cloud storage', 'http://localhost:4206', 'folder_open', 'bg-yellow-500', 'Productivity', TRUE, TRUE, 6, TRUE, '2024-01-01 00:00:00'),
    
    -- Analytics Applications (Not yet supported)
    (7, 'Analytics', 'Business intelligence', 'http://localhost:4207', 'analytics', 'bg-purple-500', 'Analytics', FALSE, TRUE, 7, TRUE, '2024-01-01 00:00:00'),
    
    -- Administration Applications (Not yet supported)
    (8, 'Admin Panel', 'System administration', 'http://localhost:4208', 'admin_panel_settings', 'bg-gray-500', 'Administration', FALSE, TRUE, 8, TRUE, '2024-01-01 00:00:00')
ON CONFLICT ("Id") DO UPDATE SET
    "Name" = EXCLUDED."Name",
    "Description" = EXCLUDED."Description",
    "Url" = EXCLUDED."Url",
    "Icon" = EXCLUDED."Icon",
    "IconColor" = EXCLUDED."IconColor",
    "Category" = EXCLUDED."Category",
    "IsSupported" = EXCLUDED."IsSupported",
    "RequiresAuth" = EXCLUDED."RequiresAuth",
    "DisplayOrder" = EXCLUDED."DisplayOrder",
    "IsActive" = EXCLUDED."IsActive";

-- Reset the sequence to continue after our manual IDs
SELECT setval('"Applications_Id_seq"', (SELECT MAX("Id") FROM "Applications"));

-- ============================================================================
-- SEED: __EFMigrationsHistory (For EF Core compatibility)
-- Description: Mark migrations as applied for EF Core tracking
-- ============================================================================
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES 
    ('20251216211354_InitialCreate', '8.0.0'),
    ('20251218002833_AddGoogleIdToUser', '8.0.0'),
    ('20260223000000_MigrateToPostgreSQL', '8.0.11')
ON CONFLICT ("MigrationId") DO UPDATE SET
    "ProductVersion" = EXCLUDED."ProductVersion";

-- ============================================================================
-- OPTIONAL: Sample Admin User
-- ============================================================================
-- Uncomment below to create a sample admin user
-- Password: Admin@123 (BCrypt hash)
-- 
-- INSERT INTO "Users" ("Name", "Email", "PasswordHash", "IsActive", "EmailConfirmed", "RoleId", "CreatedAt")
-- VALUES (
--     'System Admin',
--     'admin@sanrachna.ai',
--     '$2a$11$K3Z6Q8Q8Q8Q8Q8Q8Q8Q8QeK3Z6Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q',
--     TRUE,
--     TRUE,
--     1,
--     CURRENT_TIMESTAMP
-- )
-- ON CONFLICT ("Email") DO UPDATE SET "Name" = EXCLUDED."Name";

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the data was inserted correctly:
-- 
-- SELECT * FROM "Roles";
-- SELECT * FROM "Applications" ORDER BY "DisplayOrder";
-- SELECT COUNT(*) AS "TotalRoles" FROM "Roles";
-- SELECT COUNT(*) AS "TotalApplications" FROM "Applications";
-- SELECT "Category", COUNT(*) AS "AppCount" FROM "Applications" GROUP BY "Category";
-- ============================================================================

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
