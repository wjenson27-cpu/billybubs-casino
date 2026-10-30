/**
 * Craps Lingo screens. Visuals follow the Design Desk lingo handoff
 * (scoped classes so they don't restyle the rest of the app).
 */
import { FOOTER, EMPTY, counts, grouped, search, noteFor, tagClass, termsFor, termById } from "bb-lingo";

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function pips(pairs, asset) {
  if (!pairs || !pairs.length) return "";
  return "<span class='lingo-dice'>" + pairs.slice(0, 3).map((pair) => {
    const faces = String(pair).split("-").map((n) => "<img src='" + asset + "dice/faces/face-" + n + ".svg' alt='' width='18' height='18'>").join("");
    return "<span>" + faces + "</span>";
  }).join("") + "</span>";
}

export function termCardHTML(term, opts) {
  const o = opts || {};
  const asset = o.asset || "assets/";
  const app = o.app === "table" ? "table" : "bubble";
  const note = noteFor(term, app, o.mode);
  const aka = (term.aliases || []).slice(0, 3).join(" · ");
  const say = term.say ? "<span class='say'>Say it " + esc(term.say) + "</span>" : "";
  const rel = (term.related || []).map((id) => {
    const linked = termById(id, app);
    const title = linked ? linked.term : id.replace(/_/g, " ");
    return "<button type='button' class='lingo-btn' data-act='lingo-open' data-id='" + esc(id) + "'>" + esc(title) + "</button>";
  }).join("");
  const show = o.showMe
    ? "<div class='lingo-row'><button type='button' class='lingo-btn' data-act='lingo-show' data-id='" + esc(term.id) + "'" + (o.showDisabled ? " disabled" : "") + ">Show me on the board</button></div>" +
      (o.showReason ? "<p class='lingo-note'>" + esc(o.showReason) + "</p>" : "")
    : "";
  const cls = "lingo-card" + (o.compact ? " compact" : "");
  return "<article class='" + cls + "' data-term='" + esc(term.id) + "'>" +
    "<h2>" + esc(term.term) + "</h2>" +
    (aka ? "<p class='aka'>Also " + esc(aka) + "</p>" : "") +
    "<span class='lingo-tag " + tagClass(term.tag) + "'>" + esc(term.tag || "") + "</span>" +
    (term.dice && term.dice.pairs ? pips(term.dice.pairs, asset) : "") +
    "<p class='mean'>" + esc(term.meaning) + "</p>" +
    "<div class='lingo-plate' data-mascot='billy'><img src='" + asset + "mascots/dealer-billy/small/billy-A-avatar-round.svg' alt='Dealer Billy'><div><span class='who'>Dealer Billy</span><q>" + esc(term.call) + "</q>" + say + "</div></div>" +
    (note ? "<p class='lingo-note'>" + esc(note) + "</p>" : "") +
    show +
    (rel ? "<div class='lingo-rel'>" + rel + "</div>" : "") +
    (o.footer === false ? "" : "<p class='lingo-foot'>" + FOOTER + "</p>") +
    "</article>";
}

export function learnRowHTML(app) {
  const n = termsFor(app).length;
  return "<button type='button' class='lingo-lrow' data-act='lingo'><span class='ico'>“</span><span><b>Craps Lingo</b><small>" + n + " table terms and dealer calls</small></span><span class='chev'>›</span></button>";
}

export function lingoScreenHTML(app, opts) {
  const o = opts || {};
  const asset = o.asset || "assets/";
  const cat = o.category || "all";
  const n = counts(app);
  const chips = ["all", "dice", "bets", "actions", "table"].map((key) => {
    const label = key === "all" ? "All" : key[0].toUpperCase() + key.slice(1);
    return "<button type='button' role='radio' aria-checked='" + (cat === key) + "' class='" + (cat === key ? "on" : "") + "' data-act='lingo-cat' data-cat='" + key + "'>" + label + "<em>" + n[key] + "</em></button>";
  }).join("");
  const found = o.query ? search(o.query, app) : null;
  let body = "";
  if (found) {
    if (!found.hits.length && !found.didYouMean.length) body = "<p class='lingo-empty'>" + EMPTY + "</p>";
    else if (found.didYouMean.length) {
      body = "<h3 class='lingo-grp'>Did you mean</h3>" + found.didYouMean.map((t) => rowHTML(t, asset, o.seen)).join("");
    } else body = found.hits.map((t) => rowHTML(t, asset, o.seen)).join("");
  } else {
    body = grouped(app, cat).map((g) => "<h3 class='lingo-grp'>" + esc(g.label) + "</h3>" + g.terms.map((t) => rowHTML(t, asset, o.seen)).join("")).join("");
  }
  const recent = (o.recent || []).slice(0, 5);
  const strip = recent.length ? "<div class='lingo-rc'><h3>Recent calls</h3><div class='strip'>" + recent.map((id) => {
    const linked = termById(id, app);
    const title = linked ? linked.term : String(id).replace(/_/g, " ");
    return "<button type='button' data-act='lingo-open' data-id='" + esc(id) + "'>" + esc(title) + "</button>";
  }).join("") + "</div></div>" : "";
  return "<div class='lingo-screen' id='lingo'><button type='button' class='lingo-x' data-act='lingo-close' aria-label='Close'>×</button>" +
    "<h1>Craps Lingo</h1><p class='sub'>Dealer Billy's table talk. Free in both apps.</p>" +
    "<label class='lingo-search'><input type='search' data-act='lingo-q' value='" + esc(o.query || "") + "' placeholder=\"Search: field, yo, 8…\" aria-label='Search lingo' autocomplete='off'></label>" +
    "<div class='lingo-chips' role='radiogroup'>" + chips + "</div>" + strip +
    (o.card ? "<div class='lingo-focus' id='lingo-card'>" + o.card + "</div>" : "") +
    "<div class='lingo-list'>" + body + "</div><p class='lingo-foot'>" + FOOTER + "</p></div>";
}

