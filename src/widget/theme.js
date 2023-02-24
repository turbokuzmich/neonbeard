import { createTheme, responsiveFontSizes } from "@mui/material/styles";

export default responsiveFontSizes(
  createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#ffffff",
        light: "#ffffff",
        dark: "#ffffff",
      },
      secondary: {
        main: "#ffffff",
        light: "#ffffff",
        dark: "#ffffff",
      },
    },
    typography: {
      fontFamily: '"Evolventa", sans-serif',
    },
  })
);
