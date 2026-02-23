-- ============================================================================
-- SANRACHNA.AI DATABASE SCHEMA - PostgreSQL
-- ============================================================================
-- Description: Complete database schema creation script for Sanrachna.AI
-- Database:    PostgreSQL 14+
-- Created:     2024-01-01
-- Updated:     2026-02-23
-- Migrated:    From MySQL 8.0 to PostgreSQL
-- ============================================================================
-- EXECUTION ORDER: Run this script FIRST, then run 02_seed_data_postgres.sql
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 2: DROP EXISTING TABLES (in reverse dependency order)
-- ============================================================================
-- Uncomment these lines if you need to recreate tables from scratch

-- DROP TABLE IF EXISTS "AuditLogs" CASCADE;
-- DROP TABLE IF EXISTS "UserApplications" CASCADE;
-- DROP TABLE IF EXISTS "UserSessions" CASCADE;
-- DROP TABLE IF EXISTS "RefreshTokens" CASCADE;
-- DROP TABLE IF EXISTS "Users" CASCADE;
-- DROP TABLE IF EXISTS "Applications" CASCADE;
-- DROP TABLE IF EXISTS "Roles" CASCADE;
-- DROP TABLE IF EXISTS "__EFMigrationsHistory" CASCADE;

-- ============================================================================
-- SECTION 3: TABLE CREATION (in dependency order)
-- ============================================================================

-- ============================================================================
-- TABLE: __EFMigrationsHistory
-- Description: EF Core migrations tracking table
-- Dependencies: None
-- ============================================================================
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" VARCHAR(150) NOT NULL,
    "ProductVersion" VARCHAR(32) NOT NULL,
    
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

-- ============================================================================
-- TABLE: Roles
-- Description: User roles for access control (admin, user, guest)
-- Dependencies: None (Base table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Roles" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(50) NOT NULL,
    "Description" VARCHAR(255) NULL,
    "IsSystemRole" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "PK_Roles" PRIMARY KEY ("Id"),
    CONSTRAINT "UQ_Roles_Name" UNIQUE ("Name")
);

COMMENT ON TABLE "Roles" IS 'User roles for role-based access control (RBAC)';
COMMENT ON COLUMN "Roles"."Name" IS 'Role name (e.g., Admin, User, Guest)';
COMMENT ON COLUMN "Roles"."Description" IS 'Role description';
COMMENT ON COLUMN "Roles"."IsSystemRole" IS 'Flag for system-protected roles';
COMMENT ON COLUMN "Roles"."CreatedAt" IS 'Record creation timestamp';

-- ============================================================================
-- TABLE: Applications
-- Description: Available applications in the Sanrachna.AI ecosystem
-- Dependencies: None (Base table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Applications" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500) NOT NULL,
    "Url" VARCHAR(500) NOT NULL,
    "Icon" VARCHAR(50) NOT NULL DEFAULT 'apps',
    "IconColor" VARCHAR(50) NOT NULL DEFAULT 'bg-blue-500',
    "Category" VARCHAR(50) NOT NULL DEFAULT 'Other',
    "IsSupported" BOOLEAN NOT NULL DEFAULT TRUE,
    "RequiresAuth" BOOLEAN NOT NULL DEFAULT TRUE,
    "DisplayOrder" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(6) NULL,
    
    CONSTRAINT "PK_Applications" PRIMARY KEY ("Id"),
    CONSTRAINT "UQ_Applications_Name" UNIQUE ("Name")
);

CREATE INDEX IF NOT EXISTS "IX_Applications_Category" ON "Applications" ("Category");
CREATE INDEX IF NOT EXISTS "IX_Applications_DisplayOrder" ON "Applications" ("DisplayOrder");
CREATE INDEX IF NOT EXISTS "IX_Applications_IsActive" ON "Applications" ("IsActive");
CREATE INDEX IF NOT EXISTS "IX_Applications_IsSupported" ON "Applications" ("IsSupported");

