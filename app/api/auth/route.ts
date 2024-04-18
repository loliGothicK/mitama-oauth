import { type NextRequest, NextResponse } from 'next/server';
import { config } from '@/utils/config';

const scope = ['identify'].join(' ');
const REDIRECT_URI = `${config.APP_URI}/api/auth/callback`;

const OAUTH_QS = new URLSearchParams({
  client_id: config.CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: 'code',
  scope,
}).toString();

const OAUTH_URI = `https://discord.com/api/oauth2/authorize?${OAUTH_QS}`;

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function GET(_: NextRequest) {
  return NextResponse.redirect(OAUTH_URI);
}
