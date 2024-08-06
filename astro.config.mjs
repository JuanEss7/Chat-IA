import { defineConfig } from 'astro/config';
import auth from "auth-astro";
import vercel from "@astrojs/vercel/serverless";

import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
  integrations: [auth(), db()],
  output: "server",
  adapter: vercel(),
  image: {
    domains: [
      "https://lh3.googleusercontent.com/",
    ]
  }
});