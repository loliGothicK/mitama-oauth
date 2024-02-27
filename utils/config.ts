import z from "zod";

const envSchema = z.object({
  CLIENT_ID: z.string().regex(/^\d+$/),
  CLIENT_SECRET: z.string(),
  APP_URI: z.string().url(),
  JWT_SECRET: z.string(),
  COOKIE_NAME: z.string(),
});
export const config = envSchema.parse({
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  APP_URI: process.env.APP_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  COOKIE_NAME: 'mitamatch_token',
});
