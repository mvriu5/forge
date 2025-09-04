import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {trpcServer} from "@hono/trpc-server"
import { trpcRouter } from './routers/index'
import {createContext} from "./context"
import {auth} from "./lib/auth"

const app = new Hono()

app.use('/*', cors({
    origin: ['http://localhost:3000'],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ['POST', 'GET', 'DELETE', 'PUT'],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true
}))

app.on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
})

app.use(
    '/trpc/*',
    trpcServer({
      router: trpcRouter,
      createContext: (_, c) => createContext(c),
    }),
)

// Health Check Endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Hono + tRPC Server läuft!',
    endpoints: {
      trpc: '/trpc',
      health: '/',
    }
  })
})

export default {
  fetch: app.fetch,
  port: 3000
}