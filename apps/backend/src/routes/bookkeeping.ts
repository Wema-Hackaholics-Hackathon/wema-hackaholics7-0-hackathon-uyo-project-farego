import { Router } from "express";
import { z } from "zod";
import { ExpenseCategory, PaymentStatus } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { koboToNaira, nairaToKobo } from "../lib/money.js";
import { requireDriver } from "../middleware/auth.js";

export const bookkeepingRouter = Router();

bookkeepingRouter.use(requireDriver);

const lagosDayRange = () => {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const start = new Date(`${date}T00:00:00+01:00`);
  const end = new Date(start.getTime() + 86_400_000);
  return { start, end };
};

bookkeepingRouter.get("/", async (req, res) => {
  const { start, end } = lagosDayRange();
  const driverId = req.driver!.id;
  const [payments, expenses, driver] = await Promise.all([
    prisma.payment.aggregate({
      where: { driverId, status: PaymentStatus.COMPLETED, completedAt: { gte: start, lt: end } },
      _sum: { amountKobo: true },
    }),
    prisma.expense.findMany({
      where: { driverId, incurredAt: { gte: start, lt: end } },
      orderBy: { incurredAt: "desc" },
    }),
    prisma.driver.findUniqueOrThrow({ where: { id: driverId }, select: { fullName: true } }),
  ]);

  const earningsKobo = payments._sum.amountKobo ?? 0n;
  const expensesKobo = expenses.reduce((total, expense) => total + expense.amountKobo, 0n);
  const netProfitKobo = earningsKobo - expensesKobo;

  res.json({
    driver: { fullName: driver.fullName },
    date: start.toISOString(),
    earnings: koboToNaira(earningsKobo),
    totalExpenses: koboToNaira(expensesKobo),
    netProfit: koboToNaira(netProfitKobo),
    profitMargin: earningsKobo > 0n ? Math.round(Number(netProfitKobo * 100n / earningsKobo)) : 0,
    expenses: expenses.map((expense) => ({
      id: expense.id,
      category: expense.category,
      amount: koboToNaira(expense.amountKobo),
      note: expense.note,
      incurredAt: expense.incurredAt,
    })),
  });
});

bookkeepingRouter.post("/expenses", async (req, res) => {
  const input = z.object({
    category: z.nativeEnum(ExpenseCategory),
    amount: z.number().positive().max(10_000_000),
    note: z.string().trim().max(140).optional(),
  }).parse(req.body);

  const expense = await prisma.expense.create({
    data: {
      driverId: req.driver!.id,
      category: input.category,
      amountKobo: nairaToKobo(input.amount),
      note: input.note || null,
    },
  });

  res.status(201).json({
    id: expense.id,
    category: expense.category,
    amount: koboToNaira(expense.amountKobo),
    note: expense.note,
    incurredAt: expense.incurredAt,
  });
});

bookkeepingRouter.delete("/expenses/:id", async (req, res) => {
  const expense = await prisma.expense.findFirst({
    where: { id: req.params.id, driverId: req.driver!.id },
  });
  if (!expense) throw new AppError(404, "Expense not found", "EXPENSE_NOT_FOUND");
  await prisma.expense.delete({ where: { id: expense.id } });
  res.status(204).send();
});
