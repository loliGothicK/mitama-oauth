import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { parseUser } from "../utils/parse-user";
import { DiscordUser } from "../utils/types";

interface Props {
  user: DiscordUser;
}

export default function Index({user}: Props) {
  const router = useRouter();
  // 1秒後にリダイレクト
  setTimeout(() => {
    router.push(`mitamatch://login?user=${user}`);
  }, 1000);
  return (
    <h1>
      Welcome to MitamatchOperations!
      <br />
      Successfully logged in as {user.username}.
    </h1>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async function (ctx) {
  const user = parseUser(ctx);

  if (!user) {
    return {
      redirect: {
        destination: "/api/oauth",
        permanent: false,
      },
    };
  }

  return { props: { user } };
};
