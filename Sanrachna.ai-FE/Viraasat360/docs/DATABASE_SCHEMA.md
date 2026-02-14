# Viraasat360 Database Schema Architecture

## 📖 Overview

**Viraasat360** (विरासत 360° - "Legacy 360°") is a Family Wealth & Legacy Management Application. This document outlines the complete database schema architecture for the backend system.

---

## 🗂️ Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           VIRAASAT360 ER DIAGRAM                                │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────────┐
                              │       USERS          │
                              │──────────────────────│
                              │ PK: id               │
                              │ email                │
                              │ password_hash        │
                              │ created_at           │
                              │ updated_at           │
                              └──────────┬───────────┘
                                         │
                                         │ 1:1
                                         ▼
                              ┌──────────────────────┐
                              │   USER_PROFILES      │
                              │──────────────────────│
                              │ PK: id               │
                              │ FK: user_id ─────────┼──────────┐
                              │ full_name            │          │
                              │ date_of_birth        │          │
                              │ occupation           │          │
                              │ monthly_income       │          │
                              │ annual_income        │          │
                              │ email                │          │
                              │ phone                │          │
                              │ address              │          │
                              │ pan_number           │          │
                              │ preferred_nominee    │          │
                              │ created_at           │          │
                              │ updated_at           │          │
                              └──────────┬───────────┘          │
                                         │                      │
                        ┌────────────────┼────────────────┐     │
                        │ 1:N            │ 1:N            │     │
                        ▼                ▼                ▼     │
          ┌─────────────────────┐ ┌─────────────┐ ┌─────────────────────┐
          │   FAMILY_MEMBERS    │ │   ASSETS    │ │    LIABILITIES      │
          │─────────────────────│ │─────────────│ │─────────────────────│
          │ PK: id              │ │ PK: id      │ │ PK: id              │
          │ FK: user_id ────────┼─┤ FK: user_id │ │ FK: user_id ────────┤
          │ FK: parent_id ──┐   │ │ name        │ │ name                │
          │ name            │   │ │ asset_class │ │ liability_type      │
          │ relationship    │   │ │ asset_type  │ │ lender_name         │
          │ email           │   │ │ current_val │ │ principal_amount    │
          │ phone           │   │ │ ownership   │ │ outstanding_amount  │
          │ date_of_birth   │   │ │ percentage  │ │ emi_amount          │
          │ dependency_stat │   │ │ location    │ │ interest_rate       │
          │ notes           ◄───┼─┤ family_id──►│ │ start_date          │
          │ created_at      │   │ │ notes       │ │ end_date            │
          │ updated_at      │   │ │ created_at  │ │ status              │
          └─────────────────┘   │ │ updated_at  │ │ FK: linked_asset ───┤
               ▲                │ └──────┬──────┘ │ notes               │
               │                │        │        │ created_at          │
               │ Self-Reference │        │        │ updated_at          │
               └────────────────┘        │        └──────────┬──────────┘
                                         │                   │
                                         │                   │
                              ┌──────────┴───────────┐       │
                              │     Inheritance      │       │
                              │  (Table per Type)    │       │
                              ├──────────────────────┤       │
                              ▼                      ▼       │
               ┌─────────────────────┐ ┌─────────────────────┐
               │  IMMOVABLE_ASSETS   │ │   MOVABLE_ASSETS    │
               │─────────────────────│ │─────────────────────│
               │ FK: asset_id ───────┤ │ FK: asset_id ───────┤
               │ property_type       │ │ movable_type        │
               │ location            │ │ institution_name    │
               │ registration_no     │ │ account_type        │
               │ purchase_date       │ │ account_number      │
               │ purchase_price      │ │ maturity_date       │
               └─────────────────────┘ │ interest_rate       │
                                       │ invested_amount     │
                                       │ current_value       │
                                       │ platform            │
                                       └─────────────────────┘

                              ┌──────────────────────┐
                              │    AUDIT_LOGS        │
                              │──────────────────────│
                              │ PK: id               │
                              │ FK: user_id          │
                              │ table_name           │
                              │ record_id            │
                              │ action (C/U/D)       │
                              │ old_values (JSON)    │
                              │ new_values (JSON)    │
                              │ created_at           │
                              └──────────────────────┘
