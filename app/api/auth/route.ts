import { sign } from "jsonwebtoken";
import {NextRequest, NextResponse} from "next/server";
import fetch from "node-fetch";
import { config } from "@/utils/config";
import { DiscordUser } from "@/utils/types";

const scope = ["identify"].join(" ");
const REDIRECT_URI = `${config.APP_URI}/api/auth`;

const OAUTH_QS = new URLSearchParams({
  client_id: config.CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope,
}).toString();

const OAUTH_URI = `https://discord.com/api/oauth2/authorize?${OAUTH_QS}`;

export async function GET(req: NextRequest) {
  console.log(`REDIRECT_URI: ${REDIRECT_URI}`);
  const searchParams = req.nextUrl.searchParams;
  const { origin } = req.nextUrl
  if (searchParams.get('error')) {
    return NextResponse.redirect(`/?error=${searchParams.get('error')}`);
  }

  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(OAUTH_URI);
  }

  const body = new URLSearchParams({
    client_id: config.CLIENT_ID,
    client_secret: config.CLIENT_SECRET,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    code,
    scope,
  }).toString();

  const { access_token = null, token_type = "Bearer" } = await fetch("https://discord.com/api/oauth2/token", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body,
  }).then((res) => res.json());

  if (!access_token || typeof access_token !== "string") {
    return NextResponse.redirect(OAUTH_URI);
  }

  const me: DiscordUser | { unauthorized: true } = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `${token_type} ${access_token}` },
  }).then((res) => res.json());

  if (!("id" in me)) {
    return NextResponse.redirect(OAUTH_URI);
  }

  const token = sign(me, config.JWT_SECRET, { expiresIn: "24h" });
  console.log("Logged in as", me);
  return NextResponse.redirect(`${origin}?token=${token}`);
}
