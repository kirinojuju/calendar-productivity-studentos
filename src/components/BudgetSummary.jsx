import { useWorkspace } from '../context/WorkspaceContext.jsx'
import { financeSummary } from '../utils/finance.js'
import { formatMoney } from '../utils/dates.js'

export default function BudgetSummary() {
  const { workspace } = useWorkspace()
  const { dailyAllowance, spentToday, spendable } = financeSummary(workspace.finance)
  const totalToday = dailyAllowance + spentToday
  const percent = totalToday ? Math.min(100, Math.round(spentToday / totalToday * 100)) : 0
  return (
    <div className="budget-summary">
      <div className="budget-heading">
        <span><span className="budget-square" /> Daily allowance</span>
        <strong>{formatMoney(dailyAllowance)}</strong>
      </div>
      <div className="budget-bar">
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="budget-metrics">
        <span>{formatMoney(spentToday)}<small>Spent today</small></span>
        <span className="remaining">{formatMoney(spendable)}<small>Spendable</small></span>
        <span>{percent}%<small>Today used</small></span>
      </div>
    </div>
  )
}
