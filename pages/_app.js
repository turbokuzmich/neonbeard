import CssBaseline from "@mui/material/CssBaseline";
import { SessionProvider } from "next-auth/react";
import { appWithTranslation } from "next-i18next";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";

import "../styles/global.css";

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: "dark",
    },
    typography: {
      fontFamily: '"Evolventa", sans-serif',
    },
  })
);

function NeonBeardApp({ Component, pageProps }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(NeonBeardApp);
