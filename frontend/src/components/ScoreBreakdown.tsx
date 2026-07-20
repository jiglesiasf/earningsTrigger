'use client'

import { useTranslation } from '@/lib/i18n'

function Bar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
    </div>
  )
}

function CalcRow({ label, value, note, impact, impactColor }: { label: string; value: string | number; note?: string; impact: 'positive' | 'negative' | 'neutral'; impactColor?: string }) {
  const { t } = useTranslation()
  const dotColor = impact === 'positive' ? '#22c55e' : impact === 'negative' ? '#ef4444' : '#555'
  const impactText = impact === 'positive' ? t('score.positive') : impact === 'negative' ? t('score.negative') : t('score.neutral')
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{label}</div>
        {note && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{note}</div>}
      </div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: impactColor || 'var(--text-primary)', textAlign: 'right' }}>{value}</div>
      <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: `${dotColor}20`, color: dotColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
        {impactText}
      </div>
    </div>
  )
}

function SectionHeader({ title, score, weight, color }: { title: string; score: number; weight: number; color: string }) {
  const { t } = useTranslation()
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: color }} />
        <span style={{ fontSize: '15px', fontWeight: '600' }}>{title}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '4px' }}>
          {t('score.weight', { n: Math.round(weight * 100) })}
        </span>
      </div>
      <div style={{
        fontSize: '20px', fontWeight: '700', color,
        background: `${color}15`, padding: '4px 12px', borderRadius: '8px',
      }}>
        {Math.round(score)}
      </div>
    </div>
  )
}

export function TechnicalBreakdown({ data, score }: { data: any; score: number }) {
  const { t } = useTranslation()
  if (!data) return null
  const trend = data.trend || {}
  const momentum = data.momentum || {}
  const volume = data.volume || {}
  const structure = data.price_structure || {}

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <SectionHeader title={t('technical.title')} score={score} weight={0.30} color="#3b82f6" />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('technical.trend')}</div>
      <CalcRow label={t('technical.price_above_20ema')} value={trend.price_above_20_ema ? t('score.yes') : t('score.no')} impact={trend.price_above_20_ema ? 'positive' : 'negative'} note={t('technical.price_above_20ema_note')} />
      <CalcRow label={t('technical.price_above_50sma')} value={trend.price_above_50_sma ? t('score.yes') : t('score.no')} impact={trend.price_above_50_sma ? 'positive' : 'negative'} note={t('technical.price_above_50sma_note')} />
      <CalcRow label={t('technical.price_above_200sma')} value={trend.price_above_200_sma ? t('score.yes') : t('score.no')} impact={trend.price_above_200_sma ? 'positive' : 'negative'} note={t('technical.price_above_200sma_note')} />
      <CalcRow label={t('technical.golden_cross')} value={trend.golden_cross ? t('score.yes') : t('score.no')} impact={trend.golden_cross ? 'positive' : 'neutral'} note={t('technical.golden_cross_note')} impactColor={trend.golden_cross ? '#22c55e' : undefined} />
      <CalcRow label={t('technical.death_cross')} value={trend.death_cross ? t('score.yes') : t('score.no')} impact={trend.death_cross ? 'negative' : 'neutral'} note={t('technical.death_cross_note')} impactColor={trend.death_cross ? '#ef4444' : undefined} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('technical.momentum')}</div>
      <CalcRow label={t('technical.rsi')} value={momentum.rsi_14} note={momentum.rsi_14 > 70 ? t('technical.rsi_overbought') : momentum.rsi_14 < 30 ? t('technical.rsi_oversold') : momentum.rsi_14 >= 50 ? t('technical.rsi_bullish') : t('technical.rsi_weak')} impact={momentum.rsi_14 >= 50 && momentum.rsi_14 <= 68 ? 'positive' : 'negative'} impactColor={momentum.rsi_14 >= 50 && momentum.rsi_14 <= 68 ? '#22c55e' : '#ef4444'} />
      <CalcRow label={t('technical.macd')} value={momentum.macd_histogram?.toFixed(4)} note={momentum.macd_histogram > 0 ? t('technical.macd_bullish') : t('technical.macd_bearish')} impact={momentum.macd_histogram > 0 ? 'positive' : 'negative'} />
      <CalcRow label={t('technical.adx')} value={momentum.adx} note={momentum.adx > 25 ? t('technical.adx_strong') : t('technical.adx_weak')} impact={momentum.adx > 25 ? 'positive' : 'neutral'} />
      <CalcRow label={t('technical.momentum_assessment')} value={momentum.momentum_score} impact={momentum.momentum_score === 'strong' ? 'positive' : momentum.momentum_score === 'weak' ? 'negative' : 'neutral'} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('technical.volume')}</div>
      <CalcRow label={t('technical.obv_trend')} value={volume.obv_trend} impact={volume.obv_trend === 'up' ? 'positive' : 'negative'} note={t('technical.obv_note')} />
      <CalcRow label={t('technical.volume_vs_avg')} value={volume.volume_trend} impact={volume.volume_trend === 'above_avg' ? 'positive' : 'negative'} note={t('technical.volume_note')} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('technical.price_structure')}</div>
      <CalcRow label={t('technical.dist_resistance')} value={`${structure.distance_to_resistance_pct}%`} impact={structure.distance_to_resistance_pct > 3 ? 'positive' : 'negative'} note={structure.distance_to_resistance_pct > 3 ? t('technical.dist_resistance_note_room') : t('technical.dist_resistance_note_close')} />
      <CalcRow label={t('technical.dist_support')} value={`${structure.distance_to_support_pct}%`} impact={structure.distance_to_support_pct > 3 ? 'positive' : 'neutral'} note={t('technical.dist_support_note')} />
    </div>
  )
}

