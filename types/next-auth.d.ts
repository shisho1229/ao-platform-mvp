import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    jukuCampus: string;
    role: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      jukuCampus: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    jukuCampus: string;
    role: string;
  }
}
