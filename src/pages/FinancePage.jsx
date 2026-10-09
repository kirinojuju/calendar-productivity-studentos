import { useState } from 'react'
import { useWorkspace } from '../context/WorkspaceContext.jsx'
import { dateKey, formatMoney } from '../utils/dates.js'
import { financeSummary } from '../utils/finance.js'
import Icon from '../components/Icon.jsx'

const categories = ['Food', 'Transport', 'Study', 'Housing', 'Health', 'Shopping', 'Other']

export default function FinancePage() {
  const { workspace, actions } = useWorkspace()
  const finance = workspace.finance
  const today = dateKey(new Date())
  const summary = financeSummary(finance, today)
  const [draft, setDraft] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: today,
  })
  const [error, setError] = useState('')

  function change(name, value) {
    setDraft(current => ({ ...current, [name]: value }))
  }

  function addTransaction(event) {
    event.preventDefault()
    const amount = Number(draft.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }
    actions.addTransaction({ ...draft, title: draft.title.trim(), amount })
    setDraft(current => ({ ...current, title: '', amount: '' }))
    setError('')
  }

  let insight
  if (summary.balance < finance.savingGoal) {
    insight = 'Your current balance is below your saving goal. Review recent expenses or adjust the goal.'
  } else if (summary.daysRemaining <= 3) {
    insight = 'The period ends soon. Check planned payments before using the remaining balance.'
  } else {
    insight = `Keeping daily spending near ${formatMoney(summary.dailyAllowance)} leaves your saving goal protected through ${finance.periodEnd}.`
  }

  return (
    <div className="module-page finance-page">
      <div className="module-heading">
        <div>
          <span className="eyebrow">SPEND WITH CLARITY</span>
          <h1>Finance</h1>
          <p>Know what you can safely spend each day.</p>
        </div>
      </div>

      <div className="finance-kpis">
        <div className="finance-kpi primary">
          <span>Recommended per day</span>
          <strong>{formatMoney(summary.dailyAllowance)}</strong>
          <small>{summary.daysRemaining} day{summary.daysRemaining === 1 ? '' : 's'} remaining in this period</small>
        </div>
        <div className="finance-kpi">
          <span>Current balance</span>
          <strong>{formatMoney(summary.balance)}</strong>
          <small>After recorded transactions</small>
        </div>
        <div className="finance-kpi">
          <span>Protected savings</span>
          <strong>{formatMoney(finance.savingGoal)}</strong>
          <small>{formatMoney(summary.spendable)} available to spend</small>
        </div>
      </div>

      <div className="finance-layout">
        <section className="finance-card">
          <div className="card-heading">
            <h2>Spending plan</h2>
            <span>Adjust as your situation changes</span>
          </div>
          <div className="finance-fields">
            <label>
              Starting money
              <input type="number" min="0" step="0.01" value={finance.openingBalance}
                onChange={event => actions.updateFinance({
                  openingBalance: Math.max(0, Number(event.target.value) || 0),
                })} />
            </label>
            <label>
              Savings goal
              <input type="number" min="0" step="0.01" value={finance.savingGoal}
                onChange={event => actions.updateFinance({
                  savingGoal: Math.max(0, Number(event.target.value) || 0),
                })} />
            </label>
            <label>
              Plan through
              <input type="date" min={today} value={finance.periodEnd}
                onChange={event => actions.updateFinance({
                  periodEnd: event.target.value || today,
                })} />
            </label>
          </div>
          <div className="finance-formula">
            <span>Balance − savings goal</span>
            <span>÷ {summary.daysRemaining} {summary.daysRemaining === 1 ? 'day' : 'days'}</span>
            <strong>= {formatMoney(summary.dailyAllowance)} / day</strong>
          </div>
        </section>

        <section className="finance-card">
          <div className="card-heading">
            <h2>Record money</h2>
            <span>Every entry updates your daily amount</span>
          </div>
          <form className="transaction-form" onSubmit={addTransaction}>
            <div className="form-row">
              <label>
                Type
                <select value={draft.type} onChange={event => change('type', event.target.value)}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
              <label>
                Amount (฿)
                <input type="number" min="0.01" step="0.01" required value={draft.amount}
                  onChange={event => change('amount', event.target.value)} />
              </label>
            </div>
            <label>
              Description
              <input required maxLength="100" value={draft.title}
                onChange={event => change('title', event.target.value)}
                placeholder="Lunch, part-time work..." />
            </label>
            <div className="form-row">
              <label>
                Category
                <select value={draft.category}
                  onChange={event => change('category', event.target.value)}>
                  {categories.map(category => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label>
                Date
                <input type="date" required value={draft.date}
                  onChange={event => change('date', event.target.value)} />
              </label>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button" type="submit">
              <Icon name="plus" size={15} /> Add entry
            </button>
          </form>
        </section>
      </div>

      <div className="finance-layout lower">
        <section className="finance-card">
          <div className="card-heading">
            <h2>Recent transactions</h2>
            <span>{finance.transactions.length} entries</span>
          </div>
          <div className="transaction-list">
            {finance.transactions.length === 0 && (
              <p className="empty-column">No transactions yet.</p>
            )}
            {finance.transactions.map(item => (
              <div className="transaction-row" key={item.id}>
                <span className={`transaction-icon ${item.type}`}>
                  {item.type === 'income' ? '+' : '−'}
                </span>
                <span className="transaction-info">
                  <strong>{item.title}</strong>
                  <small>{item.date} · {item.category}</small>
                </span>
                <strong className={item.type}>
                  {item.type === 'income' ? '+' : '−'}{formatMoney(item.amount)}
                </strong>
                <button className="plain-icon" aria-label={`Delete ${item.title}`}
                  onClick={() => actions.deleteTransaction(item.id)}>
                  <Icon name="trash" size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="finance-card insight-card">
          <div className="card-heading">
            <h2>Budget insight</h2>
            <span>Based on your entries</span>
          </div>
          <p>{insight}</p>
          <div className="insight-stats">
            <span>Income <strong>{formatMoney(summary.totalIncome)}</strong></span>
            <span>Expenses <strong>{formatMoney(summary.totalExpenses)}</strong></span>
            <span>Spent today <strong>{formatMoney(summary.spentToday)}</strong></span>
          </div>
          <p className="module-hint">AI analysis and receipt image reading are not connected yet.</p>
        </section>
      </div>
    </div>
  )
}
