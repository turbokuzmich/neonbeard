import nodemailer from "nodemailer";
import NextAuth from "next-auth";
import sequelize, { User } from "../../../lib/backend/sequelize";
import SequelizeAdapter from "@next-auth/sequelize-adapter";

export const authOptions = {
  adapter: SequelizeAdapter(sequelize, {
    models: { User },
  }),
  session: {
    strategy: "jwt",
  },
  providers: [
    {
      id: "queue",
      name: "Email",
      type: "email",
      async sendVerificationRequest({ identifier, token }) {
        const transport = nodemailer.createTransport({
          host: "smtp.yandex.ru",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const query = new URLSearchParams({ token, email: identifier });
        const params = {
          text: `Для авторизации пройдите по ссылке https://neon-beard.ru/auth/signin?${query.toString()}`,
          subject: "Авторизация на сайте Neon Beard",
          to: identifier,
          from: process.env.EMAIL_USER,
        };

        await transport.sendMail(params);
      },
    },
  ],
};

export default NextAuth(authOptions);
