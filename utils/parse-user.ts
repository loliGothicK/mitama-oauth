import { parse } from "cookie";
import { verify } from "jsonwebtoken";
import { GetServerSidePropsContext } from "next";
import { config } from "./config";
import { DiscordUser } from "./types";

export function parseUser(ctx: GetServerSidePropsContext): { user: DiscordUser, token: string } | null {
  if (!ctx.req.headers.cookie) {
    throw new Error("No cookie found");
  }

  const token = parse(ctx.req.headers.cookie)[config.cookieName];

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const { iat, exp, ...user } = verify(token, config.jwtSecret) as DiscordUser & { iat: number; exp: number };
    return { user, token };
  } catch (e) {
    return { user: null, token: null};
  }
}
