import { Redis } from '@upstash/redis';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const email = (req.query?.email || req.body?.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  const dataKey = `data:${email}`;

  try {
    const redis = Redis.fromEnv();

    if (req.method === 'GET') {
      const data: any = await redis.get(dataKey);
      return res.status(200).json(data || { tasks: [], projects: [], segmentNames: null });
    }

    if (req.method === 'POST') {
      const { tasks, projects, segmentNames } = req.body || {};
      const payload = {
        tasks: tasks || [],
        projects: projects || [],
        segmentNames: segmentNames || null,
        updated_at: new Date().toISOString()
      };
      await redis.set(dataKey, payload);
      return res.status(200).json({ success: true, updated_at: payload.updated_at });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Sync error:', err);
    return res.status(500).json({ 
      error: 'Upstash Redis database is not connected on Vercel yet. In Vercel, go to Storage -> Connect Upstash Redis.' 
    });
  }
}
