// backend/src/utils/calcFare.js
export function calcFareForBooking(booking, km = 0, arrivalDelayMin = 0) {
  const result = { base: 0, extra: 0, total: 0 };

  // simple example rates (tweak to match PRICE constants on frontend)
  const rates = {
    sedan: { baseKm: 10, baseFare: 650, extraPerKm: 15, waitFreeMin: 60, waitPerMin: 2 },
    ertiga: { baseKm: 10, baseFare: 850, extraPerKm: 20, waitFreeMin: 60, waitPerMin: 3 },
    crysta: { baseKm: 40, baseFare: 2250, extraPerKm: 22, waitFreeMin: 240, waitPerMin: 5 },
  };

  const vehicle = booking.carId || booking.car?.id || "sedan";
  const cfg = rates[vehicle] || rates["sedan"];

  result.base = cfg.baseFare;
  const extraKm = Math.max(0, (km || 0) - cfg.baseKm);
  const distanceExtra = extraKm * cfg.extraPerKm;
  const waitExtra = Math.max(0, (arrivalDelayMin || 0) - cfg.waitFreeMin) * cfg.waitPerMin;

  result.extra = Math.round(distanceExtra + waitExtra);
  result.total = result.base + result.extra;

  return result;
}
