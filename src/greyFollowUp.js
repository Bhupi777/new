function calculateFare(pickup, dropoff) {
  // Simple logic, replace with your actual fare rules
  const baseFare = 15;
  const perKm = 2.4;
  const dummyDistance = 20; // TODO: Replace with real Maps API
  let fare = baseFare + (perKm * dummyDistance);

  if (fare < 50) fare = 50;

  // Apply tier rounding logic
  if (fare > 67) fare = 74.10;
  if (fare > 92) fare = 99.10;
  if (fare > 118) fare = 124.10;
  if (fare > 142) fare = 149.10;

  return fare.toFixed(2);
}

module.exports = { calculateFare };