import fs from "node:fs/promises";
import path from "node:path";

const root = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(root, "renders");
await fs.mkdir(out, { recursive: true });

const C = {
  ink: "#181A20",
  muted: "#707480",
  line: "#E2E4EA",
  bg: "#F4F5F7",
  white: "#FFFFFF",
  purple: "#7041DA",
  purple2: "#8B5BEF",
  purpleSoft: "#F2EDFF",
  green: "#278A52",
  greenSoft: "#EAF8F0",
  amber: "#AF6814",
  amberSoft: "#FFF5E7",
  red: "#C74444",
  redSoft: "#FFF0F0",
  navy: "#26355E",
};

const e = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const rect = (x, y, w, h, fill = C.white, r = 14, stroke = C.line, sw = 1) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const line = (x1, y1, x2, y2, stroke = C.line, sw = 1) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"/>`;
const circle = (cx, cy, r, fill, stroke = "none", sw = 0) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const text = (x, y, value, size = 12, weight = 500, fill = C.ink, anchor = "start") =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${e(value)}</text>`;
const multiline = (x, y, rows, size = 11, weight = 500, fill = C.muted, gap = 16) =>
  rows.map((row, i) => text(x, y + i * gap, row, size, weight, fill)).join("");
const pill = (x, y, label, tone = "neutral", width) => {
  const tones = {
    neutral: ["#F1F2F5", "#5F6470"],
    purple: [C.purpleSoft, "#6036BC"],
    green: [C.greenSoft, C.green],
    amber: [C.amberSoft, C.amber],
    red: [C.redSoft, C.red],
  };
  const [fill, color] = tones[tone];
  const w = width ?? Math.max(58, label.length * 6.2 + 20);
  return `${rect(x, y, w, 25, fill, 13, "none", 0)}${text(x + w / 2, y + 17, label, 10, 700, color, "middle")}`;
};
const button = (x, y, w, label, primary = false, danger = false) => {
  const fill = primary ? C.purple : C.white;
  const stroke = danger ? "#EEC7C7" : primary ? C.purple : C.line;
  const color = danger ? C.red : primary ? C.white : "#515663";
  return `${rect(x, y, w, 40, fill, 10, stroke)}${text(x + w / 2, y + 25, label, 11, 750, color, "middle")}`;
};
const check = (x, y, done = true) =>
  done
    ? `${circle(x, y, 11, C.green)}${text(x, y + 4, "✓", 10, 800, C.white, "middle")}`
    : circle(x, y, 10, C.white, "#C6C9D1", 2);
const titleBlock = (scene, eyebrow, title, subtitle) =>
  `${text(106, 120, eyebrow, 10, 800, C.purple)}${text(106, 154, title, 27, 760)}${text(106, 178, subtitle, 12, 500, C.muted)}${pill(1194, 108, `Escena ${scene} de 8`, "purple", 130)}`;
const defs = `
  <defs>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${C.purple}"/><stop offset="1" stop-color="#3457E8"/></linearGradient>
    <linearGradient id="report" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#171A23"/><stop offset="0.64" stop-color="#252D44"/><stop offset="1" stop-color="#4C2F91"/></linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="7" stdDeviation="10" flood-color="#181D2B" flood-opacity="0.08"/></filter>
  </defs>`;
const svg = (w, h, body) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>`;

const shell = (scene, body, role = "Administración", nav = 1) => {
  const roles = ["Administración", "Operación móvil", "Supervisión"];
  let s = rect(0, 0, 1368, 900, C.bg, 0, "none", 0);
  s += rect(0, 0, 1368, 72, C.white, 0, "none", 0) + line(0, 72, 1368, 72);
  s +=
    rect(18, 18, 36, 36, "url(#brand)", 11, "none", 0) +
    text(36, 43, "Z", 18, 850, C.white, "middle");
  s +=
    text(66, 34, "Zellship Maintenance OS", 15, 750) +
    text(66, 51, "Field Service · ATM Operations", 9, 500, "#8A8E98");
  s += rect(365, 17, 366, 38, "#EFF0F3", 12, "none", 0);
  roles.forEach((r, i) => {
    const x = 369 + i * 120;
    if (r === role) s += rect(x, 21, 116, 30, C.white, 9, "none", 0);
    s += text(x + 58, 40, r, 10, 700, r === role ? C.ink : C.muted, "middle");
  });
  s +=
    pill(1110, 23, "Red ATM Demo", "neutral", 118) +
    rect(1240, 21, 34, 34, C.white, 9) +
    text(1257, 43, "↻", 15, 600, C.muted, "middle") +
    rect(1283, 21, 34, 34, C.white, 9) +
    text(1300, 43, "●", 11, 600, C.muted, "middle");
  s += rect(0, 72, 76, 828, C.white, 0, "none", 0) + line(76, 72, 76, 900);
  ["▦", "▤", "⌁", "✓", "⚙"].forEach((icon, i) => {
    const y = 92 + i * 62;
    if (i === nav) s += rect(12, y, 52, 48, C.purpleSoft, 12, "none", 0);
    s += text(38, y + 30, icon, 17, 700, i === nav ? C.purple : "#979AA4", "middle");
  });
  s += body;
  s += text(
    1344,
    884,
    `Referencia estática · Escena ${scene} · Datos simulados`,
    8,
    700,
    "#8B8F99",
    "end",
  );
  return svg(1368, 900, s);
};

