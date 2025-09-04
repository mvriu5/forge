import { defineConfig } from "drizzle-kit"

export default defineConfig({
    schema: "./src/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: { url: "app.db" }
})