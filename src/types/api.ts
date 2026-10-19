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

export interface UpdateProfilePayload {
  name?: string;
  phone?: string | null;
  avatar?: string | null;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string | null;
}

export interface StaffSalesSummary {
  todaySalesCount: number;
  todaySalesTotal: number;
  rangeSalesCount: number;
  rangeSalesTotal: number;
  completedSalesCount: number;
  voidedSalesCount: number;
}

export interface StaffActivity {
  id: string;
  type: "SALE_CREATED" | "SALE_VOIDED" | "STOCK_MOVEMENT" | "PURCHASE_ORDER";
  entityId: string;
  entityType: string;
  description: string;
  timestamp: string;
  status: string;
}

export type RestockPriority = "HIGH" | "MEDIUM" | "LOW";
export type ForecastConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface RestockRecommendation {
  productId: string;
  name: string;
  sku: string;
  categoryName: string;
  supplierName: string;
  supplierId: string;
  currentStock: number;
  reorderLevel: number;
  costPrice: number;
  unitPrice: number;
  unitsSoldInPeriod: number;
  averageDailyDemand: number;
  demandTrend: "UP" | "DOWN" | "STABLE" | "INSUFFICIENT_DATA";
  estimatedDaysRemaining: number;
  incomingStock: number;
  suggestedRestockQuantity: number;
  estimatedRestockCost: number;
  priority: RestockPriority;
  confidence: ForecastConfidence;
  reason: string;
  warnings: string[];
  aiGenerated: boolean;
}

export interface RestockSummary {
  totalAnalyzedProducts: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  belowReorderCount: number;
  criticalRunoutCount: number;
  totalEstimatedRestockCost: number;
  planningHorizonDays: number;
  analysisPeriodDays: number;
  aiStatus: "ONLINE" | "DETERMINISTIC_FALLBACK" | "CONFIG_REQUIRED";
  aiModel: string;
  lastGeneratedAt: string;
}

export interface DailySalesHistory {
  date: string;
  quantity: number;
}

export interface ProductForecastDetail {
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    supplier: {
      id: string;
      name: string;
      email?: string | null;
      phone?: string | null;
    };
    currentStock: number;
    reorderLevel: number;
    costPrice: number;
    unitPrice: number;
  };
  metrics: {
    analysisPeriodDays: number;
    planningHorizonDays: number;
    unitsSoldInPeriod: number;
    averageDailyDemand: number;
    demandTrend: "UP" | "DOWN" | "STABLE" | "INSUFFICIENT_DATA";
    estimatedDaysRemaining: number;
    incomingStock: number;
    targetStock: number;
    suggestedRestockQuantity: number;
    estimatedCost: number;
  };
  salesHistory: DailySalesHistory[];
  recommendation: {
    priority: RestockPriority;
    confidence: ForecastConfidence;
    reason: string;
    warnings: string[];
    aiGenerated: boolean;
  };
  aiStatus: "ONLINE" | "DETERMINISTIC_FALLBACK" | "CONFIG_REQUIRED";
  aiModel: string;
}

export interface RestockRecommendationsResult {
  summary: RestockSummary;
  recommendations: RestockRecommendation[];
}


