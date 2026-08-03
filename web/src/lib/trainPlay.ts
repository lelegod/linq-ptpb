/** Custom event: play the homepage hero train watermark once. */
export const TRAIN_PLAY_EVENT = "rejsy:train-play";

export function playHeroTrain() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(TRAIN_PLAY_EVENT));
}
