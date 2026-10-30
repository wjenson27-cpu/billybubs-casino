/** Horizontal pager gesture. A sideways move wins even if it started on a button. */
export const SWIPE_THRESHOLD = 48;

export function resolveSwipe(page, dx, dy) {
  const current = page < 0 ? 0 : page > 2 ? 2 : page;
  if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return current;
  if (dx < 0) return Math.min(2, current + 1);
  return Math.max(0, current - 1);
}
