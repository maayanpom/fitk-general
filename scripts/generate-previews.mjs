// Generates static, server-rendered snapshots of the participant-facing
// challenge pages (day 1/2/3 + toolbox) at dist/preview/*.html, served at
// /preview/day-1 etc (see vercel.json). Purpose: let a reviewer (human or an
// agent that can't run JavaScript) see the actual current markup of these
// pages without needing a real participant/personal link - renders the real
// page components with a dummy participant, so it can never drift from the
// real pages the way a hand-written copy could.
//
// Runs automatically after every build (see package.json "postbuild"), so
// the snapshots are always fresh - no manual regeneration step.
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

  // Images imported by the components render as dev URLs (/src/assets/day1.jpg)
  // under SSR; point them at the hashed files Vite emitted into dist/assets.
  const fixAssetUrls = (html) =>
    html.replace(/\/src\/assets\/([\w-]+)\.(jpg|jpeg|png|webp|svg)/g, (match, name, ext) => {
      const built = builtAssets.find(
        (f) => f.startsWith(`${name}-`) && f.endsWith(`.${ext}`),
      )
      return built ? `/assets/${built}` : match
    })

  fs.mkdirSync(outDir, { recursive: true })

  for (const page of PAGES) {
    for (const variant of ["", "-filled"]) {
      const filled = variant === "-filled"
      const sheet = new ServerStyleSheet()
      const element = React.createElement(
        MemoryRouter,
        { initialEntries: [`/${page.slug}`] },
        React.createElement(
          ParticipantContext.Provider,
          { value: contextFor(filled ? filledParticipant : dummyParticipant) },
          React.createElement(page.Component),
        ),
      )

      let body
      let styleTags
      try {
        body = renderToStaticMarkup(sheet.collectStyles(element))
        styleTags = sheet.getStyleTags()
      } finally {
        sheet.seal()
      }

      const outName = page.slug.replace(/^challenge-/, "")
      // Static hosting can't branch on a query string, so the plain page sends
      // "?filled" visitors to the filled snapshot.
      const redirect = filled
        ? ""
        : `<script>if (/[?&]filled\b/.test(location.search)) location.replace("/preview/${outName}-filled")</script>`

      const html = `<!doctype html>
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
    <title>${page.title} – תצוגה מקדימה${filled ? " (אחרי מילוי)" : ""}</title>
    ${styleTags}
    ${redirect}
  </head>
  <body>
    <div id="root">${fixAssetUrls(body)}</div>
  </body>
</html>
`

      fs.writeFileSync(path.join(outDir, `${outName}${variant}.html`), html)
      console.log(`wrote dist/preview/${outName}${variant}.html`)
    }
  }
} finally {
  await vite.close()
}
