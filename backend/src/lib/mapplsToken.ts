interface TokenCache {
  token: string;
  expiresAt: number;
}

let cache: TokenCache | null = null;

export async function getMapplsToken(): Promise<string> {
  const now = Date.now();

  if (cache && now < cache.expiresAt) {
    return cache.token;
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.MAPPLS_CLIENT_ID!,
    client_secret: process.env.MAPPLS_CLIENT_SECRET!,
  });

  const res = await fetch(process.env.MAPPLS_TOKEN_AUTH_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mappls token fetch failed: ${res.status} — ${body}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };

  // Refresh 5 minutes before expiry
  cache = {
    token: data.access_token,
    expiresAt: now + (data.expires_in - 300) * 1000,
  };

  return cache.token;
}
