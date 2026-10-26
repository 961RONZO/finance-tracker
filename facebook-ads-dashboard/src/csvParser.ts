import Papa from 'papaparse'
import type { AdRow } from './types'

const num = (v: unknown): number => {
  if (v === undefined || v === null || v === '') return 0
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  const s = String(v).replace(/,/g, '').replace(/%/g, '').trim()
  const n = parseFloat(s)
  return Number.isNaN(n) ? 0 : n
}

/** Normalize column name for matching (lowercase, no extra spaces) */
function norm(key: string): string {
  return key.toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Find first header that matches one of the possible names */
function findCol(headers: string[], ...names: string[]): string | null {
  const normalized = headers.map((h, i) => ({ i, n: norm(h) }))
  for (const name of names) {
    const n = norm(name)
    const found = normalized.find(({ n: h }) => h === n || h.includes(n))
    if (found) return headers[found.i]
  }
  return null
}

/** Parse Facebook Ads report CSV into normalized AdRow[] */
export function parseFacebookAdCsv(csvText: string): AdRow[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length > 0) {
    console.warn('CSV parse errors:', parsed.errors)
  }

  const rows = parsed.data
  if (rows.length === 0) return []

  const headers = Object.keys(rows[0])

  const dateCol = findCol(
    headers,
    'reporting starts',
    'date',
    'start date',
    'day',
    'reporting date'
  )
  const campaignCol = findCol(headers, 'campaign name', 'campaign')
  const adSetCol = findCol(headers, 'ad set name', 'ad set', 'adset name')
  const adCol = findCol(headers, 'ad name', 'ad')
  const impressionsCol = findCol(headers, 'impressions', 'impression')
  const clicksCol = findCol(headers, 'link clicks', 'clicks', 'link clicks (all)', 'results')
  const spendCol = findCol(
    headers,
    'amount spent (usd)',
    'spend',
    'amount spent',
    'spend (usd)',
    'cost'
  )
  const ctrCol = findCol(headers, 'ctr (all)', 'ctr', 'link ctr', 'ctr (all clicks)')
  const cpcCol = findCol(headers, 'cpc (all)', 'cpc', 'cost per link click', 'cpc (all clicks)')
  const cpmCol = findCol(
    headers,
    'cpm (cost per 1,000 impressions)',
    'cpm',
    'cost per 1,000 impressions',
    'cost per 1000 impressions'
  )
  const reachCol = findCol(headers, 'reach')
  const freqCol = findCol(headers, 'frequency')
  const resultsCol = findCol(headers, 'results', 'conversions', 'purchases', 'leads')
  const costPerResultCol = findCol(
    headers,
    'cost per result',
    'cost per conversion',
    'cost per purchase',
    'cpa'
  )
  const valueCol = findCol(
    headers,
    'direct website purchases conversion value',
    'purchase conversion value',
    'conversion value',
    'value',
    'revenue',
    'amount'
  )
  const purchaseRoasCol = findCol(
    headers,
    'purchase roas (return on ad spend)',
    'purchase roas',
    'roas'
  )
  const resultsRoasCol = findCol(headers, 'results roas', 'results roas')
  const addsToCartCol = findCol(headers, 'adds to cart')
  const checkoutsCol = findCol(headers, 'checkouts initiated', 'checkouts')
  const landingPageViewsCol = findCol(headers, 'landing page views')
  const purchasesCol = findCol(headers, 'purchases')
  const costPerPurchaseCol = findCol(headers, 'cost per purchase')
  const video25Col = findCol(headers, 'video plays at 25%')
  const video50Col = findCol(headers, 'video plays at 50%')
  const video75Col = findCol(headers, 'video plays at 75%')
  const video95Col = findCol(headers, 'video plays at 95%')
  const video100Col = findCol(headers, 'video plays at 100%')
  const uniqueLinkClicksCol = findCol(headers, 'unique link clicks')
  const outboundClicksCol = findCol(headers, 'outbound clicks')
  const uniqueOutboundClicksCol = findCol(headers, 'unique outbound clicks')
  const cpcLinkCol = findCol(headers, 'cpc (cost per link click)', 'cost per link click')
  const costPerUniqueLinkClickCol = findCol(
    headers,
    'cost per unique link click',
    'cost per unique link click'
  )
  const ageCol = findCol(headers, 'age')
  const genderCol = findCol(headers, 'gender')
  const deliveryStatusCol = findCol(headers, 'delivery status')

  return rows.map((row): AdRow => {
    const impressions = num(impressionsCol ? row[impressionsCol] : 0)
    const clicks = num(clicksCol ? row[clicksCol] : 0)
    const spend = num(spendCol ? row[spendCol] : 0)
    const ctr = ctrCol ? num(row[ctrCol]) : impressions > 0 ? (clicks / impressions) * 100 : 0
    const cpc = cpcCol ? num(row[cpcCol]) : clicks > 0 ? spend / clicks : 0
    const cpm = cpmCol ? num(row[cpmCol]) : impressions > 0 ? (spend / impressions) * 1000 : 0

    return {
      date: dateCol ? String(row[dateCol] || '').trim() : '',
      campaignName: campaignCol ? String(row[campaignCol] || '').trim() : 'Unnamed',
      adSetName: adSetCol ? String(row[adSetCol] || '').trim() : 'Unnamed',
      adName: adCol ? String(row[adCol] || '').trim() : 'Unnamed',
      impressions,
      clicks,
      spend,
      ctr,
      cpc,
      cpm,
      reach: reachCol ? num(row[reachCol]) : undefined,
      frequency: freqCol ? num(row[freqCol]) : undefined,
      results: resultsCol ? num(row[resultsCol]) : undefined,
      costPerResult: costPerResultCol ? num(row[costPerResultCol]) : undefined,
      conversionValue: valueCol ? num(row[valueCol]) : undefined,
      purchaseRoas: purchaseRoasCol ? num(row[purchaseRoasCol]) : undefined,
      resultsRoas: resultsRoasCol ? num(row[resultsRoasCol]) : undefined,
      addsToCart: addsToCartCol ? num(row[addsToCartCol]) : undefined,
      checkoutsInitiated: checkoutsCol ? num(row[checkoutsCol]) : undefined,
      landingPageViews: landingPageViewsCol ? num(row[landingPageViewsCol]) : undefined,
      purchases: purchasesCol ? num(row[purchasesCol]) : undefined,
      costPerPurchase: costPerPurchaseCol ? num(row[costPerPurchaseCol]) : undefined,
      videoPlays25: video25Col ? num(row[video25Col]) : undefined,
      videoPlays50: video50Col ? num(row[video50Col]) : undefined,
      videoPlays75: video75Col ? num(row[video75Col]) : undefined,
      videoPlays95: video95Col ? num(row[video95Col]) : undefined,
      videoPlays100: video100Col ? num(row[video100Col]) : undefined,
      uniqueLinkClicks: uniqueLinkClicksCol ? num(row[uniqueLinkClicksCol]) : undefined,
      outboundClicks: outboundClicksCol ? num(row[outboundClicksCol]) : undefined,
      uniqueOutboundClicks: uniqueOutboundClicksCol ? num(row[uniqueOutboundClicksCol]) : undefined,
      cpcLink: cpcLinkCol ? num(row[cpcLinkCol]) : undefined,
      costPerUniqueLinkClick: costPerUniqueLinkClickCol
        ? num(row[costPerUniqueLinkClickCol])
        : undefined,
      age: ageCol ? String(row[ageCol] || '').trim() : undefined,
      gender: genderCol ? String(row[genderCol] || '').trim() : undefined,
      deliveryStatus: deliveryStatusCol ? String(row[deliveryStatusCol] || '').trim() : undefined,
    }
  })
}
