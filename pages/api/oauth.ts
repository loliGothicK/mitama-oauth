import { sign } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";
import fetch from "node-fetch";
import { config } from "../../utils/config";
import { DiscordUser } from "../../utils/types";
const scope = ["identify"].join(" ");
const REDIRECT_URI = `${config.appUri}`;

const OAUTH_QS = new URLSearchParams({
  client_id: config.clientId,
  redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope,
}).toString();

const OAUTH_URI = `https://discord.com/api/oauth2/authorize?${OAUTH_QS}`;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") return res.redirect("/");

  const { code = null, error = null } = req.query;

  if (error) {
    return res.redirect(`/?error=${req.query.error}`);
  }

  if (!code || typeof code !== "string") return res.redirect(OAUTH_URI);

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
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
    return res.redirect(OAUTH_URI);
  }

  const me: DiscordUser | { unauthorized: true } = await fetch("http://discord.com/api/users/@me", {
    headers: { Authorization: `${token_type} ${access_token}` },
  }).then((res) => res.json());

  if (!("id" in me)) {
    return res.redirect(OAUTH_URI);
  }

  const token = sign(me, config.jwtSecret, { expiresIn: "24h" });

  cookies().set(config.cookieName, token, {
    secure: true,
    httpOnly: true,
    maxAge: 5000000,
  });

  res.redirect("/");
};
