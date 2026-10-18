export type Role = "ADMIN" | "STAFF";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";

export type PaymentMethod = "CASH" | "CARD" | "MOBILE_BANKING";

export type PurchaseOrderStatus = "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";

export type SaleStatus = "COMPLETED" | "VOIDED";

export type StockMovementType = "SALE" | "PURCHASE" | "ADJUSTMENT" | "RETURN" | "REVERSAL";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: PaginationMeta;
  data: T;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  avatar?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  barcode?: string | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  supplierId: string;
  supplier?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  avatar?: string | null;
  unitPrice: string | number;
  costPrice: string | number;
  stockQty: number;
  reorderLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    barcode?: string | null;
  };
  quantity: number;
  unitPrice: string | number;
  unitCost: string | number;
  lineTotal: string | number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  staffId: string;
  staff?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  customerName?: string | null;
  subtotal: string | number;
  discount: string | number;
  totalAmount: string | number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  createdAt: string;
  updatedAt: string;
  items?: SaleItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    stockQty: number;
  };
  quantity: number;
  unitCost: string | number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier?: Supplier;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  status: PurchaseOrderStatus;
  note?: string | null;
  totalCost: string | number;
  orderedAt?: string | null;
  receivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: PurchaseOrderItem[];
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  type: StockMovementType;
  quantityChange: number;
  saleItemId?: string | null;
  purchaseOrderItemId?: string | null;
  note?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}