const scene1 = () => {
  let b = titleBlock(
    1,
    "ÓRDENES · RECEPCIÓN",
    "Servicios recibidos",
    "Correctivos por aceptar y preventivos programados en una sola cola operativa.",
  );
  const stats = [
    ["◴", "2", "Correctivos por aceptar"],
    ["!", "4 h", "Próximo vencimiento"],
    ["×", "1", "Servicio perdido"],
  ];
  stats.forEach((st, i) => {
    const x = 106 + i * 405;
    b +=
      rect(x, 206, 385, 88, C.white, 15, C.line) +
      circle(x + 42, 250, 20, C.purpleSoft) +
      text(x + 42, 256, st[0], 16, 800, C.purple, "middle") +
      text(x + 76, 246, st[1], 21, 800) +
      text(x + 76, 265, st[2], 10, 500, C.muted);
  });
  b +=
    rect(106, 313, 758, 445, C.white, 16, C.line) + rect(106, 313, 5, 445, "#DF8A25", 3, "none", 0);
  b += pill(132, 338, "Por aceptar", "amber") + pill(222, 338, "Correctivo", "neutral");
  b +=
    rect(687, 332, 151, 62, C.amberSoft, 12, "#F0D3AE") +
    text(762, 358, "04:00:00", 20, 800, C.amber, "middle") +
    text(762, 376, "para aceptar", 9, 600, C.amber, "middle");
  b +=
    text(132, 426, "Mantenimiento de acabado exterior", 23, 780) +
    text(132, 454, "y puerta de acceso", 23, 780) +
    text(132, 480, "Banco Delta · Comercio Norte 014", 12, 500, C.muted);
  [
    ["ORDEN", "SO-ATM-2401"],
    ["INSTALACIÓN", "REMOTO"],
    ["CONTEXTO", "Comercio"],
  ].forEach((m, i) => {
    const x = 132 + i * 220;
    b +=
      rect(x, 516, 205, 76, "#FAFBFC", 11, "#ECEEF2") +
      text(x + 13, 539, m[0], 9, 700, "#8A8E99") +
      text(x + 13, 566, m[1], 13, 750);
  });
  b +=
    line(132, 622, 838, 622) +
    text(132, 649, "Tiempo y notificación simulados para esta demostración", 9, 500, "#9599A2") +
    button(568, 674, 105, "Declinar", false, true) +
    button(684, 674, 154, "Revisar y aceptar", true);
  b +=
    rect(882, 313, 378, 445, C.white, 16, C.line) +
    text(906, 345, "Cola operativa", 14, 750) +
    text(906, 365, "Otros servicios en seguimiento", 10, 500, C.muted) +
    pill(1163, 330, "6 registros", "purple", 76);
  const rows = [
    ["▣", "Preventivo mensual · SITE", "20 ago · 09:00", "Listo", "green"],
    ["!", "Correctivo · REMOTO", "Venció hace 2 h", "Perdido", "red"],
    ["✓", "Preventivo · REMOTO", "Reporte disponible", "Cerrado", "neutral"],
  ];
  rows.forEach((r, i) => {
    const y = 397 + i * 105;
    b +=
      rect(906, y, 330, 86, "#FBFBFC", 12, "#ECEEF2") +
      circle(935, y + 43, 18, C.purpleSoft) +
      text(935, y + 49, r[0], 13, 800, C.purple, "middle") +
      text(966, y + 35, r[1], 11, 750) +
      text(966, y + 55, r[2], 9, 500, C.muted) +
      pill(1156, y + 30, r[3], r[4], 67);
  });
  return shell(1, b, "Administración", 1);
};

