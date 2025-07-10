/* eslint-disable @typescript-eslint/no-explicit-any */
import { Id } from "@/convex/_generated/dataModel";

export interface User {
  _id: Id<"users">;
  name: string;
  email: string;
  image?: string;
  clerkId: string;
  isActive?: boolean;
  lastActiveAt?: number;
  createdAt: number;
  role?: "user" | "admin";
}

export interface ShoppingList {
  _id: Id<"shopping_lists">;
  name: string;
  description?: string;
  userId: Id<"users">;
  isCompleted: boolean;
  scheduledDate?: number;
  priority: "low" | "medium" | "high";
  color?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface ListItem {
  _id: Id<"list_items">;
  name: string;
  description?: string;
  listId: Id<"shopping_lists">;
  userId: Id<"users">;
  categoryId?: Id<"categories">;
  quantity: number;
  unit?: string;
  price?: number;
  isCompleted: boolean;
  priority: "low" | "medium" | "high";
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface Category {
  _id: Id<"categories">;
  name: string;
  description?: string;
  color: string;
  icon: string;
  userId?: Id<"users">;
  isSystem: boolean;
  createdAt: number;
}

export interface ItemTemplate {
  _id: Id<"item_templates">;
  name: string;
  categoryId?: Id<"categories">;
  userId: Id<"users">;
  defaultQuantity: number;
  defaultUnit?: string;
  usageCount: number;
  lastUsed: number;
  createdAt: number;
}

export interface SharedList {
  _id: Id<"shared_lists">;
  listId: Id<"shopping_lists">;
  sharedWithUserId: Id<"users">;
  sharedByUserId: Id<"users">;
  permission: "view" | "edit";
  acceptedAt?: number;
  createdAt: number;
}

export interface Notification {
  _id: Id<"notifications">;
  userId: Id<"users">;
  type: "list_shared" | "reminder" | "list_completed";
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: number;
}

export interface ActivityLog {
  _id: Id<"activity_logs">;
  userId: Id<"users">;
  action: string;
  entityType: string;
  entityId: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: number;
}

export type Priority = "low" | "medium" | "high";
export type Permission = "view" | "edit";
export type NotificationType = "list_shared" | "reminder" | "list_completed";

export interface CreateListData {
  name: string;
  description?: string;
  scheduledDate?: number;
  priority: Priority;
  color?: string;
}

export interface CreateItemData {
  name: string;
  description?: string;
  categoryId?: Id<"categories">;
  quantity: number;
  unit?: string;
  price?: number;
  priority: Priority;
}

export interface UpdateItemData {
  name?: string;
  description?: string;
  categoryId?: Id<"categories">;
  quantity?: number;
  unit?: string;
  price?: number;
  priority?: Priority;
  isCompleted?: boolean;
}

export interface ListWithItems extends ShoppingList {
  items: (ListItem & { category?: Category })[];
  itemCount: number;
  completedCount: number;
  totalPrice: number;
}

export interface UserStats {
  totalLists: number;
  completedLists: number;
  totalItems: number;
  completedItems: number;
  categoriesUsed: number;
  avgItemsPerList: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalLists: number;
  totalItems: number;
  recentActivity: ActivityLog[];
}