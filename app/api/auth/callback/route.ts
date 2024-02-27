import { sign } from "jsonwebtoken";
import {NextRequest, NextResponse} from "next/server";
import fetch from "node-fetch";
import { config } from "@/utils/config";
import { DiscordUser } from "@/utils/types";

const REDIRECT_URI = `${config.APP_URI}/api/auth/callback`;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const { origin } = req.nextUrl;
  
  const code = searchParams.get("code");
  if (!code) {
    console.log("no code found");
    return NextResponse.redirect('/');
  }
  
  const body = new URLSearchParams({
    client_id: config.CLIENT_ID,
    client_secret: config.CLIENT_SECRET,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    code,
  }).toString();
  
  const { access_token = null, token_type = "Bearer" } = await fetch("https://discord.com/api/oauth2/token", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body,
  }).then((res) => res.json());
  
  if (!access_token || typeof access_token !== "string") {
    console.log("no access token", access_token);
    return NextResponse.redirect('/');
  }
  
  const me: DiscordUser | { unauthorized: true } = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `${token_type} ${access_token}` },
  }).then((res) => res.json());
  
  if (!("id" in me)) {
    console.log('unauthorized', me);
    return NextResponse.redirect('/');
  }
  
  const token = sign(me, config.JWT_SECRET, { expiresIn: "24h" });
  console.log("Logged in as", me);
  return NextResponse.redirect(`${origin}?token=${token}`);
}