const scene2 = () => {
  let b = text(106, 110, "←  Volver a servicios recibidos", 11, 650, C.muted);
  b +=
    rect(106, 132, 1154, 125, C.white, 16, C.line) +
    pill(132, 153, "Por aceptar", "amber") +
    pill(222, 153, "SO-ATM-2401", "purple") +
    text(132, 204, "Aceptar servicio y resolver protocolo", 25, 780) +
    text(132, 230, "La clasificación define acceso, evidencia y ejecución.", 11, 500, C.muted);
  b +=
    rect(1070, 153, 162, 70, C.amberSoft, 12, "#F0D3AE") +
    text(1151, 181, "04:00:00", 20, 800, C.amber, "middle") +
    text(1151, 202, "ventana de aceptación", 8, 650, C.amber, "middle");
  b +=
    rect(106, 275, 555, 408, C.white, 16, C.line) +
    text(130, 307, "Clasificación operativa", 14, 750) +
    text(130, 327, "Tres dimensiones independientes", 10, 500, C.muted);
  const dims = [
    ["↯", "Correctivo", "Requiere aceptación en 24 h"],
    ["ATM", "REMOTO", "Clasificación de instalación"],
    ["⌂", "Comercio", "Protocolo de acceso"],
  ];
  dims.forEach((d, i) => {
    const x = 130 + i * 169;
    b +=
      rect(x, 350, 155, 128, "#FAF7FF", 13, "#B9A7EC") +
      rect(x + 13, 365, 32, 32, C.purpleSoft, 9, "none", 0) +
      text(x + 29, 386, d[0], d[0] === "ATM" ? 9 : 15, 800, C.purple, "middle") +
      text(x + 13, 423, d[1], 12, 750) +
      text(x + 13, 445, d[2], 8, 500, C.muted);
  });
  b +=
    line(130, 504, 637, 504) +
    text(130, 530, "SÍNTOMA REPORTADO", 9, 700, "#8A8E99") +
    rect(130, 544, 507, 92, C.white, 10, "#DEDFE5") +
    multiline(
      144,
      570,
      ["Deterioro de acabado exterior y ajuste requerido", "en puerta de acceso."],
      10,
      500,
      "#3E424D",
      17,
    );
  b +=
    rect(677, 275, 583, 408, C.white, 16, C.line) +
    text(701, 307, "Protocolo resultante", 14, 750) +
    text(701, 327, "Correctivo · REMOTO · Comercio", 10, 500, C.muted) +
    pill(1166, 291, "Activo", "green", 66);
  [
    ["Cita previa requerida", "Fecha y ventana por confirmar"],
    ["Identificación del técnico", "Antes de programar"],
    ["Evidencia antes, durante y final", "Ligada al sitio y concepto"],
  ].forEach((r, i) => {
    const y = 357 + i * 78;
    b +=
      rect(701, y, 535, 62, "#FBFBFC", 11, "#ECEEF2") +
      check(723, y + 31) +
      text(747, y + 27, r[0], 11, 750) +
      text(747, y + 45, r[1], 9, 500, C.muted);
  });
  b +=
    rect(106, 702, 1154, 90, "#FAF7FF", 14, "#DDD4FB") +
    text(130, 736, "Al aceptar, el servicio pasa a programación", 13, 750) +
    text(
      130,
      758,
      "Las 24 horas corresponden únicamente a la aceptación, no a la resolución.",
      10,
      500,
      C.muted,
    ) +
    button(1081, 726, 154, "Aceptar servicio", true);
  return shell(2, b, "Administración", 1);
};