export function FundamentalBreakdown({ data, score }: { data: any; score: number }) {
  const { t } = useTranslation()
  if (!data) return null

  const growthScore = (data.revenue_growth_yoy > 20) ? 'strong' : (data.revenue_growth_yoy > 10) ? 'good' : (data.revenue_growth_yoy > 0) ? 'moderate' : 'weak'
  const marginScore = (data.gross_margin > 50) ? 'high' : (data.gross_margin > 30) ? 'decent' : 'low'
  const pegScore = (data.peg_ratio > 0 && data.peg_ratio < 1) ? 'undervalued' : (data.peg_ratio <= 2) ? 'fair' : 'overvalued'

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <SectionHeader title={t('fundamental.title')} score={score} weight={0.20} color="#a855f7" />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('fundamental.growth')}</div>
      <CalcRow label={t('fundamental.revenue_growth')} value={`${data.revenue_growth_yoy}%`} note={growthScore === 'strong' ? t('fundamental.revenue_growth_strong') : growthScore === 'good' ? t('fundamental.revenue_growth_good') : growthScore === 'moderate' ? t('fundamental.revenue_growth_moderate') : t('fundamental.revenue_growth_negative')} impact={data.revenue_growth_yoy > 10 ? 'positive' : data.revenue_growth_yoy > 0 ? 'neutral' : 'negative'} />
      <CalcRow label={t('fundamental.eps_growth')} value={`${data.eps_growth_yoy}%`} note={data.eps_growth_yoy > 20 ? t('fundamental.eps_growth_strong') : data.eps_growth_yoy > 0 ? t('fundamental.eps_growth_growing') : t('fundamental.eps_growth_declining')} impact={data.eps_growth_yoy > 10 ? 'positive' : data.eps_growth_yoy > 0 ? 'neutral' : 'negative'} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('fundamental.profitability')}</div>
      <CalcRow label={t('fundamental.gross_margin')} value={`${data.gross_margin}%`} note={marginScore === 'high' ? t('fundamental.gross_margin_high') : marginScore === 'decent' ? t('fundamental.gross_margin_healthy') : t('fundamental.gross_margin_low')} impact={data.gross_margin > 40 ? 'positive' : data.gross_margin > 25 ? 'neutral' : 'negative'} />
      <CalcRow label={t('fundamental.operating_margin')} value={`${data.operating_margin}%`} note={data.operating_margin > 25 ? t('fundamental.operating_margin_excellent') : data.operating_margin > 15 ? t('fundamental.operating_margin_good') : t('fundamental.operating_margin_low')} impact={data.operating_margin > 20 ? 'positive' : data.operating_margin > 10 ? 'neutral' : 'negative'} />
      <CalcRow label={t('fundamental.net_margin')} value={`${data.net_margin}%`} impact={data.net_margin > 15 ? 'positive' : data.net_margin > 5 ? 'neutral' : 'negative'} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('fundamental.valuation')}</div>
      <CalcRow label={t('fundamental.peg_ratio')} value={data.peg_ratio} note={pegScore === 'undervalued' ? t('fundamental.peg_undervalued') : pegScore === 'fair' ? t('fundamental.peg_fair') : t('fundamental.peg_expensive')} impact={data.peg_ratio > 0 && data.peg_ratio < 1.5 ? 'positive' : data.peg_ratio < 3 ? 'neutral' : 'negative'} />
      <CalcRow label={t('fundamental.forward_pe')} value={data.forward_pe} note={data.forward_pe < 20 ? t('fundamental.forward_pe_reasonable') : data.forward_pe < 35 ? t('fundamental.forward_pe_growth') : t('fundamental.forward_pe_expensive')} impact={data.forward_pe < 25 ? 'positive' : data.forward_pe < 40 ? 'neutral' : 'negative'} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('fundamental.balance_sheet')}</div>
      <CalcRow label={t('fundamental.debt_equity')} value={data.debt_to_equity} note={data.debt_to_equity < 0.5 ? t('fundamental.debt_equity_conservative') : data.debt_to_equity < 1 ? t('fundamental.debt_equity_moderate') : t('fundamental.debt_equity_high')} impact={data.debt_to_equity < 0.8 ? 'positive' : data.debt_to_equity < 1.5 ? 'neutral' : 'negative'} />
      <CalcRow label={t('fundamental.current_ratio')} value={data.current_ratio} note={data.current_ratio > 1.5 ? t('fundamental.current_ratio_strong') : data.current_ratio > 1 ? t('fundamental.current_ratio_adequate') : t('fundamental.current_ratio_weak')} impact={data.current_ratio > 1.2 ? 'positive' : data.current_ratio > 0.8 ? 'neutral' : 'negative'} />
    </div>
  )
}

