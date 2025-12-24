-- ============================================================================
-- SANRACHNA.AI DATABASE SCHEMA
-- ============================================================================
-- Description: Complete database schema creation script for Sanrachna.AI
-- Database:    MySQL 8.0+
-- Charset:     utf8mb4
-- Created:     2024-01-01
-- Updated:     2025-12-24
-- ============================================================================
-- EXECUTION ORDER: Run this script FIRST, then run 02_seed_data.sql
-- ============================================================================

-- ============================================================================
-- SECTION 1: DATABASE CREATION
-- ============================================================================

-- Drop database if exists (CAUTION: Use only in development!)
-- DROP DATABASE IF EXISTS `sanrachna_ai`;

-- Create the database
CREATE DATABASE IF NOT EXISTS `sanrachna_ai`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Use the database
USE `sanrachna_ai`;

-- ============================================================================
-- SECTION 2: DROP EXISTING TABLES (in reverse dependency order)
-- ============================================================================
-- Uncomment these lines if you need to recreate tables from scratch

-- SET FOREIGN_KEY_CHECKS = 0;
-- DROP TABLE IF EXISTS `AuditLogs`;
-- DROP TABLE IF EXISTS `UserApplications`;
-- DROP TABLE IF EXISTS `UserSessions`;
-- DROP TABLE IF EXISTS `RefreshTokens`;
-- DROP TABLE IF EXISTS `Users`;
-- DROP TABLE IF EXISTS `Applications`;
-- DROP TABLE IF EXISTS `Roles`;
-- DROP TABLE IF EXISTS `__EFMigrationsHistory`;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- SECTION 3: TABLE CREATION (in dependency order)
-- ============================================================================

