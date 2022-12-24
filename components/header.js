import A from "@mui/material/Link";
import Box from "@mui/material/Box";
import Link from "next/link";
import Image from "./image";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useRouter } from "next/router";
import { useTheme } from "@mui/material/styles";
import { mainMenu } from "../constants/navigation";
import { useTranslation } from "next-i18next";
import { useState, useMemo, useEffect, useCallback } from "react";

export default function Header() {
  return (
    <Box sx={{ flexShrink: 0, flexGrow: 0, pt: 2, pb: 2 }}>
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: {
            xs: 2,
            md: 0,
          },
        }}
      >
        <Logo />
        <Menu />
        <Cart />
      </Container>
    </Box>
  );
}

function DesktopMenu() {
  const { t } = useTranslation("navigation");

  return (
    <Typography
      component="ul"
      sx={{
        p: 0,
        gap: 2,
        listStyle: "none",
        whiteSpace: "nowrap",
        textTransform: "uppercase",
        display: {
          xs: "none",
          md: "flex",
        },
      }}
    >
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

function MobileMenu() {
  const { push } = useRouter();
  const { t } = useTranslation("navigation");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const theme = useTheme();
  const shouldDrawerBeClosed = useMediaQuery(theme.breakpoints.up("md"));

  const menuCallbacks = useMemo(() => {
    return mainMenu.map(({ link }) => () => {
      setIsDrawerOpen(false);
      push(link);
    });
  }, [push, setIsDrawerOpen]);

  const onMenuButtonClick = useCallback(() => {
    setIsDrawerOpen(!isDrawerOpen);
  }, [isDrawerOpen, setIsDrawerOpen]);

  const onDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
  }, [setIsDrawerOpen]);

  useEffect(() => {
    if (isDrawerOpen && shouldDrawerBeClosed) {
      setIsDrawerOpen(false);
    }
  }, [isDrawerOpen, shouldDrawerBeClosed, setIsDrawerOpen]);

  return (
    <>
      <Box
        sx={{
          display: {
            xs: "initial",
            md: "none",
          },
          flexGrow: 1,
        }}
      >
        <IconButton edge="start" onClick={onMenuButtonClick}>
          <MenuIcon
            sx={{
              fontSize: "2rem",
            }}
          />
        </IconButton>
      </Box>
      <Drawer anchor="left" open={isDrawerOpen} onClose={onDrawerClose}>
        <List>
          {mainMenu.map(({ title, link }, index) => (
            <ListItem key={link}>
              <ListItemButton onClick={menuCallbacks[index]}>
                <ListItemText primary={t(title)} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}

function Menu() {
  return (
    <>
      <DesktopMenu />
      <MobileMenu />
    </>
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