const scene3 = () => {
  let b = titleBlock(
    3,
    "PLANEACIÓN · ACCESO",
    "Programación y preparación operativa",
    "Fecha, técnico elegible y condiciones de acceso antes de liberar la ejecución.",
  );
  b +=
    rect(106, 208, 274, 553, C.white, 16, C.line) +
    pill(130, 230, "Aceptado a tiempo", "green", 118) +
    text(130, 278, "SO-ATM-2401", 18, 800) +
    text(130, 301, "Banco Delta · Comercio Norte 014", 9, 500, C.muted) +
    line(130, 325, 356, 325) +
    text(130, 351, "PROTOCOLO", 9, 700, "#8A8E99") +
    text(130, 374, "Correctivo · REMOTO", 12, 750) +
    text(130, 392, "Comercio", 11, 600, C.muted) +
    text(130, 432, "VENTANA SUGERIDA", 9, 700, "#8A8E99") +
    text(130, 455, "18 ago · 14:00–16:00", 12, 750) +
    line(130, 482, 356, 482) +
    text(130, 509, "PREVENTIVO MENSUAL", 9, 700, C.muted) +
    rect(130, 523, 226, 91, "#FBFBFC", 11, "#ECEEF2") +
    circle(153, 553, 15, C.purpleSoft) +
    text(153, 558, "▣", 11, 800, C.purple, "middle") +
    text(176, 551, "SITE · Preventivo", 10, 750) +
    text(176, 570, "20 ago · Sin contador", 8, 500, C.muted);
  b +=
    rect(396, 208, 449, 553, C.white, 16, C.line) +
    text(420, 241, "Fecha y responsable", 14, 750) +
    text(420, 262, "Solo aparecen técnicos elegibles", 10, 500, C.muted) +
    pill(719, 225, "Agosto 2026", "purple", 100);
  [18, 19, 20, 21, 22].forEach((d, i) => {
    const x = 420 + i * 78;
    const active = i === 0;
    b +=
      rect(x, 292, 68, 72, active ? C.purple : "#FAFBFC", 10, active ? C.purple : "#ECEEF2") +
      text(x + 34, 314, "DÍA", 8, 700, active ? C.white : C.muted, "middle") +
      text(x + 34, 345, d, 15, 800, active ? C.white : C.ink, "middle");
  });
  b +=
    rect(420, 391, 401, 84, "#FAF8FF", 12, "#B8A8EC") +
    rect(437, 408, 42, 42, "url(#brand)", 11, "none", 0) +
    text(458, 434, "LC", 11, 800, C.white, "middle") +
    text(494, 420, "Luis Campos", 11, 750) +
    text(494, 440, "Disponible · Perfil compatible", 9, 500, C.muted) +
    pill(733, 415, "Elegible", "green", 70) +
    rect(420, 493, 401, 52, C.white, 10, "#DEDFE5") +
    text(438, 525, "14:00–16:00 · Duración estimada 2 h", 10, 600, "#3E424D");
  b +=
    rect(861, 208, 399, 553, C.white, 16, C.line) +
    text(885, 241, "Preparación de acceso", 14, 750) +
    text(885, 262, "3 de 4 condiciones completas", 10, 500, C.muted) +
    pill(1160, 225, "Pendiente", "amber", 76) +
    rect(885, 283, 351, 7, "#ECEEF2", 4, "none", 0) +
    rect(885, 283, 263, 7, C.purple, 4, "none", 0);
  [
    ["Cita confirmada", "18 ago · 14:00", true],
    ["Identificación del técnico", "Pendiente de adjuntar", false],
    ["Acompañamiento", "No requerido", true],
    ["Referencia del sitio", "Validada", true],
  ].forEach((r, i) => {
    const y = 313 + i * 69;
    b +=
      rect(885, y, 351, 58, "#FBFBFC", 10, "#ECEEF2") +
      check(907, y + 29, r[2]) +
      text(932, y + 25, r[0], 10, 750) +
      text(932, y + 43, r[1], 8, 500, C.muted);
  });
  b +=
    button(885, 618, 351, "Confirmar programación", false) +
    text(1060, 680, "Se habilita al completar la identificación", 8, 500, C.muted, "middle");
  return shell(3, b, "Administración", 0);
};

const mobileShell = (scene, body, primaryLabel, secondaryLabel) => {
  let s =
    rect(0, 0, 390, 844, C.bg, 0, "none", 0) +
    rect(0, 0, 390, 26, C.white, 0, "none", 0) +
    text(14, 18, "09:30", 9, 700, "#565A67") +
    text(376, 18, "▮▮▮ 5G ◉", 8, 700, "#565A67", "end");
  s +=
    rect(0, 26, 390, 62, C.white, 0, "none", 0) +
    line(0, 88, 390, 88) +
    rect(14, 41, 32, 32, "url(#brand)", 10, "none", 0) +
    text(30, 62, "Z", 15, 850, C.white, "middle") +
    text(57, 54, "Operación móvil", 12, 750) +
    text(57, 70, "Luis Campos · Técnico asignado", 8, 500, C.muted) +
    text(370, 60, "•••", 12, 700, C.muted, "end");
  s += body;
  s += rect(0, 774, 390, 70, C.white, 0, "none", 0) + line(0, 774, 390, 774);
  if (secondaryLabel) s += button(14, 788, 114, secondaryLabel, false);
  s += button(secondaryLabel ? 136 : 14, 788, secondaryLabel ? 240 : 362, primaryLabel, true);
  s += text(378, 766, `Escena ${scene} · Referencia estática`, 7, 700, "#9599A2", "end");
  return svg(390, 844, s);
};

