const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const fullNumber = new Intl.NumberFormat("en");

export function ratingCount(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export function audienceRating(item) {
  const count = ratingCount(item.vote_count);
  const value = Number(item.vote_average);
  const score = count !== 0 && Number.isFinite(value) && value > 0 && value <= 10 ? value.toFixed(1) : null;
  const countText =
    count === null
      ? "Rating count unavailable"
      : `${fullNumber.format(count)} ${count === 1 ? "rating" : "ratings"}`;
  return {
    score,
    count,
    countText,
    compactCount:
      count === null ? countText : `${compactNumber.format(count)} ${count === 1 ? "rating" : "ratings"}`,
    description: score ? `${score} out of 10 on TMDB. ${countText}.` : `Not rated on TMDB. ${countText}.`,
  };
}