export function OptionsBreakdown({ data, score }: { data: any; score: number }) {
  const { t } = useTranslation()
  if (!data) return null

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <SectionHeader title={t('options.title')} score={score} weight={0.20} color="#f59e0b" />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('options.sentiment')}</div>
      <CalcRow label={t('options.put_call')} value={data.put_call_ratio} note={data.put_call_ratio < 0.7 ? t('options.put_call_very_bullish') : data.put_call_ratio < 0.9 ? t('options.put_call_bullish') : data.put_call_ratio > 1.3 ? t('options.put_call_very_bearish') : data.put_call_ratio > 1.1 ? t('options.put_call_bearish') : t('options.put_call_neutral')} impact={data.put_call_ratio < 0.8 ? 'positive' : data.put_call_ratio > 1.2 ? 'negative' : 'neutral'} />
      <CalcRow label={t('options.unusual_activity')} value={data.unusual_activity ? t('score.detected') : t('score.none')} impact={data.unusual_activity ? 'positive' : 'neutral'} note={t('options.unusual_note')} impactColor={data.unusual_activity ? '#22c55e' : undefined} />
      <CalcRow label={t('options.skew')} value={data.skew} note={data.skew === 'mild_call_skew' ? t('options.skew_call') : t('options.skew_put')} impact={data.skew === 'mild_call_skew' ? 'positive' : 'negative'} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('options.volatility')}</div>
      <CalcRow label={t('options.iv')} value={`${(data.implied_volatility * 100).toFixed(1)}%`} note={data.implied_volatility < 0.3 ? t('options.iv_low') : data.implied_volatility < 0.6 ? t('options.iv_normal') : data.implied_volatility < 0.8 ? t('options.iv_elevated') : t('options.iv_very_high')} impact={data.implied_volatility >= 0.3 && data.implied_volatility <= 0.6 ? 'positive' : data.implied_volatility > 0.8 ? 'negative' : 'neutral'} />
      <CalcRow label={t('options.expected_move')} value={`±${data.expected_move_pct}%`} note={data.expected_move_pct >= 5 && data.expected_move_pct <= 10 ? t('options.expected_move_good') : data.expected_move_pct > 15 ? t('options.expected_move_large') : t('options.expected_move_small')} impact={data.expected_move_pct >= 5 && data.expected_move_pct <= 10 ? 'positive' : data.expected_move_pct > 15 ? 'negative' : 'neutral'} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('options.volume_section')}</div>
      <CalcRow label={t('options.call_volume')} value={data.call_volume?.toLocaleString()} impact="neutral" />
      <CalcRow label={t('options.put_volume')} value={data.put_volume?.toLocaleString()} impact="neutral" />
    </div>
  )
}

