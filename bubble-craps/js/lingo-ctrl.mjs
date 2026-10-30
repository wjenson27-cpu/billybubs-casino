/**
 * Shared Craps Lingo session: search screen, long-press sheet, roll-call peek.
 * The release of a long-press never places a chip. Callers swallow that click.
 */
import * as E from "./engine.mjs";
import * as Lg from "bb-lingo";
import * as V from "./lingo-view.mjs";
import { spotSelector } from "./board-page.mjs";
export { spotSelector };

export function freshLingo() {
  return {
    query: "",
    category: "all",
    recent: [],
    peekId: null,
    sheet: null,
    confirm: false,
    cardId: null,
    why: false,
    seen: {},
    timer: 0,
    focusId: "",
  };
}

export function stakeOf(game, spot) {
  if (!game || !spot) return 0;
  const b = game.bets || {};
  const k = spot.kind;
  if (k === "place") return (b.place && b.place[spot.number]) || 0;
  if (k === "buy") return (b.buy && b.buy[spot.number]) || 0;
  if (k === "lay") return (b.lay && b.lay[spot.number]) || 0;
  if (k === "hardway") return (b.hardways && b.hardways[spot.number]) || 0;
  if (k === "repeater") return (b.repeaters && b.repeaters[spot.number]) || 0;
  if (k === "hop") return (b.hops && b.hops[spot.pair]) || 0;
  if (k === "comePoint") return (b.comeBets && b.comeBets[spot.number] && b.comeBets[spot.number].amount) || 0;
  if (k === "comeOdds") return (b.comeBets && b.comeBets[spot.number] && b.comeBets[spot.number].odds) || 0;
  if (k === "dontComePoint") return (b.dontComeBets && b.dontComeBets[spot.number] && b.dontComeBets[spot.number].amount) || 0;
  if (k === "dontComeOdds") return (b.dontComeBets && b.dontComeBets[spot.number] && b.dontComeBets[spot.number].odds) || 0;
  if (typeof b[k] === "number") return b[k];
  return 0;
}

export function takeModel(game, spot, opts) {
  const o = opts || {};
  const money = o.money || ((n) => "$" + (n / 100));
  const amount = stakeOf(game, spot);
  if (o.rolling) {
    return { amount: amount ? money(amount) : "", disabled: true, reason: "Bets are locked while the dice are out." };
  }
  if (!amount) {
    return { disabled: true, reason: "Tap the spot to bet." };
  }
  const probe = E.removeBet(game, spot, null, o.confirm ? { confirm: true } : {});
  if (probe.needsConfirm && !o.confirm) {
    return { amount: money(amount), warn: probe.warning, label: "Take down" };
  }
  if (!probe.ok) {
    return { amount: money(amount), disabled: true, reason: probe.error || "That bet stays up." };
  }
  return { amount: money(amount), label: o.confirm ? "Confirm take down" : "Take down", confirm: !!o.confirm };
}

export function boardTarget(term, app, mode) {
  if (!term) return { ok: false, reason: "That term isn't on this board." };
  const link = term.link && term.link[app === "table" ? "table" : "bubble"];
  if (!link) {
    const note = term.notes && (term.notes[app] || term.notes.table || term.notes.bubble);
    return { ok: false, reason: note || "That term isn't on this board." };
  }
  if (mode === "crapless" && (link === "dontPass" || link === "dontCome" || link === "dontPassOdds" || link === "ui:layTab")) {
    return { ok: false, reason: (term.notes && term.notes.crapless) || "Not in Crapless: there's no Don't side." };
  }
  if (app === "table" && (term.id === "big_6_8" || link === "big:6" || link === "big:8")) {
    return { ok: false, reason: (term.notes && term.notes.table) || "Off by default; turn it on with the board toggle." };
  }
  return { ok: true, link };
}


export function lingoKey(e) {
  if (!e || e.metaKey || e.ctrlKey || e.altKey) return false;
  if (e.key === "ContextMenu") return true;
  if (e.key === "F10" && e.shiftKey) return true;
  if (e.key === "l" || e.key === "L") return true;
  return false;
}