const scene4 = () => {
  let b =
    text(15, 116, "ESCENA 4 · LLEGADA", 9, 800, C.purple) +
    text(15, 146, "Confirmar ubicación e iniciar", 20, 780) +
    text(15, 168, "SO-ATM-2401 · Comercio Norte 014", 10, 500, C.muted);
  b +=
    rect(15, 188, 360, 119, C.white, 14, C.line) +
    text(30, 216, "Correctivo asignado", 12, 750) +
    text(30, 236, "Hoy · 14:00–16:00", 9, 500, C.muted) +
    pill(277, 204, "Acceso listo", "green", 82) +
    pill(30, 257, "REMOTO", "neutral") +
    pill(102, 257, "Comercio", "neutral") +
    pill(178, 257, "Correctivo", "purple");
  b +=
    rect(15, 320, 360, 423, C.white, 14, C.line) +
    text(30, 349, "Ubicación del servicio", 12, 750) +
    text(30, 368, "Validación previa al inicio", 9, 500, C.muted) +
    pill(264, 337, "GPS simulado", "purple", 95);
  b +=
    rect(30, 390, 330, 189, "#E8EEE8", 12, "none", 0) +
    line(30, 463, 360, 419, C.white, 7) +
    line(87, 390, 320, 579, C.white, 7) +
    line(30, 535, 360, 501, C.white, 5) +
    circle(196, 478, 22, C.white) +
    circle(196, 478, 16, C.purple) +
    text(196, 483, "●", 9, 800, C.white, "middle");
  b +=
    rect(30, 594, 330, 102, C.greenSoft, 11, "none", 0) +
    check(52, 624) +
    text(76, 621, "Ubicación coincide", 11, 750, "#356447") +
    multiline(
      76,
      641,
      ["Orden, sitio, técnico y hora quedarán", "ligados al check-in."],
      8,
      500,
      "#4D735A",
      14,
    );
  return mobileShell(4, b, "Confirmar llegada e iniciar", "Sin acceso");
};

const scene5 = () => {
  let b =
    text(15, 116, "ESCENA 5 · EVIDENCIA PREVIA", 9, 800, C.purple) +
    text(15, 146, "ATM identificable", 20, 780) +
    text(15, 168, "Captura 2 de 4 · Antes de intervenir", 10, 500, C.muted);
  [0, 1, 2, 3].forEach(
    (i) => (b += rect(15 + i * 91, 184, 83, 5, i < 2 ? C.purple : "#E3E5EA", 3, "none", 0)),
  );
  b +=
    rect(15, 205, 360, 322, "#C9CDD3", 14, "none", 0) +
    rect(111, 259, 168, 223, "#8E959E", 8, "#4D535D", 5) +
    rect(139, 289, 112, 70, "#25355C", 5, "none", 0) +
    text(195, 328, "ATM 014", 12, 800, C.white, "middle") +
    rect(25, 459, 340, 54, "#1B1E25", 8, "none", 0) +
    text(37, 480, "SO-ATM-2401 · Comercio Norte 014", 8, 700, C.white) +
    text(37, 498, "18 ago 2026 · 14:08 · Ubicación simulada", 8, 500, "#D7DAE0");
  b +=
    rect(15, 540, 360, 204, C.white, 14, C.line) +
    text(30, 570, "Identificador visible", 12, 750) +
    text(30, 589, "Debe corresponder al ATM asignado", 9, 500, C.muted) +
    pill(271, 557, "Sitio coincide", "green", 89) +
    line(30, 608, 360, 608);
  b +=
    check(43, 633) +
    text(68, 630, "Fachada / ubicación", 10, 750) +
    text(68, 647, "Completa", 8, 500, C.muted) +
    pill(319, 620, "1", "green", 30) +
    line(30, 661, 360, 661) +
    check(43, 686, false) +
    text(68, 683, "ID del ATM", 10, 750) +
    text(68, 700, "Captura actual", 8, 500, C.muted) +
    pill(309, 673, "2/4", "amber", 50);
  return mobileShell(5, b, "Capturar evidencia");
};

