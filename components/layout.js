import Box from "@mui/material/Box";
import Head from "next/head";
import Header from "./header";
import Footer from "./footer";

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />
        <Box sx={{ flexGrow: 1, flexShrink: 0 }}>{children}</Box>
        <Footer />
      </Box>
    </>
  );
}
