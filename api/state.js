const { put, head, list } = require('@vercel/blob');

const STATE_KEY = 'app-state.json';

// Status priority: out > low > full (lower = worse)
const STATUS_RANK = { out: 0, low: 1, full: 2 };

function mergeState(server, client) {
  const merged = {};

  // Favorites: union of both sets
  const serverFavs = new Set(server.favorites || []);
  const clientFavs = new Set(client.favorites || []);
  merged.favorites = [...new Set([...serverFavs, ...clientFavs])];

  // History: combine + dedupe by id+timestamp
  const serverHist = server.history || [];
  const clientHist = client.history || [];
  const histSet = new Set();
  const combined = [];
  [...serverHist, ...clientHist].forEach(h => {
    const key = `${h.id}_${h.timestamp}`;
    if (!histSet.has(key)) {
      histSet.add(key);
      combined.push(h);
    }
  });
  merged.history = combined.sort((a, b) => b.timestamp - a.timestamp);

  // WeekPlan: last-write-wins by timestamp
  const serverPlanTs = server.weekPlanUpdated || 0;
  const clientPlanTs = client.weekPlanUpdated || 0;
  if (clientPlanTs >= serverPlanTs) {
    merged.weekPlan = client.weekPlan;
    merged.weekPlanUpdated = clientPlanTs;
  } else {
    merged.weekPlan = server.weekPlan;
    merged.weekPlanUpdated = serverPlanTs;
  }

  // Serves: last-write-wins
  merged.serves = clientPlanTs >= serverPlanTs ? client.serves : server.serves;

  // PantryStock: worst-status-wins (out > low > full)
  merged.pantryStock = { ...(server.pantryStock || {}) };
  const clientPantry = client.pantryStock || {};
  for (const [key, val] of Object.entries(clientPantry)) {
    if (!merged.pantryStock[key]) {
      merged.pantryStock[key] = val;
    } else {
      const serverRank = STATUS_RANK[merged.pantryStock[key].status] ?? 2;
      const clientRank = STATUS_RANK[val.status] ?? 2;
      if (clientRank <= serverRank) {
        merged.pantryStock[key] = val;
      }
      // Keep higher usedCount
      if (val.usedCount > (merged.pantryStock[key].usedCount || 0)) {
        merged.pantryStock[key].usedCount = val.usedCount;
      }
    }
  }

  // BeforeWeShopStock: same worst-status-wins
  merged.beforeWeShopStock = { ...(server.beforeWeShopStock || {}) };
  const clientBws = client.beforeWeShopStock || {};
  for (const [key, val] of Object.entries(clientBws)) {
    if (!merged.beforeWeShopStock[key]) {
      merged.beforeWeShopStock[key] = val;
    } else {
      const serverRank = STATUS_RANK[merged.beforeWeShopStock[key].status] ?? 2;
      const clientRank = STATUS_RANK[val.status] ?? 2;
      if (clientRank <= serverRank) {
        merged.beforeWeShopStock[key] = val;
      }
    }
  }

  merged.lastSync = Date.now();
  return merged;
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      // Try to find existing state blob
      const { blobs } = await list({ prefix: STATE_KEY });
      if (!blobs.length) {
        return res.status(200).json({ empty: true, state: null });
      }
      const response = await fetch(blobs[0].url);
      const state = await response.json();
      return res.status(200).json({ empty: false, state });
    }

    if (req.method === 'PUT') {
      const clientState = req.body;
      if (!clientState) return res.status(400).json({ error: 'No state provided' });

      // Get current server state
      let serverState = null;
      const { blobs } = await list({ prefix: STATE_KEY });
      if (blobs.length) {
        const response = await fetch(blobs[0].url);
        serverState = await response.json();
      }

      // Merge or use client state if no server state
      const merged = serverState ? mergeState(serverState, clientState) : {
        ...clientState,
        lastSync: Date.now()
      };

      // Write merged state
      await put(STATE_KEY, JSON.stringify(merged), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      });

      return res.status(200).json({ ok: true, state: merged });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Sync error:', err);
    return res.status(500).json({ error: 'Sync failed', detail: err.message });
  }
};
