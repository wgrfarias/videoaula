export const ROLES = {
  ADMIN: "ADMIN",
  INSTRUCTOR: "INSTRUCTOR",
  STUDENT: "STUDENT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ORDER_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELED: "CANCELED",
  REFUNDED: "REFUNDED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const COMMENT_VISIBILITY = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
} as const;

export type CommentVisibility = (typeof COMMENT_VISIBILITY)[keyof typeof COMMENT_VISIBILITY];

export const TICKET_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  CLOSED: "CLOSED",
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];
