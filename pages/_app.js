import { SessionProvider } from "next-auth/react";

function NeonBeardApp({ Component, pageProps }) {
  return (
    <SessionProvider>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default NeonBeardApp;
