export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  active: boolean;
  commissionEnabled: boolean;
  createdAt: string;
}

export type ProductUnit = 'gramas' | 'kg' | 'unidade' | 'pacote';

export interface Product {
  id: string;
  code: string;
  name: string;
  photo?: string;
  salePrice: number;
  costPrice?: number;
  stock: number;
  unit: ProductUnit;
  minStockAlert?: number;
  commissionPercentage?: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: ProductUnit;
  price: number;
  total: number;
  commission?: number; // New field
}

export type PaymentMethod = 'Dinheiro' | 'PIX' | 'Crédito' | 'Débito' | 'Boleto';

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  profit: number;
  commissionTotal?: number; // New field
  employeeId: string;
  employeeName: string;
  customerName: string;
  companyName?: string;
  address: {
    street: string;
    neighborhood: string;
    number: string;
  };
  paymentMethod: PaymentMethod;
  timestamp: string;
}

export interface DashboardStats {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  estimatedProfit: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
  salesHistory: { date: string; total: number }[];
}
