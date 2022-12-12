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
      async sendVerificationRequest({ identifier, url, token }) {
        console.log(token);
        // send email
      },
    },
  ],
};

export default NextAuth(authOptions);
