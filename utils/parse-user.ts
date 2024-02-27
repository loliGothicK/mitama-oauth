import { parse } from "cookie";
import { verify } from "jsonwebtoken";
import { GetServerSidePropsContext } from "next";
import { config } from "./config";
import { DiscordUser } from "./types";

export function parseUser(ctx: GetServerSidePropsContext): DiscordUser | null {
  console.log(ctx.req.headers.cookie);
  if (!ctx.req.headers.cookie) {
    return null;
  }

  const token = parse(ctx.req.headers.cookie)[config.cookieName];
  console.log(token);
  if (!token) {
    return null;
  }

  try {
    const { iat, exp, ...user } = verify(token, config.jwtSecret) as DiscordUser & { iat: number; exp: number };
    console.log(user);
    return user;
  } catch (e) {
    return null;
  }
}
