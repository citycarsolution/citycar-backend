// simple helper to create wa.me link with prefilled text.
// We will not call external APIs here. Frontend will open the link returned by backend,
// but backend will simply generate a prefilled text URL for confirmation & logging.
// Note: wa.me requires phone without '+' and country code. Here we assume phone includes country code.

export function createWhatsAppLink(phoneWithCountry, message) {
  if (!phoneWithCountry) return null;
  const phone = phoneWithCountry.replace(/\D/g, ""); // numbers only
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
}
