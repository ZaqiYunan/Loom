declare module 'midtrans-client';

declare module "~/env.js" {
  export const env: {
    MIDTRANS_SERVER_KEY: string;
    MIDTRANS_CLIENT_KEY: string;
    DATABASE_URL: string;
    NODE_ENV: "development" | "test" | "production";
    AUTH_SECRET?: string;
  };
}