```

---

## 📊 Detailed Table Schemas

### 1. Users Table (Authentication)

```sql
CREATE TABLE users (
    id                  BIGINT PRIMARY KEY IDENTITY(1,1),
    email               NVARCHAR(255) NOT NULL UNIQUE,
    password_hash       NVARCHAR(255) NOT NULL,
    email_verified      BIT DEFAULT 0,
    is_active           BIT DEFAULT 1,
    last_login_at       DATETIME2,
    created_at          DATETIME2 DEFAULT GETUTCDATE(),
    updated_at          DATETIME2 DEFAULT GETUTCDATE(),
    
    INDEX idx_users_email (email)
);
```

---

### 2. User Profiles Table

```sql
CREATE TABLE user_profiles (
    id                  BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id             BIGINT NOT NULL UNIQUE,
    full_name           NVARCHAR(255) NOT NULL,
    date_of_birth       DATE,
    occupation          NVARCHAR(255),
    monthly_income      DECIMAL(18,2) DEFAULT 0,
    annual_income       AS (monthly_income * 12) PERSISTED,  -- Computed column
    email               NVARCHAR(255),
    phone               NVARCHAR(20),
    address             NVARCHAR(500),
    pan_number          NVARCHAR(10),  -- Indian PAN format: ABCDE1234F
    preferred_nominee   NVARCHAR(500),
    avatar_url          NVARCHAR(500),
    created_at          DATETIME2 DEFAULT GETUTCDATE(),
    updated_at          DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_profile_user (user_id),
    INDEX idx_profile_pan (pan_number)
);
```

---

### 3. Family Members Table

```sql
CREATE TABLE family_members (
    id                  BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id             BIGINT NOT NULL,
    parent_id           BIGINT NULL,  -- Self-reference for hierarchy
    name                NVARCHAR(255) NOT NULL,
    relationship        NVARCHAR(50) NOT NULL,  -- Enum values
    email               NVARCHAR(255),
    phone               NVARCHAR(20),
    date_of_birth       DATE,
    dependency_status   NVARCHAR(20) NOT NULL DEFAULT 'Dependent',
    notes               NVARCHAR(1000),
    created_at          DATETIME2 DEFAULT GETUTCDATE(),
    updated_at          DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT fk_family_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_family_parent FOREIGN KEY (parent_id) 
        REFERENCES family_members(id) ON DELETE NO ACTION,
    CONSTRAINT chk_relationship CHECK (relationship IN (
        'Father', 'Mother', 'Spouse', 'Son', 'Daughter', 
        'Brother', 'Sister', 'Grandfather', 'Grandmother',
        'Uncle', 'Aunt', 'Cousin', 'Other'
    )),
    CONSTRAINT chk_dependency CHECK (dependency_status IN ('Dependent', 'Independent')),
    
    INDEX idx_family_user (user_id),
    INDEX idx_family_parent (parent_id)
);
```

---

### 4. Assets Table (Base Table)

```sql
CREATE TABLE assets (
    id                      BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id                 BIGINT NOT NULL,
    name                    NVARCHAR(255) NOT NULL,
    asset_class             NVARCHAR(20) NOT NULL,  -- 'immovable' or 'movable'
    current_value           DECIMAL(18,2) NOT NULL DEFAULT 0,
    ownership_type          NVARCHAR(20) NOT NULL DEFAULT 'Self',
    ownership_percentage    DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    linked_family_member_id BIGINT NULL,
    notes                   NVARCHAR(1000),
    created_at              DATETIME2 DEFAULT GETUTCDATE(),
    updated_at              DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT fk_asset_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_asset_family FOREIGN KEY (linked_family_member_id) 
        REFERENCES family_members(id) ON DELETE SET NULL,
    CONSTRAINT chk_asset_class CHECK (asset_class IN ('immovable', 'movable')),
    CONSTRAINT chk_ownership_type CHECK (ownership_type IN (
        'Self', 'Joint', 'Ancestral', 'Inherited', 'Gifted'
    )),
    CONSTRAINT chk_ownership_pct CHECK (ownership_percentage BETWEEN 0.01 AND 100.00),
    
    INDEX idx_asset_user (user_id),
    INDEX idx_asset_class (asset_class),
    INDEX idx_asset_family (linked_family_member_id)
);
```

---

### 5. Immovable Assets Table (Extension)

```sql
CREATE TABLE immovable_assets (
    id                  BIGINT PRIMARY KEY IDENTITY(1,1),
    asset_id            BIGINT NOT NULL UNIQUE,
    property_type       NVARCHAR(50) NOT NULL,
    location            NVARCHAR(500) NOT NULL,
    registration_number NVARCHAR(100),
    purchase_date       DATE,
    purchase_price      DECIMAL(18,2),
    
    CONSTRAINT fk_immovable_asset FOREIGN KEY (asset_id) 
        REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT chk_property_type CHECK (property_type IN (
        'Land', 'House', 'Flat', 'Commercial Property', 
        'Agricultural Land', 'Other'
    )),
    
    INDEX idx_immovable_asset (asset_id)
);
```

---

### 6. Movable Assets Table (Extension)

```sql
CREATE TABLE movable_assets (
    id                  BIGINT PRIMARY KEY IDENTITY(1,1),
    asset_id            BIGINT NOT NULL UNIQUE,
    movable_type        NVARCHAR(50) NOT NULL,
    institution_name    NVARCHAR(255),
    account_type        NVARCHAR(20),
    account_number      NVARCHAR(50),
    maturity_date       DATE,
    interest_rate       DECIMAL(5,2),
    invested_amount     DECIMAL(18,2),
    current_value       DECIMAL(18,2),
    platform            NVARCHAR(100),  -- e.g., Zerodha, Groww
    
    CONSTRAINT fk_movable_asset FOREIGN KEY (asset_id) 
        REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT chk_movable_type CHECK (movable_type IN (
        'Bank Account', 'Fixed Deposit', 'Stocks', 'Mutual Funds',
        'Gold', 'Cash', 'PPF', 'EPF', 'Insurance', 'Bonds',
        'Cryptocurrency', 'Vehicle', 'Other'
    )),
    CONSTRAINT chk_account_type CHECK (account_type IS NULL OR account_type IN (
        'Savings', 'Current', 'Salary', 'NRI', 'Other'
    )),
    
    INDEX idx_movable_asset (asset_id),
    INDEX idx_movable_type (movable_type)
);
```

---

### 7. Liabilities Table

```sql
CREATE TABLE liabilities (
    id                  BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id             BIGINT NOT NULL,
    name                NVARCHAR(255) NOT NULL,
    liability_type      NVARCHAR(50) NOT NULL,
    lender_name         NVARCHAR(255),
    principal_amount    DECIMAL(18,2) NOT NULL,
    outstanding_amount  DECIMAL(18,2) NOT NULL,
    emi_amount          DECIMAL(18,2),
    interest_rate       DECIMAL(5,2) NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    status              NVARCHAR(20) NOT NULL DEFAULT 'Active',
    linked_asset_id     BIGINT NULL,  -- Collateral
    notes               NVARCHAR(1000),
    created_at          DATETIME2 DEFAULT GETUTCDATE(),
    updated_at          DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT fk_liability_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_liability_asset FOREIGN KEY (linked_asset_id) 
        REFERENCES assets(id) ON DELETE SET NULL,
    CONSTRAINT chk_liability_type CHECK (liability_type IN (
        'Home Loan', 'Personal Loan', 'Car Loan', 'Education Loan',
        'Credit Card', 'Mortgage', 'Business Loan', 'Gold Loan', 'Other'
    )),
    CONSTRAINT chk_liability_status CHECK (status IN ('Active', 'Closed', 'Defaulted')),
    CONSTRAINT chk_outstanding CHECK (outstanding_amount <= principal_amount),
    
    INDEX idx_liability_user (user_id),
    INDEX idx_liability_status (status),
    INDEX idx_liability_asset (linked_asset_id)
);
```

---

### 8. Audit Logs Table

```sql
CREATE TABLE audit_logs (
    id                  BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id             BIGINT NOT NULL,
    table_name          NVARCHAR(100) NOT NULL,
    record_id           BIGINT NOT NULL,
    action              NVARCHAR(10) NOT NULL,  -- CREATE, UPDATE, DELETE
    old_values          NVARCHAR(MAX),  -- JSON
    new_values          NVARCHAR(MAX),  -- JSON
    ip_address          NVARCHAR(50),
    user_agent          NVARCHAR(500),
    created_at          DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE NO ACTION,
    CONSTRAINT chk_action CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_table (table_name),
    INDEX idx_audit_record (table_name, record_id),
    INDEX idx_audit_date (created_at)
);
```

---

## 📐 Database Views

### 1. Dashboard Summary View

```sql
CREATE VIEW vw_dashboard_summary AS
SELECT 
    u.id AS user_id,
    
    -- Asset Totals
    ISNULL(SUM(CASE WHEN a.asset_class = 'immovable' 
        THEN a.current_value * (a.ownership_percentage / 100) END), 0) AS total_immovable_assets,
    ISNULL(SUM(CASE WHEN a.asset_class = 'movable' 
        THEN a.current_value * (a.ownership_percentage / 100) END), 0) AS total_movable_assets,
    ISNULL(SUM(a.current_value * (a.ownership_percentage / 100)), 0) AS total_assets,
    
    -- Liability Totals
    ISNULL((SELECT SUM(outstanding_amount) 
            FROM liabilities 
            WHERE user_id = u.id AND status = 'Active'), 0) AS total_liabilities,
    
    -- Net Worth
    ISNULL(SUM(a.current_value * (a.ownership_percentage / 100)), 0) - 
    ISNULL((SELECT SUM(outstanding_amount) 
            FROM liabilities 
            WHERE user_id = u.id AND status = 'Active'), 0) AS net_worth,
    
    -- Family Count
    (SELECT COUNT(*) FROM family_members WHERE user_id = u.id) AS family_member_count,
    
    -- Asset Count
    COUNT(a.id) AS asset_count,
    
    -- Active Liability Count
    (SELECT COUNT(*) FROM liabilities WHERE user_id = u.id AND status = 'Active') AS active_liability_count

