import { dateKey, fromDateKey } from './dates.js'

export function financeSummary(finance, today = dateKey(new Date())) {
  const totalIncome = finance.transactions.filter(item => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0)
  const totalExpenses = finance.transactions.filter(item => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0)
  const balance = Number(finance.openingBalance) + totalIncome - totalExpenses
  const daysRemaining = Math.max(1, Math.round((fromDateKey(finance.periodEnd) - fromDateKey(today)) / 86400000) + 1)
  const spendable = Math.max(0, balance - Number(finance.savingGoal))
  const dailyAllowance = spendable / daysRemaining
  const spentToday = finance.transactions.filter(item => item.type === 'expense' && item.date === today).reduce((sum, item) => sum + Number(item.amount), 0)
  return { balance, spendable, daysRemaining, dailyAllowance, spentToday, totalIncome, totalExpenses }
}
