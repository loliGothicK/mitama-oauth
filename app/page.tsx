'use client';
import { config } from "@/utils/config";
import { verify } from "jsonwebtoken";
import {redirect, useSearchParams, useRouter} from "next/navigation";
import { DiscordUser } from "@/utils/types";
import {useEffect} from "react";

export default function Index() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  if (!token) {
    redirect(`/api/auth`);
  } else {
    router.push(`mitamatch://auth?token=${token}`)
  }
  return <h1>Successfully logged in.</h1>;
}
