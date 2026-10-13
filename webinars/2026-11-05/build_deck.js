// Builds the Nov 5 webinar deck in the style of the earlier Hennessey speaker deck.
// usage: node build_deck.js <assets dir from assets.py> <output dir>
// needs pptxgenjs, react, react-dom, react-icons, sharp; APPLY_THEME = path to the pptx skill's apply_theme.js
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa6");
const { applyTheme } = require(process.env.APPLY_THEME || "./apply_theme.js");

const [A, OUT] = process.argv.slice(2);
const HEX = { ink: "0E1A24", navy: "08141C", cyan: "02B5E6", white: "FFFFFF", muted: "9FB0BB", card: "F2F5F7" };
const THEME = {
  name: "Hennessey Digital Webinar",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: HEX.ink, lt1: HEX.white, dk2: HEX.navy, lt2: HEX.muted,
    accent1: HEX.cyan, accent2: HEX.card, accent3: "0089AF", accent4: "5E6E79", accent5: "7FD8F2", accent6: "D9F3FB",
    hlink: HEX.cyan, folHlink: "7FD8F2",
  },
};

async function icon(Comp, color) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: 256 }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer()).toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.title = "AI and the Agency of the Future";
  pres.company = "Hennessey Digital";
  const C = pres.SchemeColor;
  const W = 13.333, H = 7.5, PANEL = 5.0;
  const logoBadge = { image: { path: `${A}/logo_clear.png`, x: 12.15, y: 6.75, w: 0.7, h: 0.585 } };

  // ---------- layouts ----------
  pres.defineSlideMaster({ title: "TITLE", background: { path: `${A}/bg_title.jpg` }, objects: [] });
  pres.defineSlideMaster({
    title: "CONTENT",
    background: { path: `${A}/bg_navy.jpg` },
    objects: [
      logoBadge,
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.55, w: 11.4, h: 0.8, fontSize: 34, color: C.accent1, margin: 0, valign: "top", align: "left" }, text: "" } },
    ],
  });
  // half-bleed: art panel is added per slide on the left, text sits on the right
  pres.defineSlideMaster({
    title: "SPLIT",
    background: { path: `${A}/bg_navy.jpg` },
    objects: [
      logoBadge,
      { placeholder: { options: { name: "title", type: "title", x: PANEL + 0.6, y: 1.3, w: W - PANEL - 1.3, h: 1.6, fontSize: 32, color: C.accent1, margin: 0, valign: "bottom", align: "left" }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "DIVIDER",
    background: { path: `${A}/bg_navy.jpg` },
    objects: [
      logoBadge,
      { placeholder: { options: { name: "title", type: "title", x: PANEL + 0.6, y: 2.6, w: W - PANEL - 1.3, h: 2.6, fontSize: 40, color: C.background1, margin: 0, valign: "top", align: "left" }, text: "" } },
    ],
  });

  const panel = (s, name) => s.addImage({ path: `${A}/panel_${name}.jpg`, x: 0, y: 0, w: PANEL, h: H, objectName: "Art panel" });
  const tx = (s, text, o) => s.addText(text, { margin: 0, isTextBox: true, ...o });
  const iconBadge = async (s, Comp, x, y, d, name) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: C.text2 }, line: { type: "none" }, objectName: name + " badge" });
    const p = d * 0.26;
    s.addImage({ data: await icon(Comp, HEX.cyan), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, objectName: name + " icon" });
  };
  // light cards on navy, as on the "Avatar Client Profile" slide
  const cards = async (s, items, y = 2.2, h = 3.5) => {
    const gap = 0.3, w = (W - 1.2 - gap * (items.length - 1)) / items.length;
    for (const [i, [Ico, head, q]] of items.entries()) {
      const x = 0.6 + i * (w + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: C.accent2 }, line: { type: "none" }, objectName: head + " card" });
      await iconBadge(s, Ico, x + 0.4, y + 0.4, 0.95, head);
      tx(s, head, { x: x + 0.4, y: y + 1.55, w: w - 0.8, h: 0.5, fontSize: 22, bold: true, color: C.text1, objectName: head + " heading" });
      tx(s, q, { x: x + 0.4, y: y + 2.15, w: w - 0.8, h: h - 2.4, fontSize: 16, color: C.accent4, valign: "top", objectName: head + " prompt" });
    }
  };
  const divider = (n, panelName, title, note) => {
    pres.addSection({ title: `Topic ${n}` });
    const s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: `Topic ${n}` });
    panel(s, panelName);
    tx(s, `TOPIC 0${n}`, { x: PANEL + 0.6, y: 2.0, w: 5, h: 0.4, fontSize: 16, bold: true, charSpacing: 4, color: C.accent1 });
    s.addText(title, { placeholder: "title" });
    s.addNotes(note);
  };

  // ---------- 1. Title ----------
  pres.addSection({ title: "Welcome" });
  let s = pres.addSlide({ masterName: "TITLE", sectionTitle: "Welcome" });
  // left column: one shared left edge, a clear size ladder, and even gaps between groups
  const L = 0.75, COL = 5.9;
  tx(s, "LIVE WEBINAR", { x: L, y: 0.85, w: COL, h: 0.3, fontSize: 13, bold: true, charSpacing: 6, color: C.accent1 });
  tx(s, "AI AND THE", { x: L, y: 1.4, w: COL, h: 0.5, fontSize: 30, charSpacing: 6, color: C.background1, objectName: "Title line 1" });
  tx(s, "AGENCY", { x: L - 0.05, y: 1.85, w: COL + 0.5, h: 1.3, fontSize: 92, bold: true, color: C.background1, valign: "middle", objectName: "Title line 2" });
  tx(s, "OF THE FUTURE", { x: L, y: 3.15, w: COL, h: 0.6, fontSize: 34, charSpacing: 6, color: C.accent1, objectName: "Title line 3" });
  tx(s, "What’s deployed, what’s paying off, and what the agency of the future looks like from the inside.",
    { x: L, y: 4.1, w: 5.6, h: 0.8, fontSize: 16, color: C.background2, valign: "top", lineSpacingMultiple: 1.2 });
  await iconBadge(s, fa.FaRegCalendar, L, 5.3, 0.66, "Date");
  tx(s, [
    { text: "Thursday, November 5", options: { bold: true, color: C.background1, breakLine: true } },
    { text: "12:00 PM EST", options: { bold: true, color: C.accent1 } },
    { text: "   ·   9:00 AM PST", options: { color: C.background2 } },
  ], { x: L + 0.9, y: 5.25, w: 4.6, h: 0.76, fontSize: 17, valign: "middle", lineSpacingMultiple: 1.15 });
  tx(s, [
    { text: "WEBINAR FOR  ", options: { color: C.background2 } },
    { text: "HENNESSEY DIGITAL", options: { bold: true, color: C.background1 } },
  ], { x: L, y: 6.55, w: COL, h: 0.3, fontSize: 11, charSpacing: 3 });
  // staggered glowing portraits; each name sits beside its photo, centred on it
  const speaker = (img, name, org, px, py, side) => {
    const d = 3.3, inset = d * 0.076, cy = py + d / 2;
    s.addImage({ path: `${A}/${img}`, x: px, y: py, w: d, h: d, objectName: name + " photo", altText: name });
    const box = side === "right"
      ? { x: px + d - inset + 0.2, w: 2.3, align: "left" }
      : { x: px + inset - 0.2 - 2.5, w: 2.5, align: "right" };
    tx(s, [{ text: name, options: { bold: true, fontSize: 20, color: C.background1, breakLine: true } },
           { text: org, options: { fontSize: 14, color: C.accent1 } }],
      { ...box, y: cy - 0.4, h: 0.8, valign: "middle", lineSpacingMultiple: 1.1, objectName: name + " label" });
  };
  speaker("dan_ring.png", "Dan Hinckley", "Herringbone", 7.25, 0.6, "right");
  speaker("rob_ring.png", "Rob Coleman", "Hennessey Digital", 9.45, 3.6, "left");
  s.addNotes("Welcome everyone. Housekeeping: the session is recorded, use the chat, Q&A at the end.");

  // ---------- 2. Speakers ----------
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Welcome" });
  s.addText("Your Speakers", { placeholder: "title" });
  for (const [name, org, img, x] of [["Dan Hinckley", "Herringbone", "dan_ring.png", 0.9], ["Rob Coleman", "Hennessey Digital", "rob_ring.png", 7.0]]) {
    s.addImage({ path: `${A}/${img}`, x, y: 1.9, w: 3.1, h: 3.1, objectName: name + " photo", altText: name });
    tx(s, name, { x: x + 3.25, y: 2.9, w: 2.6, h: 0.9, fontSize: 26, bold: true, color: C.background1, valign: "bottom" });
    tx(s, org, { x: x + 3.25, y: 3.9, w: 2.6, h: 0.4, fontSize: 17, color: C.accent1 });
  }
  tx(s, "Two people who build this for a living, talking through what they’re seeing with real clients and real teams.",
    { x: 0.9, y: 5.6, w: 11, h: 0.8, fontSize: 18, color: C.background2, valign: "top" });
  s.addNotes("Each speaker introduces themselves: role, company, and what they've built with AI inside agencies.");

  // ---------- 3. Why this conversation ----------
  s = pres.addSlide({ masterName: "SPLIT", sectionTitle: "Welcome" });
  panel(s, "network");
  s.addText("Every agency owner is being told AI changes everything", { placeholder: "title" });
  tx(s, "Few have heard from anyone who’s actually run that change inside a real agency.",
    { x: PANEL + 0.6, y: 3.3, w: W - PANEL - 1.3, h: 1.0, fontSize: 20, color: C.background1, valign: "top", lineSpacingMultiple: 1.3 });
  tx(s, [
    { text: "No pitch. No hype cycle. ", options: { bold: true, color: C.background1 } },
    { text: "Just what’s deployed, what’s paying off, and what the agency of the future looks like from the inside.", options: { color: C.background2 } },
  ], { x: PANEL + 0.6, y: 4.5, w: W - PANEL - 1.3, h: 1.3, fontSize: 18, valign: "top", lineSpacingMultiple: 1.3 });
  s.addNotes("Set the tone: a candid conversation, not a sales pitch.");

  // ---------- 4. Agenda ----------
  s = pres.addSlide({ masterName: "SPLIT", sectionTitle: "Welcome" });
  panel(s, "paths");
  s.addText("What We’ll Cover", { placeholder: "title" });
  const topics = [
    ["Where AI is actually deployed inside agencies today", "and where it’s stalled out"],
    ["What’s changing in search, client demand and service delivery", "and what isn’t"],
    ["What the agency of the future looks like", "team structure, headcount, service mix"],
    ["What agency owners get wrong about AI", "and what to focus on instead"],
  ];
  topics.forEach(([head, sub], i) => {
    const y = 3.2 + i * 0.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: PANEL + 0.6, y: y + 0.05, w: 0.55, h: 0.55, rectRadius: 0.08, fill: { color: C.accent1 }, line: { type: "none" }, objectName: `Topic ${i + 1} badge` });
    tx(s, String(i + 1), { x: PANEL + 0.6, y: y + 0.05, w: 0.55, h: 0.55, fontSize: 18, bold: true, color: C.background1, align: "center", valign: "middle" });
    tx(s, [{ text: head, options: { color: C.background1, breakLine: true } }, { text: sub, options: { color: C.background2, fontSize: 14 } }],
      { x: PANEL + 1.45, y, w: W - PANEL - 2.2, h: 0.8, fontSize: 17, valign: "top" });
  });
  s.addNotes("Walk through the four topics. Q&A at the end.");

  // ---------- Topics ----------
  divider(1, "bars", "Where AI Is Actually Deployed Inside Agencies Today", "Topic 1: what's live and paying off versus what's stalled.");
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Topic 1" });
  s.addText("Deployed vs. Stalled Out", { placeholder: "title" });
  await cards(s, [
    [fa.FaCircleCheck, "Deployed and paying off", "Which AI workflows are running inside real agencies today, and where are they earning their keep?"],
    [fa.FaCirclePause, "Stalled out", "Where have AI rollouts stalled, and what’s holding them back?"],
  ]);
  s.addNotes("Discussion: concrete examples of AI in production at agencies, and the projects that stalled.");

  divider(2, "wave", "What’s Changing in Search, Client Demand and Service Delivery", "Topic 2: what's shifting, and what's staying the same.");
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Topic 2" });
  s.addText("What’s Changing, and What Isn’t", { placeholder: "title" });
  await cards(s, [
    [fa.FaMagnifyingGlass, "Search", "How is AI reshaping how clients’ customers search and find them?"],
    [fa.FaHandshake, "Client demand", "What are clients asking agencies for now that they weren’t a year ago?"],
    [fa.FaGears, "Service delivery", "How is the work itself getting done differently, and what still needs people?"],
  ]);
  s.addNotes("Discussion: changes across search, client demand and delivery. Call out what hasn't changed too.");

  divider(3, "grid", "What the Agency of the Future Looks Like", "Topic 3: the shape of the agency in five years.");
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Topic 3" });
  s.addText("The Agency of the Future, From the Inside", { placeholder: "title" });
  await cards(s, [
    [fa.FaSitemap, "Team structure", "How do roles and reporting lines change when AI is part of the team?"],
    [fa.FaUserGroup, "Headcount", "Does the agency of the future get smaller, or just different?"],
    [fa.FaLayerGroup, "Service mix", "Which services grow, which shrink, and which are new?"],
  ]);
  s.addNotes("Discussion: team structure, headcount and service mix five years out.");

  divider(4, "rings", "What Agency Owners Get Wrong About AI", "Topic 4: common mistakes and where to focus instead.");
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Topic 4" });
  s.addText("Common Mistakes, and Where to Focus Instead", { placeholder: "title" });
  await cards(s, [
    [fa.FaTriangleExclamation, "What owners get wrong", "Where are agency owners misreading AI, or spending effort in the wrong place?"],
    [fa.FaBullseye, "What to focus on instead", "What should owners prioritise now to be well placed in five years?"],
  ]);
  s.addNotes("Discussion: mistakes you see agency owners making, and the practical alternative.");

  // ---------- Close ----------
  pres.addSection({ title: "Close" });
  s = pres.addSlide({ masterName: "TITLE", sectionTitle: "Close" });
  tx(s, "Q&A", { x: 0.7, y: 1.6, w: 6, h: 0.4, fontSize: 16, bold: true, charSpacing: 5, color: C.accent1 });
  tx(s, "YOUR QUESTIONS", { x: 0.7, y: 2.1, w: 11.5, h: 1.2, fontSize: 60, bold: true, color: C.background1, valign: "top" });
  tx(s, "Ask in the chat or the Q&A panel", { x: 0.7, y: 3.45, w: 6.5, h: 0.5, fontSize: 20, color: C.background2 });
  await iconBadge(s, fa.FaComments, 0.7, 4.4, 1.0, "Q&A");
  s.addImage(logoBadge.image);
  s.addNotes("Open the floor. Read questions from the chat.");

  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Close" });
  s.addText("Thank You for Joining", { placeholder: "title" });
  s.addImage({ path: `${A}/dan_ring.png`, x: 0.7, y: 1.8, w: 2.8, h: 2.8, objectName: "Dan Hinckley photo", altText: "Dan Hinckley" });
  s.addImage({ path: `${A}/rob_ring.png`, x: 3.6, y: 1.8, w: 2.8, h: 2.8, objectName: "Rob Coleman photo", altText: "Rob Coleman" });
  tx(s, [{ text: "Dan Hinckley", options: { bold: true, color: C.background1, breakLine: true } }, { text: "Herringbone", options: { color: C.accent1 } }],
    { x: 0.7, y: 4.75, w: 2.8, h: 0.7, fontSize: 16, align: "center", valign: "top" });
  tx(s, [{ text: "Rob Coleman", options: { bold: true, color: C.background1, breakLine: true } }, { text: "Hennessey Digital", options: { color: C.accent1 } }],
    { x: 3.6, y: 4.75, w: 2.8, h: 0.7, fontSize: 16, align: "center", valign: "top" });
  s.addImage({ path: `${A}/logo_clear.png`, x: 7.9, y: 1.7, w: 3.2, h: 2.67, objectName: "Hennessey Digital logo" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.95, y: 4.75, w: 3.1, h: 0.7, rectRadius: 0.1, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Website button" });
  tx(s, "hennessey.com", { x: 7.95, y: 4.75, w: 3.1, h: 0.7, fontSize: 20, bold: true, color: C.background1, align: "center", valign: "middle", hyperlink: { url: "https://hennessey.com" } });
  s.addNotes("Thank attendees and speakers. Mention the recording will be shared.");

  const file = `${OUT}/november_webinar_deck.pptx`;
  await pres.writeFile({ fileName: file });
  await applyTheme(file, THEME);
  console.log("wrote", file);
})();
