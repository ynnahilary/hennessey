const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa6");
const { applyTheme } = require(process.env.APPLY_THEME || "./apply_theme.js");

const [ASSETS, OUT] = process.argv.slice(2); // ASSETS holds dan.png, rob.png, logo.png

const HEX = { bg: "231E1F", card: "322C2D", cyan: "02B5E6", white: "FFFFFF", muted: "B9B6B7" };
const THEME = {
  name: "Hennessey Digital",
  headFontFace: "Cambria",
  bodyFontFace: "Arial",
  colors: {
    dk1: HEX.bg, lt1: HEX.white, dk2: HEX.card, lt2: HEX.muted,
    accent1: HEX.cyan, accent2: "7FD8F2", accent3: "5E5859", accent4: "8C8687", accent5: "0089AF", accent6: "D9F3FB",
    hlink: HEX.cyan, folHlink: "7FD8F2",
  },
};

async function icon(Comp, color = "#" + HEX.cyan) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.title = "AI and the Agency of the Future";
  pres.company = "Hennessey Digital";
  const C = pres.SchemeColor;
  const W = 13.333;

  // ---------- layouts ----------
  pres.defineSlideMaster({
    title: "PLAIN",
    background: { color: HEX.bg },
    objects: [],
  });
  pres.defineSlideMaster({
    title: "CONTENT",
    background: { color: HEX.bg },
    objects: [
      { image: { path: `${ASSETS}/logo.png`, x: 12.05, y: 6.55, w: 0.7, h: 0.7 } },
      { text: { text: "AI and the Agency of the Future  ·  November 5", options: { x: 0.6, y: 6.8, w: 7, h: 0.3, fontSize: 11, color: C.background2, margin: 0 } } },
      { placeholder: { options: { name: "eyebrow", type: "body", x: 0.6, y: 0.5, w: 8, h: 0.35, fontSize: 14, bold: true, color: C.accent1, charSpacing: 3, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.9, w: 12.1, h: 0.9, fontSize: 36, color: C.background1, fontFace: "Cambria", margin: 0, valign: "top", align: "left" }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "SECTION",
    background: { color: HEX.bg },
    objects: [
      { image: { path: `${ASSETS}/logo.png`, x: 12.05, y: 6.55, w: 0.7, h: 0.7 } },
      { placeholder: { options: { name: "title", type: "title", x: 3.4, y: 2.55, w: 9.2, h: 2.4, fontSize: 40, color: C.background1, fontFace: "Cambria", margin: 0, valign: "middle", align: "left" }, text: "" } },
    ],
  });

  const ring = (slide, x, y, d, name) =>
    slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: C.text2 }, line: { color: C.accent1, width: 2.5 }, objectName: name });
  const iconCircle = async (slide, Comp, x, y, d, name) => {
    ring(slide, x, y, d, name + " ring");
    const pad = d * 0.27;
    slide.addImage({ data: await icon(Comp), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, objectName: name + " icon" });
  };
  const numCircle = (slide, n, x, y, d, size) => {
    ring(slide, x, y, d, `Number ${n} ring`);
    slide.addText(n, { x, y, w: d, h: d, align: "center", valign: "middle", fontSize: size, bold: true, color: C.accent1, margin: 0, isTextBox: true, objectName: `Number ${n}` });
  };
  const card = (slide, x, y, w, h, name) =>
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: C.text2 }, line: { type: "none" }, objectName: name });

  // ---------- 1. Title ----------
  pres.addSection({ title: "Welcome" });
  let s = pres.addSlide({ masterName: "PLAIN", sectionTitle: "Welcome" });
  s.addImage({ path: `${ASSETS}/logo.png`, x: 0.6, y: 0.45, w: 1.35, h: 1.35, objectName: "Logo" });
  s.addText("LIVE WEBINAR", { x: 0.75, y: 2.25, w: 5, h: 0.4, fontSize: 16, bold: true, charSpacing: 3, color: C.accent1, margin: 0, isTextBox: true });
  s.addText([
    { text: "AI and the", options: { breakLine: true } },
    { text: "Agency of the", options: { breakLine: true } },
    { text: "Future", options: { color: C.accent1 } },
  ], { x: 0.75, y: 2.8, w: 6.4, h: 2.6, fontSize: 52, fontFace: "Cambria", color: C.background1, margin: 0, valign: "top", lineSpacingMultiple: 0.95, isTextBox: true, objectName: "Webinar title" });
  s.addText("Thursday, November 5", { x: 0.75, y: 5.55, w: 6.4, h: 0.45, fontSize: 24, bold: true, color: C.background1, margin: 0, isTextBox: true });
  s.addText([
    { text: "12:00 PM EST", options: { bold: true, color: C.accent1 } },
    { text: "   |   9:00 AM PST", options: { color: C.background2 } },
  ], { x: 0.75, y: 6.05, w: 6.4, h: 0.45, fontSize: 20, margin: 0, isTextBox: true });
  s.addText("FEATURING", { x: 7.05, y: 1.3, w: 5.8, h: 0.4, fontSize: 13, bold: true, charSpacing: 3, color: C.background2, align: "center", margin: 0, isTextBox: true });
  for (const [name, org, img, x] of [["Dan Hinckley", "Herringbone", "dan.png", 7.35], ["Rob Coleman", "Hennessey Digital", "rob.png", 10.25]]) {
    s.addImage({ path: `${ASSETS}/${img}`, x, y: 2.0, w: 2.6, h: 2.6, objectName: name + " photo", altText: name });
    s.addText(name, { x: x - 0.3, y: 4.85, w: 3.2, h: 0.5, fontSize: 24, bold: true, color: C.background1, align: "center", margin: 0, isTextBox: true });
    s.addText(org, { x: x - 0.3, y: 5.35, w: 3.2, h: 0.4, fontSize: 16, color: C.background2, align: "center", margin: 0, isTextBox: true });
  }
  s.addNotes("Welcome everyone. Introduce the session and housekeeping: recording, chat, Q&A at the end.");

  // ---------- 2. Speakers ----------
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Welcome" });
  s.addText("YOUR SPEAKERS", { placeholder: "eyebrow" });
  s.addText("Two people who build this for a living", { placeholder: "title" });
  for (const [name, org, img, x] of [["Dan Hinckley", "Herringbone", "dan.png", 0.6], ["Rob Coleman", "Hennessey Digital", "rob.png", 6.85]]) {
    card(s, x, 2.2, 5.9, 3.9, name + " card");
    s.addImage({ path: `${ASSETS}/${img}`, x: x + 0.45, y: 2.75, w: 2.8, h: 2.8, objectName: name + " photo", altText: name });
    s.addText(name, { x: x + 3.55, y: 3.4, w: 2.2, h: 0.9, fontSize: 26, bold: true, color: C.background1, margin: 0, valign: "bottom", isTextBox: true });
    s.addText(org, { x: x + 3.55, y: 4.4, w: 2.2, h: 0.4, fontSize: 16, color: C.accent1, margin: 0, isTextBox: true });
  }
  s.addNotes("Each speaker introduces themselves: role, company, and what they've built with AI inside agencies.");

  // ---------- 3. Premise ----------
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Welcome" });
  s.addText("WHY THIS CONVERSATION", { placeholder: "eyebrow" });
  s.addText("Everyone has an opinion on AI. Few have run it", { placeholder: "title" });
  await iconCircle(s, fa.FaQuoteLeft, 0.6, 2.35, 1.1, "Quote");
  s.addText("Every agency owner is being told AI changes everything. Few have heard from anyone who’s actually run that change inside a real agency.",
    { x: 2.1, y: 2.2, w: 10.4, h: 1.9, fontSize: 28, italic: true, fontFace: "Cambria", color: C.background1, margin: 0, valign: "top", isTextBox: true });
  const pills = ["No pitch", "No hype cycle", "Real clients, real teams"];
  pills.forEach((t, i) => {
    const x = 2.1 + i * 3.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.6, w: 3.2, h: 0.75, rectRadius: 0.375, fill: { color: C.text2 }, line: { color: C.accent1, width: 1.5 }, objectName: t + " pill" });
    s.addText(t, { x, y: 4.6, w: 3.2, h: 0.75, fontSize: 18, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  s.addNotes("Set the tone: a candid conversation about what's actually deployed and paying off, not a sales pitch.");

  // ---------- 4. Agenda ----------
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Welcome" });
  s.addText("AGENDA", { placeholder: "eyebrow" });
  s.addText("What we’ll cover", { placeholder: "title" });
  const topics = [
    ["Where AI is actually deployed inside agencies today", "and where it’s stalled out"],
    ["What’s changing in search, client demand and service delivery", "and what isn’t"],
    ["What the agency of the future looks like", "team structure, headcount, service mix"],
    ["What agency owners get wrong about AI", "and what to focus on instead"],
  ];
  topics.forEach(([h, sub], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.15, y = 2.2 + row * 2.05;
    card(s, x, y, 5.9, 1.8, `Topic ${i + 1} card`);
    numCircle(s, `0${i + 1}`, x + 0.3, y + 0.4, 1.0, 20);
    s.addText(h, { x: x + 1.55, y: y + 0.25, w: 4.1, h: 0.85, fontSize: 18, bold: true, color: C.background1, margin: 0, valign: "bottom", isTextBox: true });
    s.addText(sub, { x: x + 1.55, y: y + 1.15, w: 4.1, h: 0.4, fontSize: 15, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  });
  s.addNotes("Walk through the four topics. Mention Q&A at the end.");

  // ---------- section divider helper ----------
  const divider = (n, title, note) => {
    pres.addSection({ title: `Topic ${n}` });
    const d = pres.addSlide({ masterName: "SECTION", sectionTitle: `Topic ${n}` });
    numCircle(d, `0${n}`, 0.75, 2.6, 2.3, 54);
    d.addText(title, { placeholder: "title", valign: "middle", align: "left" });
    d.addNotes(note);
  };

  // ---------- Topic 1 ----------
  divider(1, "Where AI is actually deployed inside agencies today", "Topic 1: what's live and paying off versus what's stalled.");
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Topic 1" });
  s.addText("TOPIC 01", { placeholder: "eyebrow" });
  s.addText("Deployed vs. stalled out", { placeholder: "title" });
  const twoCol = async (slide, cols) => {
    for (const [i, [Ico, h, q]] of cols.entries()) {
      const x = 0.6 + i * 6.15;
      card(slide, x, 2.2, 5.9, 3.9, h + " card");
      await iconCircle(slide, Ico, x + 0.45, 2.6, 1.1, h);
      slide.addText(h, { x: x + 0.45, y: 3.95, w: 5.0, h: 0.6, fontSize: 24, bold: true, color: C.background1, margin: 0, isTextBox: true });
      slide.addText(q, { x: x + 0.45, y: 4.6, w: 5.0, h: 1.2, fontSize: 16, color: C.background2, margin: 0, valign: "top", isTextBox: true });
    }
  };
  await twoCol(s, [
    [fa.FaCircleCheck, "Deployed and paying off", "Which AI workflows are running inside real agencies today, and where are they earning their keep?"],
    [fa.FaCirclePause, "Stalled out", "Where have AI rollouts stalled, and what’s holding them back?"],
  ]);
  s.addNotes("Discussion: concrete examples of AI in production at agencies, and the projects that stalled.");

  // ---------- three-card helper ----------
  const threeCol = async (slide, cols) => {
    for (const [i, [Ico, h, q]] of cols.entries()) {
      const x = 0.6 + i * 4.1;
      card(slide, x, 2.2, 3.85, 3.9, h + " card");
      await iconCircle(slide, Ico, x + 0.4, 2.6, 1.0, h);
      slide.addText(h, { x: x + 0.4, y: 3.85, w: 3.1, h: 0.55, fontSize: 22, bold: true, color: C.background1, margin: 0, isTextBox: true });
      slide.addText(q, { x: x + 0.4, y: 4.5, w: 3.1, h: 1.3, fontSize: 16, color: C.background2, margin: 0, valign: "top", isTextBox: true });
    }
  };

  // ---------- Topic 2 ----------
  divider(2, "What’s changing in search, client demand and service delivery", "Topic 2: what's shifting, and what's staying the same.");
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Topic 2" });
  s.addText("TOPIC 02", { placeholder: "eyebrow" });
  s.addText("What’s changing, and what isn’t", { placeholder: "title" });
  await threeCol(s, [
    [fa.FaMagnifyingGlass, "Search", "How is AI reshaping how clients’ customers search and find them?"],
    [fa.FaHandshake, "Client demand", "What are clients asking agencies for now that they weren’t a year ago?"],
    [fa.FaGears, "Service delivery", "How is the work itself getting done differently, and what still needs people?"],
  ]);
  s.addNotes("Discussion: changes across search, client demand and delivery. Call out what hasn't changed too.");

  // ---------- Topic 3 ----------
  divider(3, "What the agency of the future looks like", "Topic 3: the shape of the agency in five years.");
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Topic 3" });
  s.addText("TOPIC 03", { placeholder: "eyebrow" });
  s.addText("The agency of the future, from the inside", { placeholder: "title" });
  await threeCol(s, [
    [fa.FaSitemap, "Team structure", "How do roles and reporting lines change when AI is part of the team?"],
    [fa.FaUserGroup, "Headcount", "Does the agency of the future get smaller, or just different?"],
    [fa.FaLayerGroup, "Service mix", "Which services grow, which shrink, and which are new?"],
  ]);
  s.addNotes("Discussion: team structure, headcount and service mix five years out.");

  // ---------- Topic 4 ----------
  divider(4, "What agency owners get wrong about AI", "Topic 4: common mistakes and where to focus instead.");
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Topic 4" });
  s.addText("TOPIC 04", { placeholder: "eyebrow" });
  s.addText("Common mistakes, and where to focus instead", { placeholder: "title" });
  await twoCol(s, [
    [fa.FaTriangleExclamation, "What owners get wrong", "Where are agency owners misreading AI, or spending effort in the wrong place?"],
    [fa.FaBullseye, "What to focus on instead", "What should owners prioritise now to be well placed in five years?"],
  ]);
  s.addNotes("Discussion: mistakes you see agency owners making, and the practical alternative.");

  // ---------- Q&A ----------
  pres.addSection({ title: "Close" });
  s = pres.addSlide({ masterName: "PLAIN", sectionTitle: "Close" });
  await iconCircle(s, fa.FaComments, (W - 1.8) / 2, 1.3, 1.8, "Q&A");
  s.addText("Your questions", { x: 1, y: 3.4, w: W - 2, h: 1.1, fontSize: 48, fontFace: "Cambria", color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addText("Ask in the chat or the Q&A panel", { x: 1, y: 4.6, w: W - 2, h: 0.5, fontSize: 20, color: C.accent1, align: "center", margin: 0, isTextBox: true });
  s.addImage({ path: `${ASSETS}/logo.png`, x: 12.05, y: 6.55, w: 0.7, h: 0.7 });
  s.addNotes("Open the floor. Read questions from the chat.");

  // ---------- Thank you ----------
  s = pres.addSlide({ masterName: "PLAIN", sectionTitle: "Close" });
  s.addImage({ path: `${ASSETS}/logo.png`, x: (W - 2.2) / 2, y: 0.8, w: 2.2, h: 2.2, objectName: "Logo" });
  s.addText("Thank you for joining", { x: 1, y: 3.25, w: W - 2, h: 1.0, fontSize: 44, fontFace: "Cambria", color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addText("hennessey.com", { x: 1, y: 4.3, w: W - 2, h: 0.5, fontSize: 22, bold: true, color: C.accent1, align: "center", margin: 0, isTextBox: true, hyperlink: { url: "https://hennessey.com" } });
  s.addText("Dan Hinckley, Herringbone   ·   Rob Coleman, Hennessey Digital", { x: 1, y: 5.3, w: W - 2, h: 0.4, fontSize: 16, color: C.background2, align: "center", margin: 0, isTextBox: true });
  s.addNotes("Thank attendees and speakers. Mention the recording will be shared.");

  const file = `${OUT}/november_webinar_deck.pptx`;
  await pres.writeFile({ fileName: file });
  await applyTheme(file, THEME);
  console.log("wrote", file);
})();
