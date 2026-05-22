export function Spinner() {
  return <span className="spinner" />
}

export function ServiceCheckGrid({ services, selected, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 10 }}>
      {services.map(s => {
        const checked = selected.includes(s)
        return (
          <label
            key={s}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: checked ? 'rgba(193,96,58,0.07)' : 'var(--cream)',
              border: `1.5px solid ${checked ? 'var(--terracotta)' : 'var(--cream-dark)'}`,
              borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
              fontSize: 12, fontWeight: checked ? 600 : 400,
              color: checked ? 'var(--terracotta)' : 'var(--text-mid)',
              transition: 'all 0.15s'
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => {
                onChange(checked ? selected.filter(x => x !== s) : [...selected, s])
              }}
              style={{ accentColor: 'var(--terracotta)', width: 14, height: 14 }}
            />
            {s}
          </label>
        )
      })}
    </div>
  )
}
