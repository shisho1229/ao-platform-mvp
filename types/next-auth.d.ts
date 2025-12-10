import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    jukuName: string;
    role: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      jukuName: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    jukuName: string;
    role: string;
  }
}
