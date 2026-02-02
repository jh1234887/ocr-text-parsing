import type { ProductionPlan, ProductionCheck } from "./types"

export const mockProductionPlans: ProductionPlan[] = [
  {
    id: "plan-1",
    line: "A",
    productName: "비타500ACE(20입)",
    specification: "20입",
    productCode: "71053",
    lotNumber: "26006",
    plannedQuantity: 460000,
    weekStartDate: "2024-01-29",
  },
  {
    id: "plan-2",
    line: "B",
    productName: "시험생산(TEST)",
    specification: "",
    productCode: "",
    lotNumber: "",
    plannedQuantity: 460000,
    weekStartDate: "2024-01-29",
  },
  {
    id: "plan-3",
    line: "C",
    productName: "비타오리지널",
    specification: "100입",
    productCode: "70741",
    lotNumber: "26021",
    plannedQuantity: 460000,
    weekStartDate: "2024-01-29",
  },
]

export const mockProductionChecks: ProductionCheck[] = [
  {
    id: "check-1",
    planId: "plan-1",
    checkTime: "09:42",
    producedQuantity: 40200,
    createdAt: "2024-01-29T09:42:00",
    createdBy: "operator-1",
  },
  {
    id: "check-3",
    planId: "plan-3",
    checkTime: "09:46",
    producedQuantity: 60900,
    createdAt: "2024-01-29T09:46:00",
    createdBy: "operator-1",
  },
]
