'use client';
import {redirect, useSearchParams, useRouter} from "next/navigation";
import {useEffect} from "react";
import {Box, Typography} from "@mui/material";

export default function Index() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');
  if (!token) {
    redirect(`/api/auth`);
  }
  useEffect(() => {
    router.push(`mitamatch://auth?token=${token}`);
  }, [router, token]);
  
  useEffect(() => {
    setTimeout(() => {
      // Close the window after 10 seconds.
      window.close();
    }, 10 * 1000);
  }, []);
  
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Typography variant="h4">ログインに成功しました！</Typography>
    </Box>
  );
}