export function markSpots(root) {
  if (!root) return;
  root.querySelectorAll("[data-act='bet'], [data-act='spot'], [data-act='num']").forEach((el) => {
    if (el.closest("[data-act='roll'], [data-act='press'], [data-act='power'], .tc-shoot, .tc-keys, [data-act='throw']")) return;
    el.setAttribute("aria-keyshortcuts", "L Shift+F10");
    el.setAttribute("aria-haspopup", "dialog");
    const label = el.getAttribute("aria-label") || "";
    if (label.indexOf("Long-press for lingo") < 0) {
      el.setAttribute("aria-label", (label ? label + ". " : "") + "Long-press for lingo.");
    }
  });
}

export function focusSheet() {
  const head = document.querySelector(".lingo-sheet h2");
  if (!head) return;
  head.tabIndex = -1;
  head.focus();
}

/** Stable selector for the spot that opened the sheet. render() replaces the node. */
export function originSelector(el) {
  if (!el || !el.getAttribute) return "";
  const act = el.getAttribute("data-act") || "";
  let sel = act ? "[data-act='" + act.replace(/'/g, "") + "']" : "";
  for (const name of ["kind", "number", "pair", "n"]) {
    const v = el.getAttribute("data-" + name);
    if (v) sel += "[data-" + name + "='" + String(v).replace(/'/g, "") + "']";
  }
  return sel;
}

export function focusOrigin(sel) {
  if (!sel || typeof document === "undefined") return;
  const el = document.querySelector(sel);
  if (el && el.focus) el.focus();
}

export function screenHTML(app, session, asset, mode) {
  const term = session.cardId ? Lg.termById(session.cardId, app) : null;
  const target = term ? boardTarget(term, app, mode) : null;
  const card = term ? V.termCardHTML(term, {
    app,
    asset,
    mode,
    showMe: true,
    showDisabled: !!(target && !target.ok),
    showReason: target && !target.ok ? target.reason : "",
  }) : "";
  return V.lingoScreenHTML(app, {
    asset,
    category: session.category,
    query: session.query,
    recent: session.recent,
    seen: session.seen,
    card,
    mode,
  });
}

export function peekBlock(app, session, asset, mode) {
  if (!session.peekId) return "";
  const term = Lg.termById(session.peekId, app);
  if (!term) return "";
  return V.peekHTML(term, { app, asset, mode });
}

export function sheetBlock(app, session, game, opts) {
  if (!session.sheet) return "";
  const spot = session.sheet;
  const term = Lg.termForSpot(spot, app);
  const o = opts || {};
  const mode = o.mode || "regular";
  const target = boardTarget(term, app, mode);
  const edge = E.edgeFor(spot, mode === "crapless" ? "crapless" : undefined);
  const tutor = E.tutorEdgeNote(spot, mode, false, game && game.rules);
  const take = takeModel(game, spot, { rolling: o.rolling, confirm: session.confirm, money: o.money });
  return V.spotSheetHTML({
    name: term ? term.term : (spot.kind || "Spot"),
    termId: term ? term.id : "",
    card: term ? V.termCardHTML(term, { app, asset: o.asset, mode, compact: true }) : "",
    kick: o.tutorOn ? "Tutor" : "Beginner",
    tutor: tutor || (term ? term.meaning : ""),
    edge: edge != null ? edge + "%" : "",
    whyOpen: session.why,
    showDisabled: !target.ok,
    showReason: target.ok ? "" : target.reason,
    take,
  });
}

export function armDwell(session, id, onSeen) {
  clearTimeout(session.timer);
  session.focusId = id || "";
  if (!id || session.seen[id]) return;
  session.timer = setTimeout(() => {
    if (session.focusId !== id || session.seen[id]) return;
    session.seen[id] = true;
    onSeen(id);
  }, 2000);
}

export function rememberCall(session, id) {
  if (!id) return;
  session.recent = [id].concat(session.recent.filter((x) => x !== id)).slice(0, 5);
}

export function spotFromEl(el, fallbackKind) {
  const kind = el.dataset.kind || fallbackKind || "";
  const number = el.dataset.n || el.dataset.number || "";
  const pair = el.dataset.pair || "";
  const spot = Lg.parseSpotKind(kind, number);
  if (pair && !spot.pair) spot.pair = pair;
  return spot;
}
