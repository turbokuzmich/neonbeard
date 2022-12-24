import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "../components/layout";

export default function Home() {
  return (
    <Layout>
      <div>Obanze</div>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["navigation"])),
    },
  };
}
