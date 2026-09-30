import { Redis } from '@upstash/redis';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Automatically reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN or KV_REST_API_*
    const redis = Redis.fromEnv();
    const userKey = `user:${normalizedEmail}`;
    const existingUser: any = await redis.get(userKey);

    if (action === 'signup') {
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
      }

      const newUser = {
        email: normalizedEmail,
        password: password,
        created_at: new Date().toISOString(),
      };

      await redis.set(userKey, newUser);
      return res.status(200).json({ success: true, email: normalizedEmail });
    } else {
      // Sign in
      if (!existingUser) {
        return res.status(400).json({ error: 'No account found with this email. Please create an account first.' });
      }

      if (existingUser.password !== password) {
        return res.status(400).json({ error: 'Incorrect password. Please try again.' });
      }

      return res.status(200).json({ success: true, email: normalizedEmail });
    }
  } catch (err: any) {
    console.error('Auth error:', err);
    // If Redis is not connected on Vercel yet, inform gracefully
    return res.status(500).json({ 
      error: 'Upstash Redis database is not connected on Vercel yet. In Vercel, go to Storage -> Connect Upstash Redis.' 
    });
  }
}