export function SentimentBreakdown({ analyst, news, score }: { analyst: any; news: any; score: number }) {
  const { t } = useTranslation()

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <SectionHeader title={t('sentiment.title')} score={score} weight={0.10} color="#06b6d4" />

      {analyst && (
        <>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('sentiment.analyst_ratings')}</div>
          <CalcRow label={t('sentiment.buy_hold_sell')} value={`${analyst.buy_ratings} / ${analyst.hold_ratings} / ${analyst.sell_ratings}`} impact={analyst.buy_ratings > analyst.sell_ratings * 3 ? 'positive' : 'neutral'} note={t('sentiment.analysts_covering', { n: analyst.number_of_analysts })} />
          <CalcRow label={t('sentiment.avg_price_target')} value={`$${analyst.avg_price_target}`} impact="positive" note={t('sentiment.target_note')} impactColor="#22c55e" />
          <CalcRow label={t('sentiment.consensus')} value={analyst.consensus_trend} impact={analyst.consensus_trend === 'buy' || analyst.consensus_trend === 'strong-buy' ? 'positive' : 'neutral'} />
          {analyst.recent_upgrades?.length > 0 && <CalcRow label={t('sentiment.recent_upgrades')} value={analyst.recent_upgrades.join(', ')} impact="positive" note={t('sentiment.n_upgrades', { n: analyst.recent_upgrades.length })} />}
          {analyst.recent_downgrades?.length > 0 && <CalcRow label={t('sentiment.recent_downgrades')} value={analyst.recent_downgrades.join(', ')} impact="negative" note={t('sentiment.n_downgrades', { n: analyst.recent_downgrades.length })} />}
        </>
      )}

      {news && (
        <>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('sentiment.news')}</div>
          <CalcRow label={t('sentiment.sentiment_score')} value={`${news.sentiment_score}`} note={news.sentiment_score > 0.6 ? t('sentiment.positive_news') : news.sentiment_score < 0.4 ? t('sentiment.negative_news') : t('options.put_call_neutral')} impact={news.sentiment_score > 0.6 ? 'positive' : news.sentiment_score < 0.4 ? 'negative' : 'neutral'} />
          <CalcRow label={t('sentiment.headlines')} value={news.headline_count} impact="neutral" />
          {news.bullish_signals > 0 && <CalcRow label={t('sentiment.bullish_signals')} value={news.bullish_signals} impact="positive" />}
          {news.bearish_signals > 0 && <CalcRow label={t('sentiment.bearish_signals')} value={news.bearish_signals} impact="negative" />}
        </>
      )}
    </div>
  )
}