COMMENT ON TABLE "Applications" IS 'Available applications in the Sanrachna.AI ecosystem';
COMMENT ON COLUMN "Applications"."Name" IS 'Application name';
COMMENT ON COLUMN "Applications"."Description" IS 'Application description';
COMMENT ON COLUMN "Applications"."Url" IS 'Application URL/endpoint';
COMMENT ON COLUMN "Applications"."Icon" IS 'Icon identifier for UI';
COMMENT ON COLUMN "Applications"."IconColor" IS 'Icon color class';
COMMENT ON COLUMN "Applications"."Category" IS 'Application category';
COMMENT ON COLUMN "Applications"."IsSupported" IS 'Is application currently supported';
COMMENT ON COLUMN "Applications"."RequiresAuth" IS 'Does app require authentication';
COMMENT ON COLUMN "Applications"."DisplayOrder" IS 'Display order in UI';
COMMENT ON COLUMN "Applications"."IsActive" IS 'Is application active';

-- ============================================================================
-- TABLE: Users
-- Description: User accounts with authentication and profile information
-- Dependencies: Roles (RoleId -> Roles.Id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(255) NOT NULL,
    "PasswordHash" VARCHAR(255) NOT NULL,
    "AvatarUrl" VARCHAR(500) NULL,
    "GoogleId" VARCHAR(255) NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "EmailConfirmed" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(6) NULL,
    "LastLoginAt" TIMESTAMP(6) NULL,
    "RoleId" INTEGER NOT NULL DEFAULT 2,
    
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Users_Roles_RoleId" FOREIGN KEY ("RoleId") 
        REFERENCES "Roles" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UQ_Users_Email" UNIQUE ("Email"),
    CONSTRAINT "UQ_Users_GoogleId" UNIQUE ("GoogleId")
);

CREATE INDEX IF NOT EXISTS "IX_Users_RoleId" ON "Users" ("RoleId");
CREATE INDEX IF NOT EXISTS "IX_Users_IsActive" ON "Users" ("IsActive");
CREATE INDEX IF NOT EXISTS "IX_Users_Email_IsActive" ON "Users" ("Email", "IsActive");
CREATE INDEX IF NOT EXISTS "IX_Users_LastLoginAt" ON "Users" ("LastLoginAt" DESC NULLS LAST);

COMMENT ON TABLE "Users" IS 'User accounts with authentication and profile information';
COMMENT ON COLUMN "Users"."Name" IS 'User full name';
COMMENT ON COLUMN "Users"."Email" IS 'User email (unique, used for login)';
COMMENT ON COLUMN "Users"."PasswordHash" IS 'Hashed password';
COMMENT ON COLUMN "Users"."AvatarUrl" IS 'Profile picture URL';
COMMENT ON COLUMN "Users"."GoogleId" IS 'Google OAuth ID for social login';
COMMENT ON COLUMN "Users"."IsActive" IS 'Is account active';
COMMENT ON COLUMN "Users"."EmailConfirmed" IS 'Has email been verified';
COMMENT ON COLUMN "Users"."RoleId" IS 'User role (FK to Roles)';

