// Fake catalog pricing: newer releases cost more
export const priceFor = (releaseDate) => {
  if (!releaseDate) return 4.99;
  const years = (Date.now() - new Date(releaseDate)) / (365.25 * 24 * 60 * 60 * 1000);
  if (years < 1) return 24.99;
  if (years < 5) return 14.99;
  if (years < 15) return 9.99;
  return 4.99;
};

export const formatPrice = (price) =>
  price.toLocaleString(undefined, { style: "currency", currency: "USD" });
