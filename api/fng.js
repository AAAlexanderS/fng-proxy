export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  try {
    const upstream = await fetch(
      'https://production.dataviz.cnn.io/index/fearandgreed/graphdata/',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.cnn.com/',
          'Accept': 'application/json',
        },
      }
    )

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Upstream ${upstream.status}` })
    }

    const data = await upstream.json()
    const current = data?.fear_and_greed
    const history = data?.fear_and_greed_historical?.data ?? []

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')
    return res.status(200).json({
      value: Math.round(current?.score ?? 0),
      classification: current?.rating ?? 'unknown',
      timestamp: current?.timestamp ?? null,
      previous_close: Math.round(history.slice(-2)?.[0]?.y ?? 0),
      history: history.slice(-30).map(d => ({
        ts: d.x,
        value: Math.round(d.y),
      })),
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
