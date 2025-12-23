# Static Database Changes

This folder contains organized SQL scripts for database schema creation and seed data for **Sanrachna.AI**.

## 📁 Files

| File | Description |
|------|-------------|
| `01_create_tables.sql` | Complete database schema with all table definitions, indexes, and foreign keys |
| `02_seed_data.sql` | Initial seed data for roles, applications, and EF migration history |

## 🚀 Execution Order

**Always execute in this order:**

```bash
1. 01_create_tables.sql   # Creates all tables, indexes, and constraints
2. 02_seed_data.sql       # Inserts default roles and applications
```

## 📊 Database Schema

### Tables Overview

| Table | Description |
|-------|-------------|
| `Roles` | User roles (admin, user, guest) |
| `Applications` | Available apps in the system |
| `Users` | User accounts with authentication |
| `RefreshTokens` | JWT refresh tokens |
| `UserSessions` | Active user sessions |
| `UserApplications` | User-Application access mapping |
| `AuditLogs` | System audit trail |
| `__EFMigrationsHistory` | EF Core migration tracking |

### Entity Relationships

```
Roles (1) ──────────────────┬──> (N) Users
                            │
Users (1) ──────────────────┼──> (N) RefreshTokens
                            │
Users (1) ──────────────────┼──> (N) UserSessions
                            │
Users (1) ──────────────────┼──> (N) AuditLogs
                            │
Users (N) <──────┬──────────┼──> (N) Applications
                 │          │
                 └── UserApplications (Junction Table)
```

## 🔧 Usage Examples

### MySQL CLI

```bash
# Create database first
mysql -u root -p -e "CREATE DATABASE sanrachna_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Execute schema creation
mysql -u root -p sanrachna_ai < 01_create_tables.sql

# Execute seed data
mysql -u root -p sanrachna_ai < 02_seed_data.sql
```

### MySQL Workbench / DBeaver

1. Connect to your MySQL server
2. Create a new database: `CREATE DATABASE sanrachna_ai;`
3. Select the database: `USE sanrachna_ai;`
4. Open and execute `01_create_tables.sql`
5. Open and execute `02_seed_data.sql`

### Docker MySQL

```bash
# Copy SQL files to container
docker cp 01_create_tables.sql mysql_container:/tmp/
docker cp 02_seed_data.sql mysql_container:/tmp/

# Execute scripts
docker exec -i mysql_container mysql -u root -p sanrachna_ai < /tmp/01_create_tables.sql
docker exec -i mysql_container mysql -u root -p sanrachna_ai < /tmp/02_seed_data.sql
```

## 📝 Notes

- All tables use **InnoDB** engine for transaction support
- Character set is **utf8mb4** for full Unicode support
- Timestamps use **UTC_TIMESTAMP()** for consistency
- The `02_seed_data.sql` uses `ON DUPLICATE KEY UPDATE` for idempotent execution
- Default user role is `user` (RoleId = 2)

## 🔐 Default Roles

| ID | Name | Description |
|----|------|-------------|
| 1 | admin | System Administrator with full access |
| 2 | user | Standard user with limited access |
| 3 | guest | Guest user with read-only access |

## 📱 Default Applications

| ID | Name | Category | Supported |
|----|------|----------|-----------|
| 1 | Email | Communication | ✅ |
| 2 | Team Hub | Communication | ✅ |
| 3 | Chat | Communication | ✅ |
| 4 | Documents | Productivity | ✅ |
| 5 | Calendar | Productivity | ✅ |
| 6 | File Storage | Productivity | ✅ |
| 7 | Analytics | Analytics | ❌ |
| 8 | Admin Panel | Administration | ❌ |

## 🔄 Migration from EF Core

These scripts are generated from the EF Core migrations:
- `20251216211354_InitialCreate`
- `20251218002833_AddGoogleIdToUser`

To keep EF Core happy when using these scripts, the `__EFMigrationsHistory` table is populated with the migration IDs.
