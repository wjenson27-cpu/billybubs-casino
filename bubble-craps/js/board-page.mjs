/**
 * Which pager page holds a lingo board link.
 * Bubble and Table: 0 side bets, 1 board, 2 dome / shooter.
 */

const SIDE = {
  hop: 0,
  repeater: 0,
  fire: 0,
};

/** iPad columns. Phone test sizes (844×390, 932×430) stay on the phone layout. */
export function ipadLayout(w, h) {
  const width = Number(w) || 0;
  const height = Number(h) || 0;
  return width >= 1024 || (width >= 768 && height >= 900);
}

/** SHOOT throws when the felt and the key share the screen. Side bets never throw.
 *  Your Dice settles on the shooter page, where the pad is mounted. */
export function shootAct(opts) {
  const o = opts || {};
  if (o.screen !== "play" || o.menu) return "go-shooter";
  if (o.page === 2 || (o.ipad && o.page !== 0)) return "throw";
  return "go-shooter";
}

export function pageForLink(link, app) {
  if (!link || link === "ui:rail") return null;
  const kind = String(link).split(":")[0];
  if (Object.prototype.hasOwnProperty.call(SIDE, kind)) return 0;
  if (app === "table" && (kind === "pass" || kind === "dontPass" || kind === "field" || kind === "come" || kind === "dontCome" || kind === "place" || kind === "buy" || kind === "lay")) return 1;
  if (kind === "dice" || kind === "shooter") return 2;
  return 1;
}

export function spotSelector(link, app) {
  if (!link) return null;
  if (link === "ui:rail") return app === "table" ? ".tc-rail" : ".dock";
  if (link === "ui:puck") return app === "table" ? "[data-puck]" : ".hud-puck";
  if (link === "ui:pressKey") return "[data-act='press']";
  if (link === "ui:betsOff") return "[data-act='betsoff']";
  if (link === "ui:layTab") return "[data-kind='dontPassOdds']";
  if (link === "fire") return ".tc-firetile";
  if (app === "table" && (link === "horn" || link === "ce" || link === "anyCraps")) return ".tc-felt .horn";
  const cut = link.indexOf(":");
  if (cut < 0) return "[data-kind='" + link + "']";
  const kind = link.slice(0, cut);
  const rest = link.slice(cut + 1);
  if (app === "table") {
    if (kind === "place" || kind === "buy" || kind === "lay" || kind === "comeOdds") return "[data-act='num'][data-n='" + rest + "']";
    if (kind === "hop") return "[data-kind='hop:" + rest + "']";
    if (kind === "hardway") return "[data-kind='hardway:" + rest + "']";
    return "[data-kind='" + link + "']";
  }
  if (kind === "hop") return "[data-kind='hop'][data-pair='" + rest + "']";
  if (kind === "comeOdds") return "[data-kind='place'][data-number='" + rest + "']";
  if (kind === "place" || kind === "buy" || kind === "lay" || kind === "hardway" || kind === "repeater") {
    return "[data-kind='" + kind + "'][data-number='" + rest + "']";
  }
  return "[data-kind='" + kind + "']";
}
