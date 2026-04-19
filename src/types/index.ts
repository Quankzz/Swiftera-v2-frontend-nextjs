/**
 * Legacy shared domain types.
 *
 * For new code, prefer:
 *   - api.types.ts       - backend wire format (source of truth)
 *   - dashboard.ts       - admin portal CRUD types (User/Role/Permission/ContactTicket)
 *   - dashboard.types.ts - staff portal UI types (DashboardOrder, OrderStatus, etc.)
 *   - catalog.ts         - catalog/product UI types
 *   - map.types.ts       - map UI types
 */

// ─── Base entity ──────────────────────────────────────────────────────────────
export interface BaseEntity {
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

// ─── Legacy auth user ─────────────────────────────────────────────────────────
/**
 * Used by AuthContext.tsx (legacy auth context).
 * For modern auth, use UserSecuredResponse from @/types/api.types.
 */
export interface User extends BaseEntity {
  user_id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  cccd_number?: string;
  cccd_front_url?: string;
  cccd_back_url?: string;
  is_verified: boolean;
}
