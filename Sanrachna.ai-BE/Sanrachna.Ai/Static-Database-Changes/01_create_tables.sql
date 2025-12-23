-- ============================================================================
-- SANRACHNA.AI DATABASE SCHEMA
-- ============================================================================
-- Description: Complete database schema creation script for Sanrachna.AI
-- Database:    MySQL 8.0+
-- Charset:     utf8mb4
-- Created:     2024-01-01
-- Updated:     2025-12-21
-- ============================================================================
-- EXECUTION ORDER: Run this script FIRST, then run 02_seed_data.sql
-- ============================================================================

-- Set database character set
ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: Roles
-- Description: User roles for access control (admin, user, guest)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `Roles` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(50) NOT NULL,
    `Description` VARCHAR(255) NULL,
    `IsSystemRole` TINYINT(1) NOT NULL DEFAULT 0,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT (UTC_TIMESTAMP()),
    
    PRIMARY KEY (`Id`),
    CONSTRAINT `UQ_Roles_Name` UNIQUE (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: Applications
-- Description: Available applications in the system
-- ============================================================================
CREATE TABLE IF NOT EXISTS `Applications` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL,
    `Description` VARCHAR(500) NOT NULL,
    `Url` VARCHAR(500) NOT NULL,
    `Icon` VARCHAR(50) NOT NULL DEFAULT 'apps',
    `IconColor` VARCHAR(50) NOT NULL DEFAULT 'bg-blue-500',
    `Category` VARCHAR(50) NOT NULL DEFAULT 'Other',
    `IsSupported` TINYINT(1) NOT NULL DEFAULT 1,
    `RequiresAuth` TINYINT(1) NOT NULL DEFAULT 1,
    `DisplayOrder` INT NOT NULL DEFAULT 0,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT (UTC_TIMESTAMP()),
    `UpdatedAt` DATETIME(6) NULL,
    
    PRIMARY KEY (`Id`),
    CONSTRAINT `UQ_Applications_Name` UNIQUE (`Name`),
    INDEX `IX_Applications_Category` (`Category`),
    INDEX `IX_Applications_DisplayOrder` (`DisplayOrder`),
    INDEX `IX_Applications_IsActive` (`IsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: Users
-- Description: User accounts with authentication and profile information
-- ============================================================================
CREATE TABLE IF NOT EXISTS `Users` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(100) NOT NULL,
    `Email` VARCHAR(255) NOT NULL,
    `PasswordHash` VARCHAR(255) NOT NULL,
    `AvatarUrl` VARCHAR(500) NULL,
    `GoogleId` LONGTEXT NULL,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    `EmailConfirmed` TINYINT(1) NOT NULL DEFAULT 0,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT (UTC_TIMESTAMP()),
    `UpdatedAt` DATETIME(6) NULL,
    `LastLoginAt` DATETIME(6) NULL,
    `RoleId` INT NOT NULL DEFAULT 2,
    
    PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Users_Roles_RoleId` FOREIGN KEY (`RoleId`) 
        REFERENCES `Roles` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `IX_Users_Email` UNIQUE (`Email`),
    INDEX `IX_Users_RoleId` (`RoleId`),
    INDEX `IX_Users_IsActive` (`IsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: RefreshTokens
-- Description: JWT refresh tokens for authentication persistence
-- ============================================================================
CREATE TABLE IF NOT EXISTS `RefreshTokens` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `Token` VARCHAR(500) NOT NULL,
    `ExpiresAt` DATETIME(6) NOT NULL,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT (UTC_TIMESTAMP()),
    `RevokedAt` DATETIME(6) NULL,
    `RevokedByIp` VARCHAR(50) NULL,
    `ReplacedByToken` VARCHAR(500) NULL,
    `CreatedByIp` VARCHAR(50) NOT NULL,
    `UserId` INT NOT NULL,
    
    PRIMARY KEY (`Id`),
    CONSTRAINT `FK_RefreshTokens_Users_UserId` FOREIGN KEY (`UserId`) 
        REFERENCES `Users` (`Id`) ON DELETE CASCADE,
    INDEX `IX_RefreshTokens_Token` (`Token`(255)),
    INDEX `IX_RefreshTokens_ExpiresAt` (`ExpiresAt`),
    INDEX `IX_RefreshTokens_UserId` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: UserSessions
-- Description: Active user sessions for session management
-- ============================================================================
CREATE TABLE IF NOT EXISTS `UserSessions` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `UserId` INT NOT NULL,
    `SessionToken` VARCHAR(500) NOT NULL,
    `DeviceInfo` VARCHAR(255) NULL,
    `IpAddress` VARCHAR(50) NULL,
    `UserAgent` VARCHAR(500) NULL,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT (UTC_TIMESTAMP()),
    `ExpiresAt` DATETIME(6) NOT NULL,
    `LastActivityAt` DATETIME(6) NULL,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    
    PRIMARY KEY (`Id`),
    CONSTRAINT `FK_UserSessions_Users_UserId` FOREIGN KEY (`UserId`) 
        REFERENCES `Users` (`Id`) ON DELETE CASCADE,
    INDEX `IX_UserSessions_SessionToken` (`SessionToken`(255)),
    INDEX `IX_UserSessions_UserId` (`UserId`),
    INDEX `IX_UserSessions_IsActive` (`IsActive`, `ExpiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: UserApplications
-- Description: Junction table for user-application access permissions
-- ============================================================================
CREATE TABLE IF NOT EXISTS `UserApplications` (
    `Id` INT NOT NULL AUTO_INCREMENT,
    `UserId` INT NOT NULL,
    `ApplicationId` INT NOT NULL,
    `GrantedAt` DATETIME(6) NOT NULL DEFAULT (UTC_TIMESTAMP()),
    `GrantedByUserId` INT NULL,
    
    PRIMARY KEY (`Id`),
    CONSTRAINT `FK_UserApplications_Users_UserId` FOREIGN KEY (`UserId`) 
        REFERENCES `Users` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_UserApplications_Applications_ApplicationId` FOREIGN KEY (`ApplicationId`) 
        REFERENCES `Applications` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_UserApplications_Users_GrantedByUserId` FOREIGN KEY (`GrantedByUserId`) 
        REFERENCES `Users` (`Id`) ON DELETE SET NULL,
    CONSTRAINT `UQ_UserApplications_UserApp` UNIQUE (`UserId`, `ApplicationId`),
    INDEX `IX_UserApplications_UserId` (`UserId`),
    INDEX `IX_UserApplications_ApplicationId` (`ApplicationId`),
    INDEX `IX_UserApplications_GrantedByUserId` (`GrantedByUserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: AuditLogs
-- Description: System audit trail for tracking user actions
-- ============================================================================
CREATE TABLE IF NOT EXISTS `AuditLogs` (
    `Id` BIGINT NOT NULL AUTO_INCREMENT,
    `UserId` INT NULL,
    `Action` VARCHAR(50) NOT NULL,
    `EntityType` VARCHAR(100) NOT NULL,
    `EntityId` INT NULL,
    `OldValues` LONGTEXT NULL,
    `NewValues` LONGTEXT NULL,
    `IpAddress` VARCHAR(50) NULL,
    `UserAgent` VARCHAR(500) NULL,
    `Timestamp` DATETIME(6) NOT NULL DEFAULT (UTC_TIMESTAMP()),
    
    PRIMARY KEY (`Id`),
    CONSTRAINT `FK_AuditLogs_Users_UserId` FOREIGN KEY (`UserId`) 
        REFERENCES `Users` (`Id`) ON DELETE SET NULL,
    INDEX `IX_AuditLogs_UserId` (`UserId`),
    INDEX `IX_AuditLogs_EntityType` (`EntityType`),
    INDEX `IX_AuditLogs_Action` (`Action`, `Timestamp` DESC),
    INDEX `IX_AuditLogs_Timestamp` (`Timestamp` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: __EFMigrationsHistory (Optional - for EF Core compatibility)
-- Description: Tracks Entity Framework migrations applied to the database
-- ============================================================================
CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` VARCHAR(150) NOT NULL,
    `ProductVersion` VARCHAR(32) NOT NULL,
    
    PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- END OF SCHEMA CREATION
-- ============================================================================
