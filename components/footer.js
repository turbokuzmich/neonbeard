import { Fragment } from "react";
import A from "@mui/material/Link";
import { PatternFormat, patternFormatter } from "react-number-format";
import { footerMenu } from "../constants/navigation";
import { phones, emails } from "../constants/contacts";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import Box from "@mui/material/Box";
import Image from "./image";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

function DesktopFooter() {
  const { t } = useTranslation("navigation");

  return (
    <Container
      sx={{
        gap: 2,
        display: {
          xs: "none",
          md: "flex",
        },
      }}
    >
      <Box
        sx={{
          pt: 1,
          pb: 1,
          gap: 2,
          display: "flex",
          backgroundColor: "blue",
          width: "100%",
        }}
      >
        <Box
          sx={{
            backgroundColor: "green",
            width: "100%",
          }}
        >
          <Box>
            <Image
              src="/images/logo.png"
              sx={{
                maxWidth: "100%",
              }}
            />
          </Box>
          <Typography paragraph>
            Мы производим лучшую селективную косметику для мужчин для ухода за
            кожей лица и для ухода за бородой
          </Typography>
          <Typography>
            &copy; Neon Beard
            <br />
            all right reserved
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: "green",
            width: "100%",
          }}
        >
          <Typography
            variant="h5"
            sx={{ textTransform: "uppercase" }}
            paragraph
          >
            информация
          </Typography>
          {footerMenu.map(({ title, link }) => (
            <Typography key={link} paragraph>
              <Link href={link} passHref>
                <A>{t(title)}</A>
              </Link>
            </Typography>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          pt: 1,
          pb: 1,
          gap: 2,
          display: "flex",
          backgroundColor: "blue",
          width: "100%",
        }}
      >
        <Box
          sx={{
            backgroundColor: "green",
            width: "100%",
          }}
        >
          <Typography
            variant="h5"
            sx={{ textTransform: "uppercase" }}
            paragraph
          >
            контакты
          </Typography>
          <Typography paragraph>
            {phones.map(({ value, formats: { link, display } }, index) => (
              <Fragment key={value}>
                <A
                  href={`tel:${patternFormatter(String(value), {
                    format: link,
                  })}`}
                >
                  <PatternFormat
                    value={value}
                    displayType="text"
                    format={display}
                  />
                  {index === phones.length - 1 ? null : <br />}
                </A>
              </Fragment>
            ))}
          </Typography>
          <Typography>
            {emails
              .filter(({ type }) => type === "common")
              .map(({ value }, index) => (
                <Fragment key={value}>
                  <A href={`mailto:${value}`}>{value}</A>
                  {index === emails.length - 1 ? null : <br />}
                </Fragment>
              ))}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: "green",
            width: "100%",
          }}
        >
          <Typography variant="h5" sx={{ textTransform: "uppercase" }}>
            подпишитесь
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

function MobileFooter() {
  return (
    <Container
      sx={{
        display: {
          xs: "flex",
          md: "none",
        },
      }}
    >
      мобилы
    </Container>
  );
}

export default function Footer() {
  return (
    <Box sx={{ flexShrink: 0, flexGrow: 0 }}>
      <DesktopFooter />
      <MobileFooter />
    </Box>
  );
}
