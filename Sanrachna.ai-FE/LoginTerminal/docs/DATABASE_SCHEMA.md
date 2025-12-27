# LoginTerminal - Database Schema Design

## Overview

This document provides the complete SQL Server database schema for the LoginTerminal centralized SSO system.

---

## 1. Database Diagram

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│      Roles       │     │      Users       │     │   Applications   │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ Id (PK)          │◄────│ RoleId (FK)      │     │ Id (PK)          │
│ Name             │     │ Id (PK)          │     │ Name             │
│ Description      │     │ Name             │     │ Description      │
│ IsSystemRole     │     │ Email            │     │ Url              │
│ CreatedAt        │     │ PasswordHash     │     │ Icon             │
└──────────────────┘     │ AvatarUrl        │     │ IconColor        │
                         │ IsActive         │     │ Category         │
                         │ EmailConfirmed   │     │ IsSupported      │
                         │ CreatedAt        │     │ RequiresAuth     │
                         │ UpdatedAt        │     │ DisplayOrder     │
                         │ LastLoginAt      │     │ IsActive         │
                         └────────┬─────────┘     │ CreatedAt        │
                                  │               │ UpdatedAt        │
                                  │               └────────┬─────────┘
                                  │                        │
                         ┌────────▼────────────────────────▼─────────┐
                         │           UserApplications                │
                         ├───────────────────────────────────────────┤
                         │ Id (PK)                                   │
                         │ UserId (FK) ──────────────────────────────┤
                         │ ApplicationId (FK) ───────────────────────┤
                         │ GrantedAt                                 │
                         │ GrantedByUserId (FK)                      │
                         └───────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  RefreshTokens   │     │   UserSessions   │     │    AuditLogs     │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ Id (PK)          │     │ Id (PK)          │     │ Id (PK)          │
│ UserId (FK)──────│     │ UserId (FK)──────│     │ UserId (FK)──────│
│ Token            │     │ SessionToken     │     │ Action           │
│ ExpiresAt        │     │ DeviceInfo       │     │ EntityType       │
│ CreatedAt        │     │ IpAddress        │     │ EntityId         │
│ RevokedAt        │     │ UserAgent        │     │ OldValues        │
│ RevokedByIp      │     │ CreatedAt        │     │ NewValues        │
│ ReplacedByToken  │     │ ExpiresAt        │     │ IpAddress        │
│ CreatedByIp      │     │ LastActivityAt   │     │ UserAgent        │
└──────────────────┘     │ IsActive         │     │ Timestamp        │
                         └──────────────────┘     └──────────────────┘
```

---

## 2. Table Definitions

### 2.1 Roles Table

```sql
CREATE TABLE [dbo].[Roles] (
    [Id]            INT             IDENTITY(1,1) NOT NULL,
    [Name]          NVARCHAR(50)    NOT NULL,
    [Description]   NVARCHAR(255)   NULL,
    [IsSystemRole]  BIT             NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2(7)    NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_Roles_Name] UNIQUE ([Name])
);

-- Seed default roles
INSERT INTO [dbo].[Roles] ([Name], [Description], [IsSystemRole])
VALUES 
    ('admin', 'System Administrator with full access', 1),
    ('user', 'Standard user with limited access', 1),
    ('guest', 'Guest user with read-only access', 1);
```

### 2.2 Users Table

```sql
CREATE TABLE [dbo].[Users] (
    [Id]                INT             IDENTITY(1,1) NOT NULL,
    [Name]              NVARCHAR(100)   NOT NULL,
    [Email]             NVARCHAR(255)   NOT NULL,
    [PasswordHash]      NVARCHAR(255)   NOT NULL,
    [AvatarUrl]         NVARCHAR(500)   NULL,
    [IsActive]          BIT             NOT NULL DEFAULT 1,
    [EmailConfirmed]    BIT             NOT NULL DEFAULT 0,
    [RoleId]            INT             NOT NULL DEFAULT 2, -- Default to 'user' role
    [CreatedAt]         DATETIME2(7)    NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]         DATETIME2(7)    NULL,
    [LastLoginAt]       DATETIME2(7)    NULL,
    
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_Users_Email] UNIQUE ([Email]),
    CONSTRAINT [FK_Users_Roles] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles]([Id])
);