const scene6 = () => {
  let b =
    text(15, 116, "ESCENA 6 · EJECUCIÓN", 9, 800, C.purple) +
    text(15, 146, "Trabajo ejecutado", 20, 780) +
    text(15, 168, "Lo capturado alimentará el reporte.", 10, 500, C.muted) +
    pill(275, 124, "SO-ATM-2401", "purple", 100);
  b +=
    rect(15, 188, 360, 69, "#252A38", 11, "none", 0) +
    text(30, 211, "TIEMPO EFECTIVO", 8, 700, "#AAB0BF") +
    text(30, 241, "01:42:18", 21, 800, C.white) +
    text(350, 231, "Ⅱ", 15, 800, C.white, "end");
  b +=
    rect(15, 269, 360, 42, "#ECEEF2", 10, "none", 0) +
    text(72, 295, "Diagnóstico", 8, 700, C.muted, "middle") +
    rect(133, 273, 116, 34, C.white, 8, "none", 0) +
    text(191, 295, "Conceptos", 8, 750, C.ink, "middle") +
    text(312, 295, "Evidencia final", 8, 700, C.muted, "middle");
  b +=
    rect(15, 324, 360, 298, C.white, 14, C.line) + text(30, 352, "Conceptos ejecutados", 12, 750);
  [
    ["CF-014", "Pintura exterior", "12.0 M²"],
    ["PA-006", "Ajuste de puerta", "1 SERV"],
  ].forEach((r, i) => {
    const y = 370 + i * 64;
    b +=
      rect(30, y, 61, 40, "#F1F2F5", 8, "none", 0) +
      text(60, y + 25, r[0], 8, 750, C.muted, "middle") +
      text(104, y + 17, r[1], 10, 750) +
      text(104, y + 34, i ? "Unidad SERV" : "Unidad M²", 8, 500, C.muted) +
      rect(294, y, 66, 40, "#F1F2F5", 8, "none", 0) +
      text(327, y + 25, r[2], 8, 750, C.ink, "middle");
  });
  b +=
    line(30, 505, 360, 505) +
    text(30, 529, "MATERIALES Y CONSUMIBLES", 8, 700, "#8A8E99") +
    rect(30, 541, 330, 54, C.white, 9, "#DEDFE5") +
    multiline(
      43,
      562,
      ["Pintura exterior · 4 L", "Consumibles de limpieza"],
      8,
      600,
      "#3E424D",
      15,
    );
  b +=
    rect(15, 636, 360, 102, C.amberSoft, 11, "#F0D3AE") +
    text(34, 668, "!", 15, 800, C.amber) +
    text(58, 665, "2 observaciones antes de enviar", 10, 750, C.amber) +
    multiline(
      58,
      684,
      ["Una foto corresponde a otro sitio y falta", "la panorámica final."],
      8,
      500,
      "#8A5A16",
      14,
    );
  return mobileShell(6, b, "Enviar con observaciones", "Revisar");
};

const scene7 = () => {
  let b = titleBlock(
    7,
    "SUPERVISIÓN · CONTROL DE CALIDAD",
    "Validación y corrección",
    "La evidencia incompleta o asociada a otro sitio no puede cerrar el servicio.",
  );
  b +=
    rect(106, 208, 338, 553, C.white, 16, C.line) +
    text(130, 240, "Historial de revisiones", 14, 750) +
    text(130, 261, "El original nunca se sobrescribe", 10, 500, C.muted) +
    pill(339, 224, "Por decidir", "amber", 78);
  b +=
    rect(130, 291, 290, 87, "#FAF8FF", 12, "#C1AFF2") +
    text(148, 320, "Revisión R1", 11, 750) +
    text(148, 342, "Luis Campos · 16:05", 9, 500, C.muted) +
    pill(324, 307, "2 hallazgos", "red", 82) +
    rect(130, 390, 290, 87, C.white, 12, "#ECEEF2") +
    text(148, 419, "Revisión R2", 11, 750) +
    text(148, 441, "Se crea después de reabrir", 9, 500, C.muted) +
    pill(337, 406, "Pendiente", "neutral", 70) +
    line(130, 504, 420, 504) +
    text(130, 531, "AUTORIDAD DISPONIBLE", 9, 700, "#8A8E99") +
    rect(130, 544, 290, 88, "#FBFBFC", 11, "#ECEEF2") +
    rect(147, 562, 40, 40, C.green, 11, "none", 0) +
    text(167, 587, "SV", 11, 800, C.white, "middle") +
    text(201, 574, "Sofía Vega", 11, 750) +
    text(201, 594, "Aprueba, rechaza o reabre", 8, 500, C.muted);
  b +=
    rect(460, 208, 800, 553, C.white, 16, C.line) +
    text(484, 240, "Expediente de validación · R1", 14, 750) +
    text(484, 261, "SO-ATM-2401 · Comercio Norte 014", 10, 500, C.muted) +
    pill(1100, 224, "Pendiente de validación", "amber", 134);
  const findings = [
    [
      "!",
      "Evidencia asociada a otro sitio",
      "La captura final no coincide con Comercio Norte 014.",
    ],
    ["◫", "Panorámica final faltante", "El protocolo requiere una vista general final."],
  ];
  findings.forEach((f, i) => {
    const y = 290 + i * 82;
    b +=
      rect(484, y, 752, 67, "#FFF7F7", 11, "#F0CACA") +
      rect(500, y + 17, 32, 32, C.redSoft, 9, "none", 0) +
      text(516, y + 39, f[0], 14, 800, C.red, "middle") +
      text(548, y + 28, f[1], 10, 750) +
      text(548, y + 48, f[2], 8, 500, "#7F5D5D") +
      pill(1158, y + 21, "Bloquea", "red", 65);
  });
  ["Antes · Válida", "Durante · Válida", "Final · Otro sitio", "Final · Faltante"].forEach(
    (label, i) => {
      const x = 484 + i * 185;
      const invalid = i > 1;
      b +=
        rect(
          x,
          470,
          169,
          108,
          invalid ? "#E6E6E8" : "#B7BDC5",
          10,
          invalid ? C.red : "none",
          invalid ? 2 : 0,
        ) +
        rect(x + 8, 544, 153, 24, invalid ? C.red : "#333842", 6, "none", 0) +
        text(x + 84, 560, label, 8, 700, C.white, "middle");
    },
  );
  b +=
    rect(130, 646, 290, 82, "#FBFBFC", 11, "#ECEEF2") +
    rect(147, 663, 40, 40, C.purple, 11, "none", 0) +
    text(167, 688, "MO", 10, 800, C.white, "middle") +
    text(201, 679, "Marina Ortega · Coordinación", 10, 750) +
    text(201, 699, "Aprueba o reabre; no rechaza", 8, 500, C.muted);
  b +=
    text(484, 612, "Integridad y ubicación simuladas", 9, 500, "#9599A2") +
    line(484, 638, 1236, 638) +
    button(965, 663, 112, "Rechazar", false, true) +
    button(1088, 663, 148, "Reabrir para corregir", true);
  return shell(7, b, "Supervisión", 3);
};

