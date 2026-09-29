// Generates static, server-rendered snapshots of the participant-facing
// challenge pages (day 1/2/3 + toolbox) at dist/preview/*.html, served at
// /preview/day-1 etc (see vercel.json), plus an index, one-document site.html,
// version.json / manifest.json for cache-freshness checks, and agent.md. Purpose: let a reviewer (human or an
// agent that can't run JavaScript) see the actual current markup of these
// pages without needing a real participant/personal link - renders the real
// page components with a dummy participant, so it can never drift from the
// real pages the way a hand-written copy could.
//
// Runs automatically after every build (see package.json "postbuild"), so
// the snapshots are always fresh - no manual regeneration step.
import { execSync } from "node:child_process"
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { createServer } from "vite"

const root = path.resolve(import.meta.dirname, "..")
const distDir = path.join(root, "dist")
const outDir = path.join(distDir, "preview")

// styled-components needs to go through Vite's own transform (its default
// export otherwise hits an ESM/CJS interop mismatch when required raw by
// Node); react/react-dom must stay external - they're plain CJS and break
// under Vite's SSR module runner if forced through the same transform.
const vite = await createServer({
  root,
  appType: "custom",
  server: { middlewareMode: true },
  ssr: { noExternal: ["styled-components"] },
})

try {
  // Loaded through the same SSR module graph as the page components (rather
  // than a plain top-level import) so ServerStyleSheet shares the exact
  // styled-components instance the components' styled() calls register
  // with - otherwise collectStyles silently collects nothing.
  const { ServerStyleSheet } = await vite.ssrLoadModule("styled-components")
  const { ParticipantContext } = await vite.ssrLoadModule("/src/data/participantContext.ts")
  const { normalizeParticipant } = await vite.ssrLoadModule("/src/data/participant.ts")
  const { PAGES } = await vite.ssrLoadModule("/src/routes.ts")

  // Stand-in coach settings, so snapshots show the WhatsApp / community buttons.
  globalThis.__PREVIEW_COACH__ = {
    name: "שם המאמנת",
    email: "coach@example.com",
    phone: "972500000000",
    communityUrl: "https://chat.whatsapp.com/example",
    slug: "preview",
    privacyUrl: null,
    requireHoldonConsent: true,
    longGapHours: 5,
    summaryDeliveryText: null,
  }

  const dummyParticipant = normalizeParticipant({
    participantId: "preview",
    coachSlug: "preview",
    firstName: "שם לדוגמה",
    day1: {},
    day2: {},
    day3: {},
    toolbox: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  // "?filled" view: the same pages after a participant finished, with sample
  // answers, so the feedback / completion state can be reviewed without JS.
  const done = new Date().toISOString()
  const filledParticipant = normalizeParticipant({
    ...dummyParticipant,
    day1: {
      breakfast: { time: "07:30", food: "קפה וטוסט" },
      lunch: { time: "13:30", food: "סלט עם טונה" },
      dinner: { time: "20:00", food: "חביתה וירקות" },
      additionalSnacks: [{ time: "16:00", food: "פרי" }],
      hardestMoment: "afternoon",
      completedAt: done,
    },
    day2: {
      mealChosen: "lunch",
      protein: false,
      vegetables: true,
      carbs: true,
      fat: false,
      completedAt: done,
    },
    day3: {
      momentChoice: "afternoon",
      happensChoice: "grabWhatever",
      helpChoice: "protein",
      extraNote: "",
      completedAt: done,
    },
    toolbox: { selectedTools: ["cookTwice", "freezer"], completedAt: done },
  })

  const contextFor = (participant) => ({
    participant,
    syncState: "local",
    adoptById: async () => false,
    updateSection: () => {},
    completeSection: async () => false,
    retrySync: async () => false,
  })

  const assetsDir = path.join(distDir, "assets")
  const builtAssets = fs.readdirSync(assetsDir)
  const cssFile = builtAssets.find((f) => f.endsWith(".css"))

  // Images imported by the components render as dev URLs (/src/assets/day1.webp)
  // under SSR; point them at the hashed files Vite emitted into dist/assets.
  const fixAssetUrls = (html) =>
    html.replace(/\/src\/assets\/([\w-]+)\.(jpg|jpeg|png|webp|svg)/g, (match, name, ext) => {
      const built = builtAssets.find((f) => f.startsWith(`${name}-`) && f.endsWith(`.${ext}`))
      return built ? `/assets/${built}` : match
    })

  // ---- Build identity ------------------------------------------------------
  // Vercel's commit sha, else the local git sha, else a timestamp.
  const generatedAt = new Date().toISOString()
  let buildId = process.env.VERCEL_GIT_COMMIT_SHA ?? ""
  if (!buildId) {
    try {
      buildId = execSync("git rev-parse HEAD", { cwd: root, stdio: ["ignore", "pipe", "ignore"] })
        .toString()
        .trim()
    } catch {
      buildId = `local-${Date.now()}`
    }
  }
  const shortId = buildId.slice(0, 7)

  const sha256 = (text) => crypto.createHash("sha256").update(text).digest("hex")

  // ---- Rendering -----------------------------------------------------------
  const render = (Component, participant) => {
    const sheet = new ServerStyleSheet()
    const element = React.createElement(
      MemoryRouter,
      { initialEntries: ["/"] },
      React.createElement(
        ParticipantContext.Provider,
        { value: contextFor(participant) },
        React.createElement(Component),
      ),
    )
    try {
      const body = fixAssetUrls(renderToStaticMarkup(sheet.collectStyles(element)))
      return { body, styleTags: sheet.getStyleTags() }
    } finally {
      sheet.seal()
    }
  }

  const { default: ToolsCatalog } = await vite.ssrLoadModule("/src/preview/ToolsCatalog.tsx")

  // Every state of the participant-facing site, in reading order.
  const states = []
  for (const page of PAGES) {
    const name = page.slug.replace(/^challenge-/, "")
    states.push({ name, title: page.title, state: "ריק", Component: page.Component, filled: false })
    states.push({
      name: `${name}-filled`,
      title: `${page.title} (אחרי מילוי)`,
      state: "אחרי מילוי",
      Component: page.Component,
      filled: true,
      redirectFrom: name,
    })
  }
  states.push({
    name: "toolbox-tools",
    title: "ארגז הכלים: כל הכלים פתוחים",
    state: "כל הכלים פתוחים",
    Component: ToolsCatalog,
    filled: true,
  })

  const head = (title, styleTags, extra = "") => `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ""}
    <title>${title}</title>
    ${styleTags}
    ${extra}
  </head>`

  // The hash is taken BEFORE the build stamp is added, so a page's hash only
  // changes when its content changes, not on every deploy.
  const stamp = (html) =>
    html
      .replace("<head>", `<head>\n    <meta name="build-id" content="${buildId}" />`)
      .replace(
        "</body>",
        `<p dir="ltr" style="text-align:center;font:12px sans-serif;color:#777;margin:16px">build ${shortId} · ${generatedAt}</p>\n  </body>`,
      )

  fs.mkdirSync(outDir, { recursive: true })
  const manifestPages = []
  const rendered = []

  for (const st of states) {
    const { body, styleTags } = render(st.Component, st.filled ? filledParticipant : dummyParticipant)
    rendered.push({ ...st, body, styleTags })

    // Static hosting can't branch on a query string, so the plain page sends
    // "?filled" visitors to the filled snapshot.
    const redirect =
      st.redirectFrom || st.filled
        ? ""
        : `<script>if (/[?&]filled/.test(location.search)) location.replace("/preview/${st.name}-filled")</script>`

    const html = `${head(`${st.title} – תצוגה מקדימה`, styleTags, redirect)}
  <body>
    <div id="root">${body}</div>
  </body>
</html>
`
    fs.writeFileSync(path.join(outDir, `${st.name}.html`), stamp(html))
    manifestPages.push({
      name: st.name,
      title: st.title,
      path: `/preview/${st.name}`,
      sha256: sha256(html),
      bytes: Buffer.byteLength(html),
    })
    console.log(`wrote dist/preview/${st.name}.html`)
  }

  // ---- site.html: every state in one document -------------------------------
  const allStyles = [
    ...new Set(rendered.flatMap((r) => r.styleTags.match(/<style[\s\S]*?<\/style>/g) ?? [])),
  ]
  const siteSections = rendered
    .map(
      (r) => `<section id="${r.name}" data-state="${r.state}" style="border-top:6px solid #D8C9F0;margin-top:32px">
  <h2 dir="rtl" style="font:700 14px sans-serif;background:#2B2140;color:#fff;padding:8px 12px;margin:0">${r.title} · ${r.state}</h2>
  ${r.body}
</section>`,
    )
    .join("\n")
  const siteHtml = `${head("כל האתר: תצוגה מקדימה", allStyles.join("\n"), "<style>[data-progress-bar]{position:static !important}</style>")}
  <body>
    <div id="root">${siteSections}</div>
  </body>
</html>
`
  fs.writeFileSync(path.join(outDir, "site.html"), stamp(siteHtml))
  manifestPages.push({
    name: "site",
    title: "כל האתר במסמך אחד",
    path: "/preview/site",
    sha256: sha256(siteHtml),
    bytes: Buffer.byteLength(siteHtml),
  })
  console.log("wrote dist/preview/site.html")

  // ---- index.html, version.json, manifest.json, agent.md --------------------
  const links = manifestPages
    .map((m) => `<li><a href="${m.path}">${m.title}</a> <small dir="ltr">${m.path}</small></li>`)
    .join("\n      ")
  const indexHtml = `${head("תצוגה מקדימה של האתר", "", "<style>body{font:16px/1.7 sans-serif;max-width:640px;margin:24px auto;padding:0 16px}small{color:#777}</style>")}
  <body>
    <h1>תצוגה מקדימה של האתר (ללא JavaScript)</h1>
    <p>כל דפי המשתתפים כמסמכי HTML רגילים, ריקים ואחרי מילוי. האתר האמיתי הוא אפליקציה שנטענת ב-JavaScript, ולכן כאן יש עותק סטטי של אותו תוכן.</p>
    <p><a href="/preview/site"><strong>כל האתר במסמך אחד</strong></a></p>
    <ul>
      ${links}
    </ul>
    <h2>איך בודקים שיש עדכון</h2>
    <ol>
      <li>לקרוא את <code dir="ltr">/preview/live/&lt;מחרוזת חדשה&gt;/version.json</code> (למשל <code dir="ltr">/preview/live/1759148000/version.json</code>). המחרוזת חייבת להיות חדשה בכל פעם, כדי שאף מטמון, גם של כלי הקריאה, לא יענה במקום השרת.</li>
      <li>אם <code>buildId</code> זהה למה שנשמר בפעם הקודמת, אין שינוי.</li>
      <li>אם שונה: לקרוא את <code dir="ltr">/preview/live/&lt;מחרוזת חדשה&gt;/manifest.json</code>, להשוות את <code>sha256</code> של כל דף, ולקרוא מחדש רק דפים ששונו.</li>
    </ol>
    <p>הוראות מלאות לסוכן: <a href="/preview/agent.md">/preview/agent.md</a></p>
  </body>
</html>
`
  fs.writeFileSync(path.join(outDir, "index.html"), stamp(indexHtml))

  fs.writeFileSync(
    path.join(outDir, "version.json"),
    JSON.stringify({ buildId, generatedAt }, null, 2) + "\n",
  )
  fs.writeFileSync(
    path.join(outDir, "manifest.json"),
    JSON.stringify({ buildId, generatedAt, pages: manifestPages }, null, 2) + "\n",
  )

  const agentMd = `# How to read this site without JavaScript

The real site is a single-page app, so fetching its normal URLs returns an empty shell.
Read the static copies under /preview instead. They are generated from the same
components on every deploy, so they show the current content.

## Entry points (relative to the site's domain)

- /preview : index of everything
- /preview/site : ALL pages, empty and filled, in one document (one fetch)
- /preview/version.json : tiny file with the current buildId (cheapest freshness check)
- /preview/manifest.json : every page with a sha256 of its content

Individual pages:
${manifestPages.map((m) => `- ${m.path} : ${m.title}`).join("\n")}

Note: "-filled" pages show the screen after a participant finished, with sample answers.
"toolbox-tools" shows every toolbox tool fully expanded.

## Checking for updates (do this before relying on anything you fetched earlier)

1. Fetch the version file through a URL that has never been requested before, so no
   cache (including your fetch tool's own memory) can answer it:
     /preview/live/<any new string>/version.json
   for example /preview/live/1759148000/version.json. Use a NEW string every time
   (a timestamp or random number). The "live/<string>" part is ignored by the server
   and only makes the URL unique. This works even if your tool ignores query strings.
   Fallback if your tool does not ignore them: /preview/version.json?t=<new number>.
2. If buildId equals the buildId you remembered: nothing changed. Reuse what you have.
3. If it differs: fetch /preview/live/<new string>/manifest.json (fresh URL again). For each page,
   compare its sha256 with the value you remembered. Re-fetch only the pages whose hash
   changed (or /preview/live/<new string>/site for everything; every page works under
   /preview/live/<new string>/<page>). Then remember the new buildId and hashes.
4. To double-check a page, the "build ..." line at the bottom of each page and its
   <meta name="build-id"> must equal the buildId in version.json.

Why this works: /preview/* is served with "Cache-Control: max-age=0, must-revalidate", so
caches always ask the server whether their copy is still current. A page's sha256 only
changes when its content changes, not on every deploy. Images and CSS have content-hashed
file names, so a cached copy of them is never stale.

Current build: ${shortId} (${generatedAt})
`
  fs.writeFileSync(path.join(outDir, "agent.md"), agentMd)
  console.log("wrote dist/preview/{index.html,version.json,manifest.json,agent.md}")
} finally {
  await vite.close()
}
