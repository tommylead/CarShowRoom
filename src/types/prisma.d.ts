import { PrismaClient } from '@prisma/client';

// Định nghĩa các kiểu đã chuyển từ enum sang string
declare global {
  namespace PrismaClient {
    export type CarType = "SUV" | "SEDAN" | "COUPE" | "TRUCK" | "VAN";
    export type Role = "USER" | "ADMIN";
    export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  }
}

export {}; 