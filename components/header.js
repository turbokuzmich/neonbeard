import A from "@mui/material/Link";
import Box from "@mui/material/Box";
import Link from "next/link";
import Image from "./image";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { mainMenu } from "../constants/navigation";
import { useTranslation } from "next-i18next";

export default function Header() {
  return (
    <Box sx={{ flexShrink: 0, flexGrow: 0 }}>
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Logo />
        <Menu />
        <Cart />
      </Container>
    </Box>
  );
}

function Menu() {
  const { t } = useTranslation("navigation");

  return (
    <Typography component="ul">
      {mainMenu.map(({ title, link }) => (
        <Typography key={link} component="li">
          <Link href={link} passHref>
            <A>{t(title)}</A>
          </Link>
        </Typography>
      ))}
    </Typography>
  );
}

function Cart() {
  return <Typography>Корзинка</Typography>;
}

function Logo() {
  return (
    <Link href="/" passHref>
      <A
        sx={{
          maxWidth: 220,
          flexShrink: 0,
          flexGrow: 0,
        }}
      >
        <Image
          src="/images/logo.png"
          sx={{
            maxWidth: "100%",
          }}
        />
      </A>
    </Link>
  );
}
