export default function ScoreCard({ label, score, size = 'md' }: { label: string; score: number; size?: 'sm' | 'md' }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444'
  const bgColor = score >= 80 ? 'rgba(34,197,94,0.08)' : score >= 60 ? 'rgba(234,179,8,0.08)' : 'rgba(239,68,68,0.08)'
  const dim = size === 'sm' ? '72px' : '100px'

  return (
    <div style={{
      width: dim,
      height: dim,
      background: bgColor,
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2px',
    }}>
      <div style={{ fontSize: size === 'sm' ? '20px' : '28px', fontWeight: '700', color }}>{Math.round(score)}</div>
      <div style={{ fontSize: size === 'sm' ? '10px' : '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{label}</div>
    </div>
  )
}
