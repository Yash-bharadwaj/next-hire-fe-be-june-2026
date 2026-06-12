import type { ICountry, IState, ICity } from "country-state-city";

// Each of these is its own (large) JSON file under the hood, so we load
// them lazily via dynamic import — they become separate chunks that are
// only fetched the first time a location dropdown is opened.
let countryApi: typeof import("country-state-city/lib/country").default | null = null;
let stateApi: typeof import("country-state-city/lib/state").default | null = null;
let cityApi: typeof import("country-state-city/lib/city").default | null = null;

const stateCache = new Map<string, IState[]>();
const cityCache = new Map<string, ICity[]>();
let countryCache: ICountry[] | null = null;

export async function getCountries(): Promise<ICountry[]> {
  if (countryCache) return countryCache;
  if (!countryApi) countryApi = (await import("country-state-city/lib/country")).default;
  countryCache = countryApi.getAllCountries();
  return countryCache;
}

export async function getStates(countryCode: string): Promise<IState[]> {
  const cached = stateCache.get(countryCode);
  if (cached) return cached;
  if (!stateApi) stateApi = (await import("country-state-city/lib/state")).default;
  const states = stateApi.getStatesOfCountry(countryCode);
  stateCache.set(countryCode, states);
  return states;
}

export async function getCities(countryCode: string, stateCode?: string): Promise<ICity[]> {
  const key = `${countryCode}|${stateCode ?? ""}`;
  const cached = cityCache.get(key);
  if (cached) return cached;
  if (!cityApi) cityApi = (await import("country-state-city/lib/city")).default;
  const cities = stateCode
    ? cityApi.getCitiesOfState(countryCode, stateCode)
    : cityApi.getCitiesOfCountry(countryCode) ?? [];
  cityCache.set(key, cities);
  return cities;
}

export async function findCountryByName(name: string): Promise<ICountry | undefined> {
  const countries = await getCountries();
  return countries.find((c) => c.name === name);
}

export async function findStateByName(countryCode: string, name: string): Promise<IState | undefined> {
  const states = await getStates(countryCode);
  return states.find((s) => s.name === name);
}

// Friendly names for the most commonly used currencies. Any currency code
// without an entry here just falls back to displaying the bare ISO code.
const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  INR: "Indian Rupee",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  JPY: "Japanese Yen",
  CNY: "Chinese Yuan",
  SGD: "Singapore Dollar",
  AED: "UAE Dirham",
  CHF: "Swiss Franc",
  HKD: "Hong Kong Dollar",
  NZD: "New Zealand Dollar",
  ZAR: "South African Rand",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  PLN: "Polish Zloty",
  MXN: "Mexican Peso",
  BRL: "Brazilian Real",
  PHP: "Philippine Peso",
  IDR: "Indonesian Rupiah",
  MYR: "Malaysian Ringgit",
  THB: "Thai Baht",
  VND: "Vietnamese Dong",
  KRW: "South Korean Won",
  TRY: "Turkish Lira",
  SAR: "Saudi Riyal",
  QAR: "Qatari Riyal",
  ILS: "Israeli New Shekel",
  EGP: "Egyptian Pound",
  PKR: "Pakistani Rupee",
  BDT: "Bangladeshi Taka",
  LKR: "Sri Lankan Rupee",
  NGN: "Nigerian Naira",
  KES: "Kenyan Shilling",
  RUB: "Russian Ruble",
  UAH: "Ukrainian Hryvnia",
  CZK: "Czech Koruna",
  HUF: "Hungarian Forint",
  RON: "Romanian Leu",
  ARS: "Argentine Peso",
  CLP: "Chilean Peso",
  COP: "Colombian Peso",
  PEN: "Peruvian Sol",
};

export async function getCurrencies(): Promise<{ code: string; name: string }[]> {
  const countries = await getCountries();
  const codes = new Set<string>();
  for (const country of countries) {
    if (country.currency) codes.add(country.currency);
  }
  return Array.from(codes)
    .sort()
    .map((code) => ({ code, name: CURRENCY_NAMES[code] || code }));
}