-- ============================================================================
-- TABLE: Roles
-- Description: User roles for access control (admin, user, guest)
-- Dependencies: None (Base table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `Roles` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(50) NOT NULL COMMENT 'Role name (e.g., Admin, User, Guest)',
    `Description` VARCHAR(255) NULL COMMENT 'Role description',
    `IsSystemRole` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Flag for system-protected roles',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Record creation timestamp',
    
    -- Primary Key
    PRIMARY KEY (`Id`),
    
    -- Unique Constraints
    CONSTRAINT `UQ_Roles_Name` UNIQUE (`Name`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User roles for role-based access control (RBAC)';

-- ============================================================================
-- TABLE: Applications
-- Description: Available applications in the Sanrachna.AI ecosystem
-- Dependencies: None (Base table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `Applications` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL COMMENT 'Application name',
    `Description` VARCHAR(500) NOT NULL COMMENT 'Application description',
    `Url` VARCHAR(500) NOT NULL COMMENT 'Application URL/endpoint',
    `Icon` VARCHAR(50) NOT NULL DEFAULT 'apps' COMMENT 'Icon identifier for UI',
    `IconColor` VARCHAR(50) NOT NULL DEFAULT 'bg-blue-500' COMMENT 'Icon color class',
    `Category` VARCHAR(50) NOT NULL DEFAULT 'Other' COMMENT 'Application category',
    `IsSupported` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Is application currently supported',
    `RequiresAuth` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Does app require authentication',
    `DisplayOrder` INT NOT NULL DEFAULT 0 COMMENT 'Display order in UI',
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Is application active',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Record creation timestamp',
    `UpdatedAt` DATETIME(6) NULL ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Last update timestamp',
    
    -- Primary Key
    PRIMARY KEY (`Id`),
    
    -- Unique Constraints
    CONSTRAINT `UQ_Applications_Name` UNIQUE (`Name`),
    
    -- Indexes for common queries
    INDEX `IX_Applications_Category` (`Category`),
    INDEX `IX_Applications_DisplayOrder` (`DisplayOrder`),
    INDEX `IX_Applications_IsActive` (`IsActive`),
    INDEX `IX_Applications_IsSupported` (`IsSupported`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Available applications in the Sanrachna.AI ecosystem';

-- ============================================================================
-- TABLE: Users
-- Description: User accounts with authentication and profile information
-- Dependencies: Roles (RoleId -> Roles.Id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `Users` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL COMMENT 'User full name',
    `Email` VARCHAR(255) NOT NULL COMMENT 'User email (unique, used for login)',
    `PasswordHash` VARCHAR(255) NOT NULL COMMENT 'Hashed password',
    `AvatarUrl` VARCHAR(500) NULL COMMENT 'Profile picture URL',
    `GoogleId` VARCHAR(255) NULL COMMENT 'Google OAuth ID for social login',
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Is account active',
    `EmailConfirmed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Has email been verified',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Account creation timestamp',
    `UpdatedAt` DATETIME(6) NULL ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Last profile update',
    `LastLoginAt` DATETIME(6) NULL COMMENT 'Last successful login timestamp',
    `RoleId` INT NOT NULL DEFAULT 2 COMMENT 'User role (FK to Roles)',
    
    -- Primary Key
    PRIMARY KEY (`Id`),
    
    -- Foreign Keys
    CONSTRAINT `FK_Users_Roles_RoleId` 
        FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`Id`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    -- Unique Constraints
    CONSTRAINT `UQ_Users_Email` UNIQUE (`Email`),
    CONSTRAINT `UQ_Users_GoogleId` UNIQUE (`GoogleId`),
    
    -- Indexes
    INDEX `IX_Users_RoleId` (`RoleId`),
    INDEX `IX_Users_IsActive` (`IsActive`),
    INDEX `IX_Users_Email_IsActive` (`Email`, `IsActive`),
    INDEX `IX_Users_LastLoginAt` (`LastLoginAt` DESC)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User accounts with authentication and profile information';

-- ============================================================================
-- TABLE: RefreshTokens
-- Description: JWT refresh tokens for authentication persistence
-- Dependencies: Users (UserId -> Users.Id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `RefreshTokens` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `Token` VARCHAR(500) NOT NULL COMMENT 'The refresh token string',
    `ExpiresAt` DATETIME(6) NOT NULL COMMENT 'Token expiration timestamp',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Token creation timestamp',
    `RevokedAt` DATETIME(6) NULL COMMENT 'When token was revoked (null if active)',
    `RevokedByIp` VARCHAR(50) NULL COMMENT 'IP address that revoked the token',
    `ReplacedByToken` VARCHAR(500) NULL COMMENT 'New token that replaced this one',
    `CreatedByIp` VARCHAR(50) NOT NULL COMMENT 'IP address that created the token',
    `UserId` INT NOT NULL COMMENT 'Owner of the token (FK to Users)',
    
    -- Primary Key
    PRIMARY KEY (`Id`),
    
    -- Foreign Keys
    CONSTRAINT `FK_RefreshTokens_Users_UserId` 
        FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes
    INDEX `IX_RefreshTokens_Token` (`Token`(255)),
    INDEX `IX_RefreshTokens_UserId` (`UserId`),
    INDEX `IX_RefreshTokens_ExpiresAt` (`ExpiresAt`),
    INDEX `IX_RefreshTokens_UserId_RevokedAt` (`UserId`, `RevokedAt`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='JWT refresh tokens for authentication persistence';

-- ============================================================================
-- TABLE: UserSessions
-- Description: Active user sessions for session management
-- Dependencies: Users (UserId -> Users.Id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `UserSessions` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `UserId` INT NOT NULL COMMENT 'Session owner (FK to Users)',
    `SessionToken` VARCHAR(500) NOT NULL COMMENT 'Unique session token',
    `DeviceInfo` VARCHAR(255) NULL COMMENT 'Device information',
    `IpAddress` VARCHAR(50) NULL COMMENT 'Client IP address',
    `UserAgent` VARCHAR(500) NULL COMMENT 'Browser/client user agent',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Session start timestamp',
    `ExpiresAt` DATETIME(6) NOT NULL COMMENT 'Session expiration timestamp',
    `LastActivityAt` DATETIME(6) NULL COMMENT 'Last activity timestamp',
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Is session currently active',
    
    -- Primary Key
    PRIMARY KEY (`Id`),
    
    -- Foreign Keys
    CONSTRAINT `FK_UserSessions_Users_UserId` 
        FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes
    INDEX `IX_UserSessions_SessionToken` (`SessionToken`(255)),
    INDEX `IX_UserSessions_UserId` (`UserId`),
    INDEX `IX_UserSessions_IsActive_ExpiresAt` (`IsActive`, `ExpiresAt`),
    INDEX `IX_UserSessions_UserId_IsActive` (`UserId`, `IsActive`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Active user sessions for session management';

-- ============================================================================
-- TABLE: UserApplications
-- Description: Junction table for user-application access permissions
-- Dependencies: 
--   - Users (UserId -> Users.Id)
--   - Applications (ApplicationId -> Applications.Id)
--   - Users (GrantedByUserId -> Users.Id) [Optional - for audit]
-- ============================================================================
CREATE TABLE IF NOT EXISTS `UserApplications` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `UserId` INT NOT NULL COMMENT 'User granted access (FK to Users)',
    `ApplicationId` INT NOT NULL COMMENT 'Application granted (FK to Applications)',
    `GrantedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'When access was granted',
    `GrantedByUserId` INT NULL COMMENT 'Admin who granted access (FK to Users)',
    `ExpiresAt` DATETIME(6) NULL COMMENT 'Optional access expiration',
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Is access currently active',
    
    -- Primary Key
    PRIMARY KEY (`Id`),
    
    -- Foreign Keys
    CONSTRAINT `FK_UserApplications_Users_UserId` 
        FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT `FK_UserApplications_Applications_ApplicationId` 
        FOREIGN KEY (`ApplicationId`) REFERENCES `Applications` (`Id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT `FK_UserApplications_Users_GrantedByUserId` 
        FOREIGN KEY (`GrantedByUserId`) REFERENCES `Users` (`Id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    -- Unique Constraint (one permission per user-app pair)
    CONSTRAINT `UQ_UserApplications_UserApp` UNIQUE (`UserId`, `ApplicationId`),
    
    -- Indexes
    INDEX `IX_UserApplications_UserId` (`UserId`),
    INDEX `IX_UserApplications_ApplicationId` (`ApplicationId`),
    INDEX `IX_UserApplications_GrantedByUserId` (`GrantedByUserId`),
    INDEX `IX_UserApplications_UserId_IsActive` (`UserId`, `IsActive`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Junction table for user-application access permissions (Many-to-Many)';

-- ============================================================================
-- TABLE: AuditLogs
-- Description: System audit trail for tracking user actions
-- Dependencies: Users (UserId -> Users.Id) [Optional - for tracking]
-- ============================================================================
CREATE TABLE IF NOT EXISTS `AuditLogs` (
    `Id` BIGINT NOT NULL AUTO_INCREMENT,
    `UserId` INT NULL COMMENT 'User who performed action (FK to Users)',
    `Action` VARCHAR(50) NOT NULL COMMENT 'Action type (CREATE, UPDATE, DELETE, LOGIN, etc.)',
    `EntityType` VARCHAR(100) NOT NULL COMMENT 'Entity type affected (User, Application, etc.)',
    `EntityId` INT NULL COMMENT 'ID of affected entity',
    `OldValues` JSON NULL COMMENT 'Previous values (for UPDATE/DELETE)',
    `NewValues` JSON NULL COMMENT 'New values (for CREATE/UPDATE)',
    `IpAddress` VARCHAR(50) NULL COMMENT 'Client IP address',
    `UserAgent` VARCHAR(500) NULL COMMENT 'Client user agent',
    `AdditionalInfo` JSON NULL COMMENT 'Any additional context',
    `Timestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'When action occurred',
    
    -- Primary Key
    PRIMARY KEY (`Id`),
    
    -- Foreign Keys
    CONSTRAINT `FK_AuditLogs_Users_UserId` 
        FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    -- Indexes for common queries
    INDEX `IX_AuditLogs_UserId` (`UserId`),
    INDEX `IX_AuditLogs_EntityType` (`EntityType`),
    INDEX `IX_AuditLogs_EntityType_EntityId` (`EntityType`, `EntityId`),
    INDEX `IX_AuditLogs_Action` (`Action`),
    INDEX `IX_AuditLogs_Timestamp` (`Timestamp` DESC),
    INDEX `IX_AuditLogs_Action_Timestamp` (`Action`, `Timestamp` DESC)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='System audit trail for tracking all user actions';

-- ============================================================================
-- TABLE: __EFMigrationsHistory
-- Description: Tracks Entity Framework Core migrations (for .NET compatibility)
-- Dependencies: None
-- ============================================================================
CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` VARCHAR(150) NOT NULL COMMENT 'Unique migration identifier',
    `ProductVersion` VARCHAR(32) NOT NULL COMMENT 'EF Core version used',
    
    -- Primary Key
    PRIMARY KEY (`MigrationId`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Entity Framework Core migration history tracking';

-- ============================================================================
-- SECTION 4: DATABASE RELATIONSHIPS DIAGRAM (for reference)
-- ============================================================================
/*
+------------------+       +------------------+       +------------------+
|      Roles       |       |   Applications   |       |    AuditLogs     |
+------------------+       +------------------+       +------------------+
| PK: Id           |       | PK: Id           |       | PK: Id           |
| Name             |       | Name             |       | FK: UserId ──────┼──┐
| Description      |       | Description      |       | Action           |  │
| IsSystemRole     |       | Url              |       | EntityType       |  │
| CreatedAt        |       | Icon             |       | EntityId         |  │
+--------┬---------+       | IconColor        |       | OldValues        |  │
         │                 | Category         |       | NewValues        |  │
         │                 | IsSupported      |       | IpAddress        |  │
         │                 | RequiresAuth     |       | Timestamp        |  │
         │                 | DisplayOrder     |       +------------------+  │
         │                 | IsActive         |                             │
         │                 | CreatedAt        |                             │
         │                 | UpdatedAt        |                             │
         │                 +--------┬---------+                             │
         │                          │                                       │
         │ 1:N                      │ M:N                                   │
         │                          │                                       │
         ▼                          ▼                                       │
+------------------+       +------------------+                             │
|      Users       |<──────| UserApplications |                             │
+------------------+       +------------------+                             │
| PK: Id           |       | PK: Id           |                             │
| FK: RoleId ──────┼───┐   | FK: UserId ──────┼───────────────────────────>│
| Name             |   │   | FK: ApplicationId|                             │
| Email            |   │   | FK: GrantedByUserId ─────────────────────────>│
| PasswordHash     |   │   | GrantedAt        |                             │
| AvatarUrl        |   │   | ExpiresAt        |                             │
| GoogleId         |   │   | IsActive         |                             │
| IsActive         |   │   +------------------+                             │
| EmailConfirmed   |   │                                                    │
| CreatedAt        |   │                                                    │
| UpdatedAt        |   │                                                    │
| LastLoginAt      |   │                                                    │
+--------┬---------+   │                                                    │
         │             │                                                    │
         │ 1:N         │                                                    │
         ▼             │                                                    │
+------------------+   │   +------------------+                             │
|  RefreshTokens   |   │   |   UserSessions   |                             │
+------------------+   │   +------------------+                             │
| PK: Id           |   │   | PK: Id           |                             │
| FK: UserId ──────┼───┼───| FK: UserId ──────┼─────────────────────────────┘
| Token            |   │   | SessionToken     |
| ExpiresAt        |   │   | DeviceInfo       |
| CreatedAt        |   │   | IpAddress        |
| RevokedAt        |   │   | UserAgent        |
| RevokedByIp      |   │   | CreatedAt        |
| ReplacedByToken  |   │   | ExpiresAt        |
| CreatedByIp      |   │   | LastActivityAt   |
+------------------+   │   | IsActive         |
                       │   +------------------+
                       │
                       └───> References Roles.Id

RELATIONSHIPS SUMMARY:
======================
1. Roles (1) ───────> Users (N)           : One role can have many users
2. Users (1) ───────> RefreshTokens (N)   : One user can have many refresh tokens
3. Users (1) ───────> UserSessions (N)    : One user can have many sessions
4. Users (M) <──────> Applications (N)    : Many-to-Many via UserApplications
5. Users (1) ───────> AuditLogs (N)       : One user can have many audit logs
6. Users (1) ───────> UserApplications.GrantedByUserId (N) : Admin who granted access

*/

-- ============================================================================
-- SECTION 5: VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables were created
SELECT 
    TABLE_NAME,
    TABLE_COMMENT,
    ENGINE,
    TABLE_COLLATION
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'sanrachna_ai'
ORDER BY TABLE_NAME;

-- Verify all foreign key relationships
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'sanrachna_ai' 
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- ============================================================================
-- END OF SCHEMA CREATION
-- ============================================================================
-- Next Step: Run 02_seed_data.sql to populate initial data
-- ============================================================================
