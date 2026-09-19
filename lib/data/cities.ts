import type { City } from "@/lib/types";

/** Cost-of-living index: 100 = national average. Rent is median one-bedroom. */
export const cities: City[] = [
  { id: "national", name: "National average", costIndex: 100, medianRent: 1450 },
  { id: "atlanta", name: "Atlanta, GA", costIndex: 100, medianRent: 1600 },
  { id: "austin", name: "Austin, TX", costIndex: 101, medianRent: 1500 },
  { id: "boise", name: "Boise, ID", costIndex: 102, medianRent: 1300 },
  { id: "boston", name: "Boston, MA", costIndex: 145, medianRent: 2900 },
  { id: "chicago", name: "Chicago, IL", costIndex: 107, medianRent: 1900 },
  { id: "columbus", name: "Columbus, OH", costIndex: 90, medianRent: 1200 },
  { id: "dallas", name: "Dallas, TX", costIndex: 98, medianRent: 1450 },
  { id: "denver", name: "Denver, CO", costIndex: 111, medianRent: 1650 },
  { id: "houston", name: "Houston, TX", costIndex: 94, medianRent: 1300 },
  { id: "kansas-city", name: "Kansas City, MO", costIndex: 90, medianRent: 1200 },
  { id: "los-angeles", name: "Los Angeles, CA", costIndex: 150, medianRent: 2400 },
  { id: "miami", name: "Miami, FL", costIndex: 123, medianRent: 2600 },
  { id: "minneapolis", name: "Minneapolis, MN", costIndex: 98, medianRent: 1350 },
  { id: "nashville", name: "Nashville, TN", costIndex: 99, medianRent: 1500 },
  { id: "new-york", name: "New York, NY", costIndex: 168, medianRent: 3600 },
  { id: "philadelphia", name: "Philadelphia, PA", costIndex: 101, medianRent: 1600 },
  { id: "phoenix", name: "Phoenix, AZ", costIndex: 103, medianRent: 1400 },
  { id: "pittsburgh", name: "Pittsburgh, PA", costIndex: 88, medianRent: 1300 },
  { id: "portland", name: "Portland, OR", costIndex: 115, medianRent: 1600 },
  { id: "raleigh", name: "Raleigh, NC", costIndex: 96, medianRent: 1450 },
  { id: "salt-lake-city", name: "Salt Lake City, UT", costIndex: 103, medianRent: 1400 },
  { id: "san-diego", name: "San Diego, CA", costIndex: 144, medianRent: 2500 },
  { id: "san-francisco", name: "San Francisco, CA", costIndex: 169, medianRent: 3000 },
  { id: "seattle", name: "Seattle, WA", costIndex: 129, medianRent: 2100 },
  { id: "st-louis", name: "St. Louis, MO", costIndex: 87, medianRent: 1150 },
  { id: "washington-dc", name: "Washington, DC", costIndex: 135, medianRent: 2200 },
];

/** Annual non-housing spending at a national-average cost of living. */
export const baseNonHousingSpend = 23400;
