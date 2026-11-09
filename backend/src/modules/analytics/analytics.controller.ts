import { Request, Response } from "express";
import { PurchaseOrder } from "../../models/PurchaseOrder.js";
import { Business } from "../../models/Business.js";
import { sendSuccess } from "../../utils/response.js";
import { ORDER_STATUS } from "../../config/constants.js";

export class AnalyticsController {
  static async getSummary(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;

    const business = await Business.findById(businessId);
    const monthlyBudgetPaise = business?.monthlyBudgetPaise || 20000000;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Fetch all business orders
    const allOrders = await PurchaseOrder.find({ businessId }).sort({ createdAt: -1 });

    const paidOrders = allOrders.filter((o) => o.status === ORDER_STATUS.PAID);
    const totalSpendPaise = paidOrders.reduce((sum, o) => sum + o.totalPaise, 0);

    const thisMonthPaidOrders = paidOrders.filter((o) => new Date(o.createdAt) >= startOfMonth);
    const spendThisMonthPaise = thisMonthPaidOrders.reduce((sum, o) => sum + o.totalPaise, 0);

    // Orders count by status
    const ordersCount: Record<string, number> = {
      [ORDER_STATUS.DRAFT]: 0,
      [ORDER_STATUS.PENDING_APPROVAL]: 0,
      [ORDER_STATUS.APPROVED]: 0,
      [ORDER_STATUS.REJECTED]: 0,
      [ORDER_STATUS.PAYMENT_PENDING]: 0,
      [ORDER_STATUS.PAID]: 0,
      [ORDER_STATUS.PAYMENT_FAILED]: 0,
      [ORDER_STATUS.CANCELLED]: 0,
    };
    for (const o of allOrders) {
      ordersCount[o.status] = (ordersCount[o.status] || 0) + 1;
    }

    // Average savings
    const totalSavings = allOrders.reduce((sum, o) => sum + (o.estimatedSavingsPaise || 0), 0);
    const averageSavingsPaise = allOrders.length > 0 ? Math.round(totalSavings / allOrders.length) : 0;

    // Top suppliers by spend
    const supplierSpendMap = new Map<string, { supplierName: string; totalSpendPaise: number; orderCount: number }>();
    for (const o of paidOrders) {
      for (const sg of o.supplierGroups) {
        const sName = sg.supplierName;
        const existing = supplierSpendMap.get(sName);
        const groupTotal = sg.subtotalPaise + sg.shippingPaise;
        if (!existing) {
          supplierSpendMap.set(sName, {
            supplierName: sName,
            totalSpendPaise: groupTotal,
            orderCount: 1,
          });
        } else {
          existing.totalSpendPaise += groupTotal;
          existing.orderCount += 1;
        }
      }
    }

    const topSuppliers = Array.from(supplierSpendMap.values())
      .sort((a, b) => b.totalSpendPaise - a.totalSpendPaise)
      .slice(0, 5);

    // Monthly spend last 6 months
    const monthlySpend: Array<{ month: string; spendPaise: number; orderCount: number }> = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = `${monthNames[month]} ${year}`;

      const monthOrders = paidOrders.filter((o) => {
        const od = new Date(o.createdAt);
        return od.getFullYear() === year && od.getMonth() === month;
      });

      const spend = monthOrders.reduce((sum, o) => sum + o.totalPaise, 0);
      monthlySpend.push({
        month: label,
        spendPaise: spend,
        orderCount: monthOrders.length,
      });
    }

    // Budget utilization
    const budgetUtilisationPercent =
      monthlyBudgetPaise > 0 ? Math.min(100, Math.round((spendThisMonthPaise / monthlyBudgetPaise) * 100)) : 0;

    // Recent 5 orders
    const recentOrders = allOrders.slice(0, 5);

    sendSuccess(res, {
      totalSpendPaise,
      spendThisMonthPaise,
      monthlyBudgetPaise,
      budgetUtilisationPercent,
      ordersCount,
      averageSavingsPaise,
      topSuppliers,
      monthlySpend,
      recentOrders,
    });
  }
}