FROM users u
LEFT JOIN assets a ON u.id = a.user_id
GROUP BY u.id;
```

### 2. Asset Distribution View

```sql
CREATE VIEW vw_asset_distribution AS
SELECT 
    user_id,
    -- Immovable breakdown
    ISNULL(SUM(CASE WHEN asset_class = 'immovable' THEN current_value END), 0) AS immovable_total,
    
    -- Movable breakdown by type
    ISNULL(SUM(CASE WHEN ma.movable_type = 'Bank Account' THEN a.current_value END), 0) AS bank_accounts,
    ISNULL(SUM(CASE WHEN ma.movable_type = 'Fixed Deposit' THEN a.current_value END), 0) AS fixed_deposits,
    ISNULL(SUM(CASE WHEN ma.movable_type = 'Stocks' THEN a.current_value END), 0) AS stocks,
    ISNULL(SUM(CASE WHEN ma.movable_type = 'Mutual Funds' THEN a.current_value END), 0) AS mutual_funds,
    ISNULL(SUM(CASE WHEN ma.movable_type = 'Gold' THEN a.current_value END), 0) AS gold,
    ISNULL(SUM(CASE WHEN ma.movable_type IN ('PPF', 'EPF') THEN a.current_value END), 0) AS retirement_funds,
    ISNULL(SUM(CASE WHEN ma.movable_type = 'Insurance' THEN a.current_value END), 0) AS insurance,
    ISNULL(SUM(CASE WHEN ma.movable_type NOT IN (
        'Bank Account', 'Fixed Deposit', 'Stocks', 'Mutual Funds', 
        'Gold', 'PPF', 'EPF', 'Insurance'
    ) AND a.asset_class = 'movable' THEN a.current_value END), 0) AS other_movable

