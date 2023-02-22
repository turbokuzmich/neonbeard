import CssBaseline from "@mui/material/CssBaseline";
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
      primary: {
        main: "#a0eaff",
      },
    },
    typography: {
      fontFamily: '"Evolventa", sans-serif',
    },
  })
);

function NeonBeardApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default appWithTranslation(NeonBeardApp);