const scene8 = () => {
  let b = titleBlock(
    8,
    "CIERRE · REPORTE OPERATIVO",
    "Servicio aprobado y consolidado",
    "La revisión corregida genera un expediente sin volver a capturar la información.",
  );
  b +=
    rect(106, 208, 290, 553, C.white, 16, C.line) +
    pill(130, 230, "Servicio cerrado", "green", 105) +
    text(130, 277, "SO-ATM-2401", 18, 800) +
    multiline(130, 300, ["Revisión R2 aprobada", "por Marina Ortega"], 9, 500, C.muted, 16) +
    line(130, 345, 372, 345);
  [
    "Resumen del servicio",
    "Ejecución",
    "Conceptos y cantidades",
    "Evidencias",
    "Trazabilidad R1 → R2",
  ].forEach(
    (r, i) =>
      (b += text(
        146,
        382 + i * 37,
        `${i === 0 ? "●" : "○"}   ${r}`,
        9,
        i === 0 ? 750 : 600,
        i === 0 ? C.purple : C.muted,
      )),
  );
  b +=
    line(130, 585, 372, 585) +
    button(130, 607, 242, "Imprimir / PDF", false) +
    button(130, 659, 242, "Enviar reporte", true) +
    multiline(130, 723, ["Correo y WhatsApp", "simulados."], 8, 500, C.muted, 14);
  b +=
    rect(412, 208, 848, 553, C.white, 16, C.line) +
    text(438, 247, "Zellship · Reporte operativo", 18, 850, C.navy) +
    text(438, 268, "Mantenimiento de ATM · Documento de demostración", 9, 500, C.muted) +
    pill(1129, 230, "APROBADO", "green", 91) +
    text(1219, 278, "SO-ATM-2401 · R2", 10, 750, C.ink, "end") +
    line(438, 288, 1234, 288, C.navy, 3);
  [
    ["SERVICIO", "Correctivo"],
    ["INSTALACIÓN", "REMOTO"],
    ["CONTEXTO", "Comercio"],
    ["TIEMPO", "1 h 48 min"],
  ].forEach((m, i) => {
    const x = 438 + i * 199;
    b +=
      rect(x, 305, 183, 64, "#FAFBFC", 9, "#E3E5EA") +
      text(x + 11, 325, m[0], 8, 700, "#8A8E99") +
      text(x + 11, 351, m[1], 11, 750);
  });
  b +=
    rect(438, 389, 796, 27, C.navy, 0, "none", 0) +
    text(449, 407, "DIAGNÓSTICO, ACCIONES Y CONCLUSIONES", 8, 800, C.white) +
    rect(438, 416, 796, 58, C.white, 0, "#DFE2E8") +
    multiline(
      450,
      438,
      [
        "Se atendió acabado exterior y ajuste de puerta. Se verificó operación, limpieza",
        "y condición final del sitio.",
      ],
      8,
      500,
      "#4E5360",
      15,
    );
  b +=
    rect(438, 488, 796, 27, C.navy, 0, "none", 0) +
    text(449, 506, "CONCEPTOS EJECUTADOS · SIN PRECIOS", 8, 800, C.white);
  const cols = [438, 532, 989, 1094, 1234];
  ["Código", "Concepto", "Unidad", "Cantidad"].forEach(
    (h, i) => (b += text(cols[i] + 8, 537, h, 8, 700, C.muted)),
  );
  b += line(438, 546, 1234, 546);
  [
    ["CF-014", "Pintura exterior", "M²", "12.0"],
    ["PA-006", "Ajuste de puerta de acceso", "SERV", "1"],
  ].forEach((r, ri) =>
    r.forEach((v, i) => (b += text(cols[i] + 8, 566 + ri * 24, v, 8, 600, C.ink))),
  );
  b +=
    rect(438, 614, 796, 27, C.navy, 0, "none", 0) +
    text(449, 632, "EVIDENCIA ANTES · DURANTE · FINAL", 8, 800, C.white);
  ["Fachada · Antes", "Trabajo · Durante", "Acabado · Final", "Panorámica · Final"].forEach(
    (label, i) => {
      const x = 438 + i * 199;
      b +=
        rect(x, 650, 183, 76, i < 2 ? "#B8BEC6" : "#AAB1BA", 8, "none", 0) +
        rect(x + 7, 700, 169, 19, "#333842", 5, "none", 0) +
        text(x + 91, 714, label, 7, 700, C.white, "middle");
    },
  );
  return shell(8, b, "Administración", 3);
};

