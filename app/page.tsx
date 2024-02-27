'use client';
import {redirect, useSearchParams, useRouter} from "next/navigation";

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