-- Indexes
CREATE NONCLUSTERED INDEX [IX_Users_Email] ON [dbo].[Users] ([Email]);
CREATE NONCLUSTERED INDEX [IX_Users_RoleId] ON [dbo].[Users] ([RoleId]);
CREATE NONCLUSTERED INDEX [IX_Users_IsActive] ON [dbo].[Users] ([IsActive]) WHERE [IsActive] = 1;
```

### 2.3 Applications Table

```sql
CREATE TABLE [dbo].[Applications] (
    [Id]            INT             IDENTITY(1,1) NOT NULL,
    [Name]          NVARCHAR(100)   NOT NULL,
    [Description]   NVARCHAR(500)   NOT NULL,
    [Url]           NVARCHAR(500)   NOT NULL,
    [Icon]          NVARCHAR(50)    NOT NULL DEFAULT 'apps',
    [IconColor]     NVARCHAR(50)    NOT NULL DEFAULT 'bg-blue-500',
    [Category]      NVARCHAR(50)    NOT NULL DEFAULT 'Other',
    [IsSupported]   BIT             NOT NULL DEFAULT 1,
    [RequiresAuth]  BIT             NOT NULL DEFAULT 1,
    [DisplayOrder]  INT             NOT NULL DEFAULT 0,
    [IsActive]      BIT             NOT NULL DEFAULT 1,
    [CreatedAt]     DATETIME2(7)    NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]     DATETIME2(7)    NULL,
    
    CONSTRAINT [PK_Applications] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_Applications_Name] UNIQUE ([Name])
);

-- Indexes
CREATE NONCLUSTERED INDEX [IX_Applications_Category] ON [dbo].[Applications] ([Category]);
CREATE NONCLUSTERED INDEX [IX_Applications_IsActive] ON [dbo].[Applications] ([IsActive]) WHERE [IsActive] = 1;
CREATE NONCLUSTERED INDEX [IX_Applications_DisplayOrder] ON [dbo].[Applications] ([DisplayOrder]);
```

### 2.4 UserApplications Table (Junction)

```sql
CREATE TABLE [dbo].[UserApplications] (
    [Id]                INT             IDENTITY(1,1) NOT NULL,
    [UserId]            INT             NOT NULL,
    [ApplicationId]     INT             NOT NULL,
    [GrantedAt]         DATETIME2(7)    NOT NULL DEFAULT GETUTCDATE(),
    [GrantedByUserId]   INT             NULL,
    
    CONSTRAINT [PK_UserApplications] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UQ_UserApplications_UserApp] UNIQUE ([UserId], [ApplicationId]),
    CONSTRAINT [FK_UserApplications_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserApplications_Applications] FOREIGN KEY ([ApplicationId]) REFERENCES [dbo].[Applications]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserApplications_GrantedBy] FOREIGN KEY ([GrantedByUserId]) REFERENCES [dbo].[Users]([Id])
);

-- Indexes
CREATE NONCLUSTERED INDEX [IX_UserApplications_UserId] ON [dbo].[UserApplications] ([UserId]);
CREATE NONCLUSTERED INDEX [IX_UserApplications_ApplicationId] ON [dbo].[UserApplications] ([ApplicationId]);
```

### 2.5 RefreshTokens Table

```sql
CREATE TABLE [dbo].[RefreshTokens] (
    [Id]                INT             IDENTITY(1,1) NOT NULL,
    [UserId]            INT             NOT NULL,
    [Token]             NVARCHAR(500)   NOT NULL,
    [ExpiresAt]         DATETIME2(7)    NOT NULL,
    [CreatedAt]         DATETIME2(7)    NOT NULL DEFAULT GETUTCDATE(),
    [RevokedAt]         DATETIME2(7)    NULL,
    [RevokedByIp]       NVARCHAR(50)    NULL,
    [ReplacedByToken]   NVARCHAR(500)   NULL,
    [CreatedByIp]       NVARCHAR(50)    NOT NULL,
    
    CONSTRAINT [PK_RefreshTokens] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_RefreshTokens_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE
);

-- Indexes
CREATE NONCLUSTERED INDEX [IX_RefreshTokens_Token] ON [dbo].[RefreshTokens] ([Token]);
CREATE NONCLUSTERED INDEX [IX_RefreshTokens_UserId] ON [dbo].[RefreshTokens] ([UserId]);
CREATE NONCLUSTERED INDEX [IX_RefreshTokens_ExpiresAt] ON [dbo].[RefreshTokens] ([ExpiresAt]) WHERE [RevokedAt] IS NULL;
```

### 2.6 UserSessions Table

```sql
CREATE TABLE [dbo].[UserSessions] (
    [Id]                INT             IDENTITY(1,1) NOT NULL,
    [UserId]            INT             NOT NULL,
    [SessionToken]      NVARCHAR(500)   NOT NULL,
    [DeviceInfo]        NVARCHAR(255)   NULL,
    [IpAddress]         NVARCHAR(50)    NULL,
    [UserAgent]         NVARCHAR(500)   NULL,
    [CreatedAt]         DATETIME2(7)    NOT NULL DEFAULT GETUTCDATE(),
    [ExpiresAt]         DATETIME2(7)    NOT NULL,
    [LastActivityAt]    DATETIME2(7)    NULL,
    [IsActive]          BIT             NOT NULL DEFAULT 1,
    
    CONSTRAINT [PK_UserSessions] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_UserSessions_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE
);