-- ============================================================================
-- TABLE: RefreshTokens
-- Description: JWT refresh tokens for authentication persistence
-- Dependencies: Users (UserId -> Users.Id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "RefreshTokens" (
    "Id" SERIAL NOT NULL,
    "Token" VARCHAR(500) NOT NULL,
    "ExpiresAt" TIMESTAMP(6) NOT NULL,
    "CreatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "RevokedAt" TIMESTAMP(6) NULL,
    "RevokedByIp" VARCHAR(50) NULL,
    "ReplacedByToken" VARCHAR(500) NULL,
    "CreatedByIp" VARCHAR(50) NOT NULL,
    "UserId" INTEGER NOT NULL,
    
    CONSTRAINT "PK_RefreshTokens" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_RefreshTokens_Users_UserId" FOREIGN KEY ("UserId") 
        REFERENCES "Users" ("Id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_RefreshTokens_Token" ON "RefreshTokens" ("Token");
CREATE INDEX IF NOT EXISTS "IX_RefreshTokens_UserId" ON "RefreshTokens" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_RefreshTokens_ExpiresAt" ON "RefreshTokens" ("ExpiresAt");
CREATE INDEX IF NOT EXISTS "IX_RefreshTokens_UserId_RevokedAt" ON "RefreshTokens" ("UserId", "RevokedAt");

COMMENT ON TABLE "RefreshTokens" IS 'JWT refresh tokens for authentication persistence';
COMMENT ON COLUMN "RefreshTokens"."Token" IS 'The refresh token string';
COMMENT ON COLUMN "RefreshTokens"."ExpiresAt" IS 'Token expiration timestamp';
COMMENT ON COLUMN "RefreshTokens"."RevokedAt" IS 'When token was revoked (null if active)';
COMMENT ON COLUMN "RefreshTokens"."RevokedByIp" IS 'IP address that revoked the token';
COMMENT ON COLUMN "RefreshTokens"."ReplacedByToken" IS 'New token that replaced this one';
COMMENT ON COLUMN "RefreshTokens"."CreatedByIp" IS 'IP address that created the token';
COMMENT ON COLUMN "RefreshTokens"."UserId" IS 'Owner of the token (FK to Users)';

-- ============================================================================
-- TABLE: UserSessions
-- Description: Active user sessions for session management
-- Dependencies: Users (UserId -> Users.Id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "UserSessions" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "SessionToken" VARCHAR(500) NOT NULL,
    "DeviceInfo" VARCHAR(255) NULL,
    "IpAddress" VARCHAR(50) NULL,
    "UserAgent" VARCHAR(500) NULL,
    "CreatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ExpiresAt" TIMESTAMP(6) NOT NULL,
    "LastActivityAt" TIMESTAMP(6) NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT "PK_UserSessions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_UserSessions_Users_UserId" FOREIGN KEY ("UserId") 
        REFERENCES "Users" ("Id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_UserSessions_SessionToken" ON "UserSessions" ("SessionToken");
CREATE INDEX IF NOT EXISTS "IX_UserSessions_UserId" ON "UserSessions" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_UserSessions_IsActive_ExpiresAt" ON "UserSessions" ("IsActive", "ExpiresAt");
CREATE INDEX IF NOT EXISTS "IX_UserSessions_UserId_IsActive" ON "UserSessions" ("UserId", "IsActive");

COMMENT ON TABLE "UserSessions" IS 'Active user sessions for session management';
COMMENT ON COLUMN "UserSessions"."UserId" IS 'Session owner (FK to Users)';
COMMENT ON COLUMN "UserSessions"."SessionToken" IS 'Unique session token';
COMMENT ON COLUMN "UserSessions"."DeviceInfo" IS 'Device information';
COMMENT ON COLUMN "UserSessions"."IpAddress" IS 'Client IP address';
COMMENT ON COLUMN "UserSessions"."UserAgent" IS 'Browser/client user agent';
COMMENT ON COLUMN "UserSessions"."ExpiresAt" IS 'Session expiration timestamp';
COMMENT ON COLUMN "UserSessions"."LastActivityAt" IS 'Last activity timestamp';
COMMENT ON COLUMN "UserSessions"."IsActive" IS 'Is session currently active';

-- ============================================================================
-- TABLE: UserApplications
-- Description: Junction table for user-application access permissions
-- Dependencies: Users, Applications
-- ============================================================================
CREATE TABLE IF NOT EXISTS "UserApplications" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "ApplicationId" INTEGER NOT NULL,
    "GrantedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GrantedByUserId" INTEGER NULL,
    "ExpiresAt" TIMESTAMP(6) NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT "PK_UserApplications" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_UserApplications_Users_UserId" FOREIGN KEY ("UserId") 
        REFERENCES "Users" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FK_UserApplications_Applications_ApplicationId" FOREIGN KEY ("ApplicationId") 
        REFERENCES "Applications" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FK_UserApplications_Users_GrantedByUserId" FOREIGN KEY ("GrantedByUserId") 
        REFERENCES "Users" ("Id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UQ_UserApplications_UserApp" UNIQUE ("UserId", "ApplicationId")
);

CREATE INDEX IF NOT EXISTS "IX_UserApplications_UserId" ON "UserApplications" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_UserApplications_ApplicationId" ON "UserApplications" ("ApplicationId");
CREATE INDEX IF NOT EXISTS "IX_UserApplications_GrantedByUserId" ON "UserApplications" ("GrantedByUserId");
CREATE INDEX IF NOT EXISTS "IX_UserApplications_UserId_IsActive" ON "UserApplications" ("UserId", "IsActive");

COMMENT ON TABLE "UserApplications" IS 'Junction table for user-application access permissions (Many-to-Many)';
COMMENT ON COLUMN "UserApplications"."UserId" IS 'User granted access (FK to Users)';
COMMENT ON COLUMN "UserApplications"."ApplicationId" IS 'Application granted (FK to Applications)';
COMMENT ON COLUMN "UserApplications"."GrantedAt" IS 'When access was granted';
COMMENT ON COLUMN "UserApplications"."GrantedByUserId" IS 'Admin who granted access (FK to Users)';
COMMENT ON COLUMN "UserApplications"."ExpiresAt" IS 'Optional access expiration';
COMMENT ON COLUMN "UserApplications"."IsActive" IS 'Is access currently active';

-- ============================================================================
-- TABLE: AuditLogs
-- Description: System audit trail for tracking user actions
-- Dependencies: Users (UserId -> Users.Id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "AuditLogs" (
    "Id" BIGSERIAL NOT NULL,
    "UserId" INTEGER NULL,
    "Action" VARCHAR(50) NOT NULL,
    "EntityType" VARCHAR(100) NOT NULL,
    "EntityId" INTEGER NULL,
    "OldValues" JSONB NULL,
    "NewValues" JSONB NULL,
    "IpAddress" VARCHAR(50) NULL,
    "UserAgent" VARCHAR(500) NULL,
    "AdditionalInfo" JSONB NULL,
    "Timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "PK_AuditLogs" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_AuditLogs_Users_UserId" FOREIGN KEY ("UserId") 
        REFERENCES "Users" ("Id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_AuditLogs_UserId" ON "AuditLogs" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_AuditLogs_EntityType" ON "AuditLogs" ("EntityType");
CREATE INDEX IF NOT EXISTS "IX_AuditLogs_EntityType_EntityId" ON "AuditLogs" ("EntityType", "EntityId");
CREATE INDEX IF NOT EXISTS "IX_AuditLogs_Action" ON "AuditLogs" ("Action");
CREATE INDEX IF NOT EXISTS "IX_AuditLogs_Timestamp" ON "AuditLogs" ("Timestamp" DESC);
CREATE INDEX IF NOT EXISTS "IX_AuditLogs_Action_Timestamp" ON "AuditLogs" ("Action", "Timestamp" DESC);

COMMENT ON TABLE "AuditLogs" IS 'System audit trail for tracking all user actions';
COMMENT ON COLUMN "AuditLogs"."UserId" IS 'User who performed action (FK to Users)';
COMMENT ON COLUMN "AuditLogs"."Action" IS 'Action type (CREATE, UPDATE, DELETE, LOGIN, etc.)';
COMMENT ON COLUMN "AuditLogs"."EntityType" IS 'Entity type affected (User, Application, etc.)';
COMMENT ON COLUMN "AuditLogs"."EntityId" IS 'ID of affected entity';
COMMENT ON COLUMN "AuditLogs"."OldValues" IS 'Previous values (for UPDATE/DELETE)';
COMMENT ON COLUMN "AuditLogs"."NewValues" IS 'New values (for CREATE/UPDATE)';
COMMENT ON COLUMN "AuditLogs"."IpAddress" IS 'Client IP address';
COMMENT ON COLUMN "AuditLogs"."UserAgent" IS 'Client user agent';
COMMENT ON COLUMN "AuditLogs"."AdditionalInfo" IS 'Any additional context';
COMMENT ON COLUMN "AuditLogs"."Timestamp" IS 'When action occurred';

-- ============================================================================
-- SECTION 4: TRIGGERS FOR UpdatedAt
-- ============================================================================

-- Function to auto-update UpdatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for Applications
DROP TRIGGER IF EXISTS update_applications_updated_at ON "Applications";
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON "Applications"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for Users
DROP TRIGGER IF EXISTS update_users_updated_at ON "Users";
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "Users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
