# CortexCart Monorepo

Two separate Next.js apps sharing one PostgreSQL database.

```
cortexcart/
├── main/   → Customer store        (cortexcart-main.vercel.app)
└── host/   → Admin dashboard       (cortexcart-host.vercel.app)
```

→ See `main/README.md` and `host/README.md` for full details.

## Quick Start
```bash
# Terminal 1 — Main store on :3000
cd main && npm install && npm run dev

# Terminal 2 — Host dashboard on :3001  
cd host && npm install && npm run dev
```
