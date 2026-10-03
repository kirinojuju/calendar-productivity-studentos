export function validateWorkspace(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  const arrays = ['courses', 'routine', 'tasks', 'events', 'notes']
  if (arrays.some(key => !Array.isArray(data[key]) || data[key].length > 10000)) return false
  if (!data.finance || typeof data.finance !== 'object' || Array.isArray(data.finance)) return false
  if (!Array.isArray(data.finance.transactions) || data.finance.transactions.length > 10000) return false
  for (const items of [...arrays.map(key => data[key]), data.finance.transactions]) {
    if (items.some(item => !item || typeof item !== 'object' || Array.isArray(item) || typeof item.id !== 'string' || item.id.length < 1 || item.id.length > 128)) return false
  }
  return true
}
