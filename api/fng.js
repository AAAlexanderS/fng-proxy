export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors() })
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
      return new Response(JSON.stringify({ error: `Upstream ${upstream.status}` }), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json', ...cors() },
      })
    }

    const data = await upstream.json()
    const current = data?.fear_and_greed
    const history = data?.fear_and_greed_historical?.data ?? []

    const payload = {
      value: Math.round(current?.score ?? 0),
      classification: current?.rating ?? 'unknown',
      timestamp: current?.timestamp ?? null,
      previous_close: Math.round(history.slice(-2)?.[0]?.y ?? 0),
      history: history.slice(-30).map(d => ({
        ts: d.x,
        value: Math.round(d.y),
      })),
    }

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
        ...cors(),
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors() },
    })
  }
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