FROM assets a
LEFT JOIN movable_assets ma ON a.id = ma.asset_id
GROUP BY user_id;
```

---

## 🔗 Relationship Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| `users` → `user_profiles` | 1:1 | Each user has exactly one profile |
| `users` → `family_members` | 1:N | User can have many family members |
| `users` → `assets` | 1:N | User can own many assets |
| `users` → `liabilities` | 1:N | User can have many liabilities |
| `family_members` → `family_members` | Self 1:N | Parent-child hierarchy |
| `assets` → `family_members` | N:1 | Asset can be linked to a family member |
| `assets` → `immovable_assets` | 1:1 | Immovable asset details |
| `assets` → `movable_assets` | 1:1 | Movable asset details |
| `liabilities` → `assets` | N:1 | Liability can be secured by an asset |

---

## 📈 Indexes Strategy

### Primary Indexes (Clustered)
- All `id` columns are clustered primary keys

### Foreign Key Indexes
- All foreign key columns are indexed for JOIN performance

### Query Optimization Indexes
| Table | Column(s) | Purpose |
|-------|-----------|---------|
| `users` | `email` | Login lookups |
| `user_profiles` | `pan_number` | PAN verification |
| `assets` | `user_id, asset_class` | Dashboard queries |
| `liabilities` | `user_id, status` | Active loan queries |
| `audit_logs` | `table_name, record_id` | History lookups |

---

## 🔒 Security Considerations

### 1. Data Encryption
```sql
-- Encrypt sensitive columns
ALTER TABLE user_profiles
ADD pan_number_encrypted VARBINARY(256);

