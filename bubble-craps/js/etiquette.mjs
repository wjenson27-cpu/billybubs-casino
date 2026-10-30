/**
 * Dealer Billy's table-manners deck. Shared by both apps.
 * Bubbles Billie does not appear here.
 */

export const ETIQUETTE = [
  { id: "buy_in", n: 1, topic: "Buying in", liveOnly: true, apps: ["table", "bubble"], billy: "Buy in between rolls. Lay your cash flat on the felt and say 'Change, please.' Don't hand it to me, I'm not allowed to take it from your hand.", why: "Cash has to be in view of the cameras and the boxperson, and the dice can't be in the air while it's counted." },
  { id: "hands_clear", n: 2, topic: "Hands out of the way", liveOnly: true, apps: ["table", "bubble"], billy: "When the stickman says 'dice are out,' get your hands off the felt and out of the landing zone.", why: "A die that hits a hand can be called a no-roll, and nobody wants to be the reason the shooter's roll got spoiled." },
  { id: "one_hand_throw", n: 3, topic: "Throw with one hand, hit the back wall", liveOnly: true, apps: ["table", "bubble"], billy: "Pick the dice up with one hand, keep them over the table, and throw so both dice bounce off the back wall.", why: "The back wall makes the roll random. That's the rule at nearly every table, and the boxperson can call a no-roll if you miss it." },
  { id: "no_seven", n: 4, topic: "Don't say seven", liveOnly: false, apps: ["table", "bubble"], billy: "At the table it's 'big red' or nothing at all. Don't say the S-word while the dice are out.", why: "It's an old superstition. It doesn't change the dice (nothing does), but it's polite to the people around you." },
  { id: "tipping", n: 5, topic: "Tipping and toking", liveOnly: true, apps: ["table", "bubble"], billy: "If the crew's treating you right, toke them. Most players toke with a bet for the dealers, like a dollar on the Pass line or a hardway 'for the boys.' Say it out loud so we book it for us.", why: "Dealers earn much of their pay from tokes, and a bet for the crew is the classic way to say thanks. A toke is optional and part of your budget, not on top of it." },
  { id: "hands_off_bets", n: 6, topic: "Don't touch bets mid-roll", liveOnly: true, apps: ["table", "bubble"], billy: "Once the dice are out, hands off your chips. Put Come bets in the Come box and I'll move them. For Place and Buy bets, set your chips in the Come area and tell me: 'Place the 6 and 8.'", why: "Only the dealer touches bets on the numbers, so every bet is clear to the cameras and nobody's bet gets mixed up." },
  { id: "call_bets", n: 7, topic: "Call your bets clearly", liveOnly: true, apps: ["table", "bubble"], billy: "Say it clearly, like 'Yo eleven, five dollars,' and say it before the dice are out. If I don't hear it in time, it isn't booked.", why: "A late or mumbled bet might not be in action, and arguments after the roll slow the game for everyone." },
  { id: "color_up", n: 8, topic: "Color up when you leave", liveOnly: true, apps: ["table", "bubble"], billy: "When you're done, set your chips on the felt between rolls and say 'Color up.' I'll trade the small chips for big ones.", why: "Fewer chips are easier to carry, and it keeps the dealers' small chips on the table where they're needed." },
  { id: "dark_side", n: 9, topic: "Dark-side manners", liveOnly: false, apps: ["table", "bubble"], billy: "Betting Don't Pass is fine. Do it quietly, and don't cheer when the shooter sevens out.", why: "Most of the table is betting with the shooter. Winning on the dark side is fine; celebrating it isn't." },
  { id: "phones_drinks", n: 10, topic: "Phones and drinks off the rail", liveOnly: true, apps: ["table", "bubble"], billy: "Keep drinks on the shelf under the rail, never on the rail or the felt. And phones down while the dice are out; many casinos don't allow them at the table.", why: "A spill stops the game and soaks the felt, and some casinos restrict phones at the tables." },
  { id: "chips_in_rail", n: 11, topic: "Chips in the rail", liveOnly: true, apps: ["table", "bubble"], billy: "Keep your chips in the rail in front of you. Only bets go on the felt.", why: "Chips sitting on the felt edge can be mistaken for a bet, and chips in your rail are easy to keep track of." },
  { id: "same_dice", n: 12, topic: "Same dice", liveOnly: true, apps: ["table", "bubble"], billy: "If a die flies off the table, you can call 'Same dice' and I'll check it and bring it back. Or take a new one from the stick, it's your call.", why: "It's a superstition, not a rule; the dice are just as fair either way." },
  { id: "no_leaning", n: 13, topic: "No leaning over the table", liveOnly: true, apps: ["table", "bubble"], billy: "Stand at your spot. Don't lean over the felt to reach a bet. Ask me, and I'll put it where you want it.", why: "Leaning blocks the shooter's throw and the cameras, and it can knock over bets." },
  { id: "check_minimum", n: 14, topic: "Check the sign first", liveOnly: false, apps: ["table"], billy: "Read the table sign before you buy in. It shows the minimum, the maximum and the odds allowed.", why: "It saves you from buying in at a table that's bigger than your budget." },
  { id: "ask_dealer", n: 15, topic: "Ask the dealer", liveOnly: true, apps: ["table", "bubble"], billy: "Not sure? Ask me between rolls. Helping you is the job.", why: "Dealers would rather explain a bet than fix a wrong one." },
];

export const ETIQUETTE_FOOTER = "Every casino does it a little differently. When in doubt, ask the dealer.";

const BANNED = ["bet more", "you're due", "hot table", "cold dice", "beat the house"];

export function etiquetteById(id) {
  return ETIQUETTE.find((t) => t.id === id) || null;
}

function forApp(app) {
  return ETIQUETTE.filter((t) => !t.apps || t.apps.indexOf(app) >= 0);
}

/** Bubble: both-tagged tips first, then the live-table section. Table-only tips stay on Table. */
export function deckFor(app) {
  const mine = forApp(app);
  if (app === "bubble") {
    const both = mine.filter((t) => !t.liveOnly);
    const live = mine.filter((t) => t.liveOnly);
    return { both, live, all: both.concat(live) };
  }
  return { both: mine.filter((t) => !t.liveOnly), live: [], all: mine.slice() };
}

export function etiquetteClean() {
  return ETIQUETTE.every((t) => {
    const text = (t.billy + " " + t.why).toLowerCase();
    if (t.billy.length > 220) return false;
    if (!t.why || !t.id) return false;
    if (BANNED.some((w) => text.indexOf(w) >= 0)) return false;
    return true;
  });
}

/** One tip per session, in order, never repeating until all have shown. */
export function nextSessionTip(index, app) {
  const deck = deckFor(app).all;
  const i = ((index || 0) % deck.length + deck.length) % deck.length;
  return { tip: deck[i], next: i + 1 };
}

export const NUDGES = {
  buy_in: "buy_in",
  set_dice: "one_hand_throw",
  no_roll: "same_dice",
  bet_while_rolling: "hands_off_bets",
  late_bet: "call_bets",
  first_place: "hands_off_bets",
  leave_table: "color_up",
  first_dont: "dark_side",
  session_start: "check_minimum",
  new_shooter: "hands_clear",
};

const BUBBLE_NUDGES = new Set(["first_dont"]);

export function nudgeFor(trigger, app) {
  if (app === "bubble" && !BUBBLE_NUDGES.has(trigger)) return null;
  const id = NUDGES[trigger];
  const tip = id ? etiquetteById(id) : null;
  if (!tip || (tip.apps && tip.apps.indexOf(app) < 0)) return null;
  return tip;
}