export function HistoricalBreakdown({ data, score, deepAnalysis, scoreBreakdown }: { data: any; score: number; deepAnalysis?: any; scoreBreakdown?: any }) {
  const { t } = useTranslation()
  const hasSimpleData = data && Object.keys(data).length > 0
  const hasDeepData = deepAnalysis && deepAnalysis.overall

  if (!hasSimpleData && !hasDeepData) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <SectionHeader title={t('historical.title')} score={score} weight={0.15} color="#ec4899" />
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
          {t('stock.no_data')}
        </div>
      </div>
    )
  }

  const deep = deepAnalysis?.overall
  const beat = deepAnalysis?.beat_analysis
  const drift5 = deepAnalysis?.drift_5d

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <SectionHeader title={t('historical.title')} score={score} weight={0.15} color="#ec4899" />

      {scoreBreakdown?.has_deep && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.15)' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#ec4899', marginBottom: '4px' }}>{t('historical.deep_analysis')}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {t('historical.score_breakdown_simple', { score: scoreBreakdown.simple })} · {t('historical.score_breakdown_deep', { score: scoreBreakdown.deep })} → {t('historical.score_breakdown_merged', { score: scoreBreakdown.merged })}
          </div>
        </div>
      )}

      {deep && (
        <>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('historical.deep_overall')}</div>
          <CalcRow label={t('historical.beat_rate')} value={`${deep.beat_rate_pct}%`} note={t('historical.quarters_analyzed', { n: deep.total_quarters })} impact={deep.beat_rate_pct >= 70 ? 'positive' : deep.beat_rate_pct >= 50 ? 'neutral' : 'negative'} impactColor={deep.beat_rate_pct >= 70 ? '#22c55e' : '#ef4444'} />
          <CalcRow label={t('historical.avg_surprise')} value={`${deep.avg_surprise_pct > 0 ? '+' : ''}${deep.avg_surprise_pct}%`} impact={deep.avg_surprise_pct > 5 ? 'positive' : deep.avg_surprise_pct > 0 ? 'neutral' : 'negative'} impactColor={deep.avg_surprise_pct > 0 ? '#22c55e' : '#ef4444'} />
          <CalcRow label={t('historical.avg_day_return')} value={`${deep.avg_day_return_pct > 0 ? '+' : ''}${deep.avg_day_return_pct}%`} impact={deep.avg_day_return_pct > 0 ? 'positive' : 'negative'} impactColor={deep.avg_day_return_pct > 0 ? '#22c55e' : '#ef4444'} />
          <CalcRow label={t('historical.positive_rate')} value={`${deep.positive_day_rate_pct}%`} impact={deep.positive_day_rate_pct >= 55 ? 'positive' : 'neutral'} />

          {beat && (
            <>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('historical.beat_vs_miss')}</div>
              <CalcRow label={t('historical.beat_count')} value={`${beat.beat_count} / ${beat.miss_count}`} impact={beat.beat_count > beat.miss_count * 2 ? 'positive' : 'neutral'} />
              {beat.avg_day_return_when_beat !== null && <CalcRow label={t('historical.return_when_beat')} value={`+${beat.avg_day_return_when_beat}%`} impact="positive" impactColor="#22c55e" />}
              {beat.avg_day_return_when_miss !== null && <CalcRow label={t('historical.return_when_miss')} value={`${beat.avg_day_return_when_miss}%`} impact="negative" impactColor="#ef4444" />}
              {beat.beat_positive_rate !== null && <CalcRow label={t('historical.positive_rate_on_beat')} value={`${beat.beat_positive_rate}%`} impact={beat.beat_positive_rate >= 60 ? 'positive' : 'neutral'} />}
            </>
          )}

          {drift5 && (
            <>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('historical.drift_5d')}</div>
              <CalcRow label={t('historical.drift_all')} value={`${drift5.avg_return_all > 0 ? '+' : ''}${drift5.avg_return_all}%`} impact={drift5.avg_return_all > 1 ? 'positive' : drift5.avg_return_all < -1 ? 'negative' : 'neutral'} impactColor={drift5.avg_return_all > 0 ? '#22c55e' : '#ef4444'} />
              {drift5.avg_return_beat !== null && <CalcRow label={t('historical.drift_on_beat')} value={`+${drift5.avg_return_beat}%`} impact="positive" impactColor="#22c55e" />}
              {drift5.avg_return_miss !== null && <CalcRow label={t('historical.drift_on_miss')} value={`${drift5.avg_return_miss}%`} impact="negative" impactColor="#ef4444" />}
              <CalcRow label={t('historical.drift_positive_rate')} value={`${drift5.positive_rate_all}%`} impact={drift5.positive_rate_all >= 55 ? 'positive' : 'neutral'} />
            </>
          )}

          {deepAnalysis?.key_insights && deepAnalysis.key_insights.length > 0 && (
            <>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('historical.insights')}</div>
              {deepAnalysis.key_insights.map((insight: string, i: number) => (
                <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', lineHeight: '1.5' }}>→ {insight}</div>
              ))}
            </>
          )}
        </>
      )}

      {!deep && (
        <>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('historical.move_stats')}</div>
          <CalcRow label={t('historical.avg_move')} value={`±${data.avg_move_pct}%`} note={data.avg_move_pct > 8 ? t('historical.avg_move_large') : data.avg_move_pct > 5 ? t('historical.avg_move_moderate') : t('historical.avg_move_small')} impact={data.avg_move_pct > 5 ? 'positive' : 'neutral'} />
          <CalcRow label={t('historical.median_move')} value={`±${data.median_move_pct}%`} impact="neutral" note={t('historical.median_note')} />
          <CalcRow label={t('historical.largest_upside')} value={`+${data.largest_upside_pct}%`} impact="positive" impactColor="#22c55e" />
          <CalcRow label={t('historical.largest_downside')} value={`${data.largest_downside_pct}%`} impact="negative" impactColor="#ef4444" />

          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('historical.directional_bias')}</div>
          <CalcRow label={t('historical.avg_1d')} value={`${data.avg_1d_return}%`} note={data.avg_1d_return > 2 ? t('historical.avg_1d_strong') : data.avg_1d_return > 0 ? t('historical.avg_1d_slight') : t('historical.avg_1d_negative')} impact={data.avg_1d_return > 0 ? 'positive' : 'negative'} impactColor={data.avg_1d_return > 0 ? '#22c55e' : '#ef4444'} />
          <CalcRow label={t('historical.gap_up_rate')} value={`${data.gap_up_pct}%`} note={data.gap_up_pct > 60 ? t('historical.gap_up_note') : t('historical.gap_mixed')} impact={data.gap_up_pct > 60 ? 'positive' : 'neutral'} />
          <CalcRow label={t('historical.gap_down_rate')} value={`${data.gap_down_pct}%`} impact={data.gap_down_pct > 60 ? 'negative' : 'neutral'} />

          {data.recent_moves?.length > 0 && (
            <>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>{t('historical.recent_moves')}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {data.recent_moves.map((m: any, i: number) => (
                  <span key={i} style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                    background: m.day_return_pct > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: m.day_return_pct > 0 ? '#22c55e' : '#ef4444',
                  }}>
                    {m.day_return_pct > 0 ? '+' : ''}{m.day_return_pct}%
                  </span>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export function MacroBreakdown({ data, score }: { data: any; score: number }) {
  const { t } = useTranslation()
  if (!data) return null

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <SectionHeader title={t('macro.title')} score={score} weight={0.05} color="#64748b" />

      <CalcRow label={t('macro.sp500_trend')} value={data.sp500_trend} impact={data.sp500_trend === 'bullish' ? 'positive' : data.sp500_trend === 'bearish' ? 'negative' : 'neutral'} note={t('macro.sp500_note')} />
      <CalcRow label={t('macro.nasdaq_trend')} value={data.nasdaq_trend} impact={data.nasdaq_trend === 'bullish' ? 'positive' : data.nasdaq_trend === 'bearish' ? 'negative' : 'neutral'} note={t('macro.nasdaq_note')} />
      <CalcRow label={t('macro.regime')} value={data.market_regime?.replace('_', ' ')} impact={data.market_regime === 'risk_on' ? 'positive' : data.market_regime === 'risk_off' ? 'negative' : 'neutral'} note={data.market_regime === 'risk_on' ? t('macro.regime_favorable') : data.market_regime === 'risk_off' ? t('macro.regime_caution') : t('macro.regime_mixed')} />
      <CalcRow label={t('macro.vix')} value={data.vix} impact={data.vix < 15 ? 'positive' : data.vix > 30 ? 'negative' : 'neutral'} note={data.vix < 15 ? t('macro.vix_low') : data.vix < 20 ? t('macro.vix_normal') : data.vix > 30 ? t('macro.vix_high') : t('macro.vix_elevated')} />
      <CalcRow label={t('macro.breadth')} value={data.breadth} impact={data.breadth === 'healthy' ? 'positive' : 'negative'} note={data.breadth === 'healthy' ? t('macro.breadth_healthy') : t('macro.breadth_narrow')} />
    </div>
  )
}

export function OverallBreakdown({ scores }: { scores: any }) {
  const { t } = useTranslation()
  const weights: Record<string, number> = {
    technical: 0.30, fundamental: 0.20, options: 0.20,
    historical: 0.15, sentiment: 0.10, macro: 0.05,
  }
  const colors: Record<string, string> = {
    technical: '#3b82f6', fundamental: '#a855f7', options: '#f59e0b',
    historical: '#ec4899', sentiment: '#06b6d4', macro: '#64748b',
  }

  const overall = Object.entries(weights).reduce((sum, [k, w]) => sum + (scores[k] || 0) * w, 0)

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600' }}>{t('overall.title')}</h3>
        <div style={{ fontSize: '28px', fontWeight: '700', color: overall >= 80 ? '#22c55e' : overall >= 60 ? '#eab308' : '#ef4444' }}>
          {overall.toFixed(1)}
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {t('overall.formula_desc')}
      </div>

      {Object.entries(weights).map(([category, weight]) => (
        <div key={category} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors[category] }} />
              <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{t(`overall.category.${category}`)}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>× {Math.round(weight * 100)}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{scores[category] || 0}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>= {((scores[category] || 0) * weight).toFixed(1)}</span>
            </div>
          </div>
          <Bar value={scores[category] || 0} color={colors[category]} />
        </div>
      ))}

      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: '600' }}>{t('overall.final_score')}</span>
        <span style={{ fontSize: '13px', fontWeight: '600' }}>
          {Object.entries(weights).map(([k, w]) => `${(scores[k] || 0)}×${Math.round(w * 100)}%`).join(' + ')} = <strong>{overall.toFixed(1)}</strong>
        </span>
      </div>
    </div>
  )
}