-- Indexes
CREATE NONCLUSTERED INDEX [IX_UserSessions_UserId] ON [dbo].[UserSessions] ([UserId]);
CREATE NONCLUSTERED INDEX [IX_UserSessions_SessionToken] ON [dbo].[UserSessions] ([SessionToken]);
CREATE NONCLUSTERED INDEX [IX_UserSessions_IsActive] ON [dbo].[UserSessions] ([IsActive], [ExpiresAt]) WHERE [IsActive] = 1;
```

### 2.7 AuditLogs Table

```sql
CREATE TABLE [dbo].[AuditLogs] (
    [Id]            BIGINT          IDENTITY(1,1) NOT NULL,
    [UserId]        INT             NULL,
    [Action]        NVARCHAR(50)    NOT NULL,
    [EntityType]    NVARCHAR(100)   NOT NULL,
    [EntityId]      INT             NULL,
    [OldValues]     NVARCHAR(MAX)   NULL,
    [NewValues]     NVARCHAR(MAX)   NULL,
    [IpAddress]     NVARCHAR(50)    NULL,
    [UserAgent]     NVARCHAR(500)   NULL,
    [Timestamp]     DATETIME2(7)    NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT [PK_AuditLogs] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [FK_AuditLogs_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
);

-- Indexes
CREATE NONCLUSTERED INDEX [IX_AuditLogs_UserId] ON [dbo].[AuditLogs] ([UserId]);
CREATE NONCLUSTERED INDEX [IX_AuditLogs_EntityType] ON [dbo].[AuditLogs] ([EntityType]);
CREATE NONCLUSTERED INDEX [IX_AuditLogs_Timestamp] ON [dbo].[AuditLogs] ([Timestamp] DESC);
CREATE NONCLUSTERED INDEX [IX_AuditLogs_Action] ON [dbo].[AuditLogs] ([Action], [Timestamp] DESC);
```

---

## 3. Stored Procedures

### 3.1 User Login Validation

```sql
CREATE PROCEDURE [dbo].[sp_ValidateUserLogin]
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserId INT;
    DECLARE @IsValid BIT = 0;
    
    SELECT 
        @UserId = Id,
        @IsValid = CASE WHEN PasswordHash = @PasswordHash AND IsActive = 1 THEN 1 ELSE 0 END
    FROM [dbo].[Users]
    WHERE Email = @Email;
    
    IF @IsValid = 1
    BEGIN
        -- Update last login timestamp
        UPDATE [dbo].[Users]
        SET LastLoginAt = GETUTCDATE()
        WHERE Id = @UserId;
        
        -- Return user data
        SELECT 
            u.Id,
            u.Name,
            u.Email,
            u.AvatarUrl,
            r.Name AS RoleName
        FROM [dbo].[Users] u
        INNER JOIN [dbo].[Roles] r ON u.RoleId = r.Id
        WHERE u.Id = @UserId;
    END
    ELSE
    BEGIN
        -- Return empty result for invalid login
        SELECT NULL AS Id WHERE 1 = 0;
    END
END
GO
```

### 3.2 Create Refresh Token

```sql
CREATE PROCEDURE [dbo].[sp_CreateRefreshToken]
    @UserId INT,
    @Token NVARCHAR(500),
    @ExpiresAt DATETIME2(7),
    @CreatedByIp NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Revoke any existing active tokens for this user (optional: limit concurrent sessions)
    -- UPDATE [dbo].[RefreshTokens]
    -- SET RevokedAt = GETUTCDATE(), RevokedByIp = 'system'
    -- WHERE UserId = @UserId AND RevokedAt IS NULL;
    
    INSERT INTO [dbo].[RefreshTokens] (UserId, Token, ExpiresAt, CreatedByIp)
    VALUES (@UserId, @Token, @ExpiresAt, @CreatedByIp);
    
    SELECT SCOPE_IDENTITY() AS Id;
END
GO
```

### 3.3 Assign Application Access

```sql
CREATE PROCEDURE [dbo].[sp_AssignApplicationAccess]
    @UserId INT,
    @ApplicationId INT,
    @GrantedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if access already exists
    IF NOT EXISTS (
        SELECT 1 FROM [dbo].[UserApplications]
        WHERE UserId = @UserId AND ApplicationId = @ApplicationId
    )
    BEGIN
        INSERT INTO [dbo].[UserApplications] (UserId, ApplicationId, GrantedByUserId)
        VALUES (@UserId, @ApplicationId, @GrantedByUserId);
        
        SELECT 1 AS Success, 'Access granted successfully' AS Message;
    END
    ELSE
    BEGIN
        SELECT 0 AS Success, 'Access already exists' AS Message;
    END
END
GO
```

### 3.4 Revoke Application Access

```sql
CREATE PROCEDURE [dbo].[sp_RevokeApplicationAccess]
    @UserId INT,
    @ApplicationId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM [dbo].[UserApplications]
    WHERE UserId = @UserId AND ApplicationId = @ApplicationId;
    
    IF @@ROWCOUNT > 0
        SELECT 1 AS Success, 'Access revoked successfully' AS Message;
    ELSE
        SELECT 0 AS Success, 'Access not found' AS Message;
END
GO
```

### 3.5 Fetch User Dashboard Applications

```sql
CREATE PROCEDURE [dbo].[sp_GetUserDashboardApps]
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        a.Id,
        a.Name,
        a.Description,
        a.Url,
        a.Icon,
        a.IconColor,
        a.Category,
        a.IsSupported,
        a.RequiresAuth,
        a.DisplayOrder,
        ua.GrantedAt
    FROM [dbo].[Applications] a
    INNER JOIN [dbo].[UserApplications] ua ON a.Id = ua.ApplicationId
    WHERE ua.UserId = @UserId
        AND a.IsActive = 1
    ORDER BY a.Category, a.DisplayOrder, a.Name;
END
GO
```

---

## 4. Views

### 4.1 User Application Access View

```sql
CREATE VIEW [dbo].[vw_UserApplicationAccess]
AS
SELECT 
    u.Id AS UserId,
    u.Name AS UserName,
    u.Email AS UserEmail,
    r.Name AS RoleName,
    a.Id AS ApplicationId,
    a.Name AS ApplicationName,
    a.Category AS ApplicationCategory,
    a.Url AS ApplicationUrl,
    a.IsSupported,
    ua.GrantedAt,
    g.Name AS GrantedByUser
FROM [dbo].[Users] u
INNER JOIN [dbo].[Roles] r ON u.RoleId = r.Id
INNER JOIN [dbo].[UserApplications] ua ON u.Id = ua.UserId
INNER JOIN [dbo].[Applications] a ON ua.ApplicationId = a.Id
LEFT JOIN [dbo].[Users] g ON ua.GrantedByUserId = g.Id
WHERE u.IsActive = 1 AND a.IsActive = 1;
GO
```

### 4.2 Active Sessions View

```sql
CREATE VIEW [dbo].[vw_ActiveSessions]
AS
SELECT 
    s.Id AS SessionId,
    u.Id AS UserId,
    u.Name AS UserName,
    u.Email AS UserEmail,
    s.DeviceInfo,
    s.IpAddress,
    s.CreatedAt AS SessionStarted,
    s.LastActivityAt,
    s.ExpiresAt,
    DATEDIFF(MINUTE, s.LastActivityAt, GETUTCDATE()) AS IdleMinutes
FROM [dbo].[UserSessions] s
INNER JOIN [dbo].[Users] u ON s.UserId = u.Id
WHERE s.IsActive = 1 
    AND s.ExpiresAt > GETUTCDATE();
GO
```

---

## 5. Functions

### 5.1 Token Expiry Check Function

```sql
CREATE FUNCTION [dbo].[fn_IsTokenValid]
(
    @Token NVARCHAR(500)
)
RETURNS BIT
AS
BEGIN
    DECLARE @IsValid BIT = 0;
    
    IF EXISTS (
        SELECT 1 
        FROM [dbo].[RefreshTokens]
        WHERE Token = @Token 
            AND RevokedAt IS NULL 
            AND ExpiresAt > GETUTCDATE()
    )
    BEGIN
        SET @IsValid = 1;
    END
    
    RETURN @IsValid;
END
GO
```

### 5.2 User Has Application Access Function

```sql
CREATE FUNCTION [dbo].[fn_UserHasAppAccess]
(
    @UserId INT,
    @ApplicationId INT
)
RETURNS BIT
AS
BEGIN
    DECLARE @HasAccess BIT = 0;
    
    IF EXISTS (
        SELECT 1 
        FROM [dbo].[UserApplications] ua
        INNER JOIN [dbo].[Applications] a ON ua.ApplicationId = a.Id
        WHERE ua.UserId = @UserId 
            AND ua.ApplicationId = @ApplicationId
            AND a.IsActive = 1
    )
    BEGIN
        SET @HasAccess = 1;
    END
    
    RETURN @HasAccess;
END
GO
```

---

## 6. Seed Data

```sql
-- Seed Applications
INSERT INTO [dbo].[Applications] (Name, Description, Url, Icon, IconColor, Category, IsSupported, DisplayOrder)
VALUES 
    ('Email', 'Corporate email system', 'http://localhost:4201', 'mail', 'bg-blue-500', 'Communication', 1, 1),
    ('Team Hub', 'Team collaboration', 'http://localhost:4202', 'groups', 'bg-orange-500', 'Communication', 1, 2),
    ('Chat', 'Instant messaging', 'http://localhost:4203', 'chat', 'bg-teal-500', 'Communication', 1, 3),
    ('Documents', 'Document management', 'http://localhost:4204', 'description', 'bg-green-500', 'Productivity', 1, 4),
    ('Calendar', 'Schedule & meetings', 'http://localhost:4205', 'calendar_today', 'bg-red-500', 'Productivity', 1, 5),
    ('File Storage', 'Cloud storage', 'http://localhost:4206', 'folder_open', 'bg-yellow-500', 'Productivity', 1, 6),
    ('Analytics', 'Business intelligence', 'http://localhost:4207', 'analytics', 'bg-purple-500', 'Analytics', 0, 7),
    ('Admin Panel', 'System administration', 'http://localhost:4208', 'admin_panel_settings', 'bg-gray-500', 'Administration', 0, 8);

-- Seed Admin User (password: Admin123!)
INSERT INTO [dbo].[Users] (Name, Email, PasswordHash, RoleId, EmailConfirmed)
VALUES ('Admin User', 'admin@sanrachna.com', '$2a$11$ExampleHashHere', 1, 1);

-- Grant all apps to admin
INSERT INTO [dbo].[UserApplications] (UserId, ApplicationId, GrantedByUserId)
SELECT 1, Id, 1 FROM [dbo].[Applications];
```

---

## 7. Maintenance Scripts

### 7.1 Cleanup Expired Tokens

```sql
CREATE PROCEDURE [dbo].[sp_CleanupExpiredTokens]
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Delete expired refresh tokens older than 30 days
    DELETE FROM [dbo].[RefreshTokens]
    WHERE ExpiresAt < DATEADD(DAY, -30, GETUTCDATE());
    
    -- Deactivate expired sessions
    UPDATE [dbo].[UserSessions]
    SET IsActive = 0
    WHERE ExpiresAt < GETUTCDATE() AND IsActive = 1;
    
    SELECT @@ROWCOUNT AS AffectedRows;
END
GO
```

### 7.2 Archive Old Audit Logs

```sql
CREATE PROCEDURE [dbo].[sp_ArchiveAuditLogs]
    @RetentionDays INT = 90
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CutoffDate DATETIME2(7) = DATEADD(DAY, -@RetentionDays, GETUTCDATE());
    
    -- Move to archive table (create separately)
    -- INSERT INTO [dbo].[AuditLogs_Archive]
    -- SELECT * FROM [dbo].[AuditLogs]
    -- WHERE Timestamp < @CutoffDate;
    
    DELETE FROM [dbo].[AuditLogs]
    WHERE Timestamp < @CutoffDate;
    
    SELECT @@ROWCOUNT AS ArchivedRecords;
END
GO
```

---

## 8. Indexing Strategy Summary

| Table | Index Name | Columns | Type |
|-------|-----------|---------|------|
| Users | IX_Users_Email | Email | Non-clustered, Unique |
| Users | IX_Users_RoleId | RoleId | Non-clustered |
| Applications | IX_Applications_Category | Category | Non-clustered |
| UserApplications | IX_UserApplications_UserId | UserId | Non-clustered |
| RefreshTokens | IX_RefreshTokens_Token | Token | Non-clustered |
| UserSessions | IX_UserSessions_IsActive | IsActive, ExpiresAt | Filtered |
| AuditLogs | IX_AuditLogs_Timestamp | Timestamp DESC | Non-clustered |

---

*Document Version: 1.0*
*Last Updated: December 2024*
