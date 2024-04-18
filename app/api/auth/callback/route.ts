import { sign } from 'jsonwebtoken';
import { type NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { config } from '@/utils/config';
import type { DiscordUser } from '@/utils/types';

const REDIRECT_URI = `${config.APP_URI}/api/auth/callback`;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const { origin } = req.nextUrl;

  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.redirect('${origin}?error=no_code');
  }

  const body = new URLSearchParams({
    client_id: config.CLIENT_ID,
    client_secret: config.CLIENT_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
    code,
  }).toString();

  const { access_token = null, token_type = 'Bearer' } = (await fetch(
    'https://discord.com/api/oauth2/token',
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      body,
    },
  ).then(res => res.json())) as {
    access_token: string;
    token_type: string;
  };

  if (!access_token || typeof access_token !== 'string') {
    return NextResponse.redirect(`${origin}?error=no_access_token`);
  }

  const me: DiscordUser | { unauthorized: true } = (await fetch(
    'https://discord.com/api/users/@me',
    {
      headers: { Authorization: `${token_type} ${access_token}` },
    },
  ).then(res => res.json())) as DiscordUser | { unauthorized: true };

  if (!('id' in me)) {
    return NextResponse.redirect('${origin}?error=unauthorized');
  }

  const token = sign(me, config.JWT_SECRET, { expiresIn: '24h' });
  return NextResponse.redirect(`${origin}?token=${token}`);
}