const overview = () => {
  let b =
    rect(0, 0, 1368, 900, C.bg, 0, "none", 0) +
    rect(30, 30, 1308, 150, "url(#report)", 18, "none", 0) +
    text(58, 70, "MNT-DEMO-ATM-002 · GATE VISUAL", 10, 800, "#BDA9FF") +
    text(58, 112, "Storyboard de ocho escenas", 30, 800, C.white) +
    text(
      58,
      142,
      "De la recepción correctiva al reporte operativo aprobado · Improvement / Executive fuera de alcance",
      11,
      500,
      "#CDD1DB",
    ) +
    pill(1168, 62, "Referencia estática · v1", "neutral", 136);
  const cards = [
    ["Recepción urgente", "Por aceptar", "Seleccionado", "Contador 24 h"],
    ["Aceptar y clasificar", "Por aceptar", "Aceptado", "Tres dimensiones"],
    ["Programar y preparar", "Aceptado", "Acceso listo", "Preventivo visible"],
    ["Llegar e iniciar", "Acceso listo", "En ejecución", "GPS simulado"],
    ["Evidencia previa", "En ejecución", "Pre-evidencia", "Manifiesto guiado"],
    ["Ejecutar y enviar", "En ejecución", "R1 por validar", "Conceptos sin precios"],
    ["Reabrir y corregir", "R1 observada", "R2 por validar", "Historial inmutable"],
    ["Aprobar y reportar", "R2 por validar", "Cerrado", "Reporte consolidado"],
  ];
  cards.forEach((c, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 30 + col * 330;
    const y = 199 + row * 328;
    b +=
      rect(x, y, 318, 306, C.white, 16, C.line) +
      rect(x + 18, y + 18, 36, 36, "url(#brand)", 11, "none", 0) +
      text(x + 36, y + 42, i + 1, 12, 800, C.white, "middle") +
      text(x + 18, y + 86, c[0], 14, 750) +
      multiline(
        x + 18,
        y + 113,
        [
          i < 3 ? "Coordinación y preparación" : i < 6 ? "Ejecución móvil" : "Gobierno y cierre",
          "Una decisión operativa visible",
        ],
        9,
        500,
        C.muted,
        16,
      ) +
      pill(x + 18, y + 164, c[1], "neutral") +
      text(x + 145, y + 181, "→", 12, 700, C.muted) +
      pill(x + 168, y + 164, c[2], i === 7 ? "green" : "purple") +
      line(x + 18, y + 215, x + 300, y + 215) +
      text(x + 18, y + 244, "PRUEBA VISIBLE", 8, 700, "#8A8E99") +
      text(x + 18, y + 270, c[3], 11, 750);
  });
  b += text(
    1338,
    884,
    "Datos, personas, ubicaciones y validaciones simulados",
    8,
    700,
    "#8B8F99",
    "end",
  );
  return svg(1368, 900, b);
};

const scenes = {
  overview,
  "01": scene1,
  "02": scene2,
  "03": scene3,
  "04": scene4,
  "05": scene5,
  "06": scene6,
  "07": scene7,
  "08": scene8,
};
for (const [name, render] of Object.entries(scenes)) {
  await fs.writeFile(
    path.join(out, `${name === "overview" ? "overview" : `scene-${name}`}.svg`),
    render(),
    "utf8",
  );
}