-- Use Always Encrypted for PAN, account numbers
```

### 2. Row-Level Security
```sql
-- Users can only see their own data
CREATE SECURITY POLICY user_data_policy
ADD FILTER PREDICATE dbo.fn_user_access_predicate(user_id)
ON dbo.assets,
ADD FILTER PREDICATE dbo.fn_user_access_predicate(user_id)
ON dbo.liabilities,
ADD FILTER PREDICATE dbo.fn_user_access_predicate(user_id)
ON dbo.family_members
WITH (STATE = ON);
```

### 3. Audit Trail
- All tables have `created_at` and `updated_at`
- `audit_logs` table tracks all changes
- Implement triggers for automatic audit logging

---

## 🚀 Migration Scripts

### Initial Schema Creation Order
1. `users`
2. `user_profiles`
3. `family_members`
4. `assets`
5. `immovable_assets`
6. `movable_assets`
7. `liabilities`
8. `audit_logs`
9. Views

### Sample Seed Data
```sql
-- Insert test user
INSERT INTO users (email, password_hash) 
VALUES ('test@example.com', 'hashed_password');

-- Insert profile
INSERT INTO user_profiles (user_id, full_name, occupation, monthly_income)
VALUES (1, 'Test User', 'Software Engineer', 150000);

-- Insert family member
INSERT INTO family_members (user_id, name, relationship, dependency_status)
VALUES (1, 'Spouse Name', 'Spouse', 'Independent');

-- Insert asset
INSERT INTO assets (user_id, name, asset_class, current_value, ownership_type)
VALUES (1, 'Primary Residence', 'immovable', 10000000, 'Self');

INSERT INTO immovable_assets (asset_id, property_type, location)
VALUES (1, 'House', 'Mumbai, Maharashtra');
```

---

## 📊 Storage Estimates

| Table | Avg Row Size | Est. Rows/User | Est. Size/User |
|-------|--------------|----------------|----------------|
| `user_profiles` | 500 bytes | 1 | 500 B |
| `family_members` | 300 bytes | 10 | 3 KB |
| `assets` | 400 bytes | 20 | 8 KB |
| `immovable_assets` | 200 bytes | 5 | 1 KB |
| `movable_assets` | 250 bytes | 15 | 3.75 KB |
| `liabilities` | 350 bytes | 5 | 1.75 KB |
| `audit_logs` | 1 KB | 100/year | 100 KB/year |

**Total per user (1st year)**: ~120 KB

---

## 🛠️ Recommended Tech Stack

| Component | Technology |
|-----------|------------|
| **Database** | Azure SQL Database / SQL Server |
| **ORM** | Entity Framework Core |
| **Migrations** | EF Core Migrations |
| **Backup** | Azure SQL Automated Backups |
| **Monitoring** | Azure SQL Analytics |

---

*Document Version: 1.0*  
*Last Updated: January 2026*
