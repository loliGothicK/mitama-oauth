import { parse } from "cookie";
import { verify } from "jsonwebtoken";
import { GetServerSidePropsContext } from "next";
import { config } from "./config";
import { DiscordUser } from "./types";

export function parseUser(ctx: GetServerSidePropsContext): { user: DiscordUser, token: string } | null {
  if (!ctx.req.headers.cookie) {
    return null;
  }

  const token = parse(ctx.req.headers.cookie)[config.cookieName];

  if (!token) {
    return null;
  }

  try {
    const { iat, exp, ...user } = verify(token, config.jwtSecret) as DiscordUser & { iat: number; exp: number };
    return { user, token };
  } catch (e) {
    return null;
  }
}
