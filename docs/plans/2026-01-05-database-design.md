# Database Design - Expense Lovers

## Overview
SQLite database with Drizzle ORM for type-safe queries. Zustand for reactive state management.

## Schema

### Wallet
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key |
| name | text | Required, e.g., "Cash", "Bank" |
| balance | integer | Stored in cents |
| createdAt | integer | Unix timestamp |
| updatedAt | integer | Unix timestamp |

### Category
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key |
| name | text | Required |
| type | text | "income" or "expense" |
| icon | text | Optional, for UI |
| isDefault | boolean | True for seeded categories |
| createdAt | integer | Unix timestamp |

### Transaction
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key |
| type | text | "income" or "expense" |
| amount | integer | Stored in cents, always positive |
| walletId | text | Foreign key → Wallet |
| categoryId | text | Foreign key → Category |
| note | text | Optional, max 100 chars |
| date | integer | Transaction date timestamp |
| createdAt | integer | Unix timestamp |

## File Structure
```
db/
  schema.ts        # Drizzle table definitions
  client.ts        # Database connection
  migrations/      # SQL migrations
  seed.ts          # Default categories

stores/
  wallet-store.ts
  category-store.ts
  transaction-store.ts
```

## Default Categories

**Expense:** Food, Transport, Shopping, Bills, Entertainment, Health, Other
**Income:** Salary, Freelance, Investment, Gift, Other

## Balance Calculation
Wallet balance = initialBalance + sum(income transactions) - sum(expense transactions)
