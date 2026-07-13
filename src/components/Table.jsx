import { Icon } from './Icon.jsx'

export function Th({ children, field, sort, setSort, num, w }) {
  const active = sort?.field === field
  return (
    <th style={{ width: w, textAlign: num ? 'right' : 'left' }}>
      <span
        className="th-inner"
        onClick={() =>
          setSort(s => ({
            field,
            dir: s.field === field && s.dir === 'asc' ? 'desc' : 'asc',
          }))
        }
      >
        {children}
        {active && <Icon name={sort.dir === 'asc' ? 'chevronUp' : 'chevronDown'} size={11} />}
      </span>
    </th>
  )
}

export function sortBy(arr, sort) {
  if (!sort?.field) return arr
  return [...arr].sort((a, b) => {
    const va = a[sort.field], vb = b[sort.field]
    if (va == null) return 1
    if (vb == null) return -1
    if (typeof va === 'number' && typeof vb === 'number')
      return sort.dir === 'asc' ? va - vb : vb - va
    return sort.dir === 'asc'
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va))
  })
}