function rowHTML(term, asset, seen) {
  const pip = term.dice && term.dice.pairs && term.dice.pairs[0]
    ? "<span class='pp'><img src='" + asset + "dice/faces/face-" + String(term.dice.pairs[0]).split("-")[0] + ".svg' alt='' width='18' height='18'><img src='" + asset + "dice/faces/face-" + String(term.dice.pairs[0]).split("-")[1] + ".svg' alt='' width='18' height='18'></span>"
    : "";
  const tick = seen && seen[term.id] ? "<span class='seen' aria-label='seen'>✓</span>" : "";
  const blurb = String(term.meaning || "").split(". ")[0];
  return "<button type='button' class='lingo-term' data-act='lingo-row' data-id='" + esc(term.id) + "'>" + pip +
    "<span class='tx'><span class='tn'>" + esc(term.term) + "</span><span class='tm'>" + esc(blurb) + ".</span></span>" + tick + "</button>";
}

export function peekHTML(term, opts) {
  const o = opts || {};
  return "<aside class='lingo-peek' role='region' aria-label='Lingo: " + esc(term.term) + "'><button type='button' class='lingo-x' data-act='peek-close' aria-label='Close'>×</button>" +
    termCardHTML(term, Object.assign({}, o, { compact: true, footer: true })) +
    "<div class='lingo-row'><button type='button' class='lingo-btn' data-act='lingo-open' data-id='" + esc(term.id) + "'>Open full card</button>" +
    "<button type='button' class='lingo-btn' data-act='lingo-show' data-id='" + esc(term.id) + "'>Show me on the board</button></div></aside>";
}

export function spotSheetHTML(model) {
  const m = model || {};
  const take = m.take || {};
  const btn = take.disabled
    ? "<button type='button' class='lingo-btn' disabled aria-disabled='true'>Take down</button>"
    : "<button type='button' class='lingo-btn go' data-act='lingo-take'" + (take.confirm ? " data-confirm='1'" : "") + ">" + esc(take.label || "Take down") + "</button>";
  const extra = take.reason ? "<span class='reason'>" + esc(take.reason) + "</span>" : (take.warn ? "<span class='warn'>" + esc(take.warn) + "</span>" : "");
  const amt = take.amount ? "<span class='amt'>" + esc(take.amount) + "</span><small>on " + esc(m.name || "this spot") + "</small>" : "";
  return "<div class='lingo-scrim' data-act='sheet-close'><section class='lingo-sheet' role='dialog' aria-modal='false' aria-label='" + esc(m.name || "Spot") + " spot sheet'>" +
    "<button type='button' class='lingo-grab' data-act='sheet-close' aria-label='Close'></button>" +
    "<button type='button' class='lingo-x' data-act='sheet-close' aria-label='Close'>×</button>" +
    (m.card || "") +
    "<div class='lingo-sec'><h3>Tutor</h3><div class='lingo-tutor'><span class='kick'>" + esc(m.kick || "Beginner") + "</span><p>" + esc(m.tutor || "") +
    (m.edge ? " <span class='edge'>Edge " + esc(m.edge) + "</span>" : "") + "</p>" +
    "<p class='why'" + (m.whyOpen ? "" : " hidden") + ">Edge is the house's average share of each bet over the long run. It doesn't change from roll to roll.</p>" +
    "<div class='lingo-row'><button type='button' class='lingo-btn' data-act='lingo-why'>Why?</button>" +
    "<button type='button' class='lingo-btn' data-act='lingo-show' data-id='" + esc(m.termId || "") + "'" + (m.showDisabled ? " disabled" : "") + ">Show me on the board</button></div>" +
    (m.showReason ? "<p class='why'>" + esc(m.showReason) + "</p>" : "") +
    "</div></div>" +
    "<div class='lingo-sec'><h3>Your bet</h3><div class='lingo-bet'>" + (amt || "<span class='reason'>No chips on the " + esc(m.name || "spot") + ". Tap the spot to bet.</span>") + btn + extra + "</div></div>" +
    "<p class='lingo-foot'>" + FOOTER + "</p></section></div>";
}

export function callButton(text, term, label) {
  if (!term) return "<span class='readcall'>" + esc(text) + "</span>";
  const aria = (label || term.srLabel || term.term) + ". Open in Lingo.";
  return "<button type='button' class='lingo-call readcall' data-act='lingo-peek' data-id='" + esc(term.id) + "' aria-label='" + esc(aria) + "'>" + esc(text) + "</button>";
}
