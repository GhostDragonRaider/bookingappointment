import express from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import { spawn, execSync } from "child_process"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const distDir = join(root, "dist")
const port = Number(process.env.PORT) || 3000
const isDev = process.argv.includes("--dev")
// Ha nincs production, ne cache-eljen a böngésző (frissítéskor mindig legfrissebb tartalom)
const noCache = isDev || process.env.NODE_ENV !== "production"

const API_BACKEND = process.env.API_BACKEND || "http://127.0.0.1:8000"

const app = express()
app.use(
  "/api",
  createProxyMiddleware({
    target: API_BACKEND,
    changeOrigin: true,
    onError: (err, req, res) => {
      res.status(502).json({ error: "Backend unreachable", detail: err.message })
    },
  })
)
// noCache: dev vagy nem-production (pl. start.sh) – frissítéskor legfrissebb build
const staticOptions = noCache
  ? {
      setHeaders: (res) => {
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        res.set("Pragma", "no-cache")
      },
    }
  : {}
app.use(express.static(distDir, staticOptions))
app.get("*", (_, res) => {
  if (noCache) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    res.set("Pragma", "no-cache")
  }
  res.sendFile(join(distDir, "index.html"))
})

if (isDev) {
  console.log("Initial build...")
  execSync("node scripts/build.js", { cwd: root, stdio: "inherit" })
  const build = spawn("node", ["scripts/build.js", "--watch"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "development" },
  })
  build.on("error", (err) => {
    console.error("Build error:", err)
    process.exit(1)
  })
}

const host = process.env.HOST || "0.0.0.0"
app.listen(port, host, () => {
  console.log(`Server: http://${host}:${port}`)
  console.log(`/api → ${API_BACKEND} (indítsd a backendet: uvicorn server:app --reload --port 8000)`)
  if (isDev) console.log("Dev mode: build runs in watch mode, refresh the page after changes.")
})
