export default function ScoreCard({ label, score, size = 'md' }: { label: string; score: number; size?: 'sm' | 'md' }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-600'
    if (s >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBgColor = (s: number) => {
    if (s >= 80) return 'bg-green-50'
    if (s >= 60) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  const sizeClasses = size === 'sm' ? 'p-2' : 'p-4'

  return (
    <div className={`${getBgColor(score)} ${sizeClasses} rounded-lg text-center`}>
      <div className={`text-${size === 'sm' ? 'lg' : '2xl'} font-bold ${getColor(score)}`}>
        {Math.round(score)}
      </div>
      <div className={`text-${size === 'sm' ? 'xs' : 'sm'} text-gray-600`}>{label}</div>
    </div>
  )
}
