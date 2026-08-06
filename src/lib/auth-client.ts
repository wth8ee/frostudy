import { createAuthClient } from "better-auth/react";

const getClientBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getClientBaseURL(),
});
