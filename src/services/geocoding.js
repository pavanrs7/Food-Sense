// Create a new file for geocoding services

// Map of major Indian cities with their approximate coordinates
const CITY_COORDINATES = {
  mumbai: { latitude: 19.076, longitude: 72.8777 },
  delhi: { latitude: 28.6139, longitude: 77.209 },
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  hyderabad: { latitude: 17.385, longitude: 78.4867 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  kolkata: { latitude: 22.5726, longitude: 88.3639 },
  pune: { latitude: 18.5204, longitude: 73.8567 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
  lucknow: { latitude: 26.8467, longitude: 80.9462 },
  // Add more cities as needed
};

/**
 * Simulates geocoding an address to coordinates
 * In a real app, you would use a geocoding API like Google Maps or Mapbox
 *
 * @param {Object} addressData - Address data with street, city, state, postalCode
 * @returns {Promise<Object>} - Geocoded location with latitude, longitude, and address
 */
export const geocodeAddress = async (addressData) => {
  const { address, city, state, postalCode } = addressData;
  const fullAddress = `${address}, ${city}, ${state} ${postalCode}`;

  return new Promise((resolve) => {
    setTimeout(() => {
      // Try to find the city in our predefined list
      const cityLower = city.toLowerCase();
      let baseCoordinates;

      // Find the closest matching city
      for (const [cityName, coords] of Object.entries(CITY_COORDINATES)) {
        if (cityLower.includes(cityName) || cityName.includes(cityLower)) {
          baseCoordinates = coords;
          break;
        }
      }

      // If no city match found, use a default location in India
      if (!baseCoordinates) {
        baseCoordinates = { latitude: 20.5937, longitude: 78.9629 }; // India center
      }

      // Add a small random offset to simulate different locations within the same city
      // The offset is small enough to keep the location within the city
      const latOffset = (Math.random() - 0.5) * 0.05; // About 5km max
      const lngOffset = (Math.random() - 0.5) * 0.05;

      resolve({
        latitude: baseCoordinates.latitude + latOffset,
        longitude: baseCoordinates.longitude + lngOffset,
        address: fullAddress,
      });
    }, 1000); // Simulate network delay
  });
};
