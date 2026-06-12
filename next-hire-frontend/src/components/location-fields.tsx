import * as React from "react";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import {
  getCountries,
  getStates,
  getCities,
  getCurrencies,
  findCountryByName,
  findStateByName,
} from "@/lib/location-data";

interface CountrySelectProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// Searchable dropdown over the full ISO list of countries. Values/labels are
// both the country name (e.g. "United States") so they read naturally
// wherever city/state/country are stored or displayed as plain strings.
export function CountrySelect({ value, onChange, disabled, className }: CountrySelectProps) {
  const [options, setOptions] = React.useState<ComboboxOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    getCountries().then((countries) => {
      if (!active) return;
      setOptions(countries.map((c) => ({ value: c.name, label: c.name })));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Select country"
      searchPlaceholder="Search country..."
      emptyText="No country found."
      disabled={disabled}
      loading={loading}
      className={className}
    />
  );
}

interface StateSelectProps {
  country?: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// States/provinces for the selected country. Disabled until a country is
// chosen, and falls back gracefully for countries with no state-level data.
export function StateSelect({ country, value, onChange, disabled, className }: StateSelectProps) {
  const [options, setOptions] = React.useState<ComboboxOption[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!country) {
      setOptions([]);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      const countryObj = await findCountryByName(country);
      if (!countryObj) {
        if (active) {
          setOptions([]);
          setLoading(false);
        }
        return;
      }
      const states = await getStates(countryObj.isoCode);
      if (!active) return;
      setOptions(states.map((s) => ({ value: s.name, label: s.name })));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [country]);

  const noStates = !loading && !!country && options.length === 0;

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={
        !country ? "Select country first" : noStates ? "Not applicable" : "Select state"
      }
      searchPlaceholder="Search state..."
      emptyText="No state found."
      disabled={disabled || !country || noStates}
      loading={loading}
      className={className}
    />
  );
}

interface CitySelectProps {
  country?: string;
  state?: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// Cities for the selected country, narrowed further by state when one is
// chosen. Requires a country to be selected first.
export function CitySelect({ country, state, value, onChange, disabled, className }: CitySelectProps) {
  const [options, setOptions] = React.useState<ComboboxOption[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!country) {
      setOptions([]);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      const countryObj = await findCountryByName(country);
      if (!countryObj) {
        if (active) {
          setOptions([]);
          setLoading(false);
        }
        return;
      }
      let stateCode: string | undefined;
      if (state) {
        const stateObj = await findStateByName(countryObj.isoCode, state);
        stateCode = stateObj?.isoCode;
      }
      const cities = await getCities(countryObj.isoCode, stateCode);
      if (!active) return;
      setOptions(cities.map((c) => ({ value: c.name, label: c.name })));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [country, state]);

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={!country ? "Select country first" : "Select city"}
      searchPlaceholder="Search city..."
      emptyText="No city found."
      disabled={disabled || !country}
      loading={loading}
      className={className}
    />
  );
}

interface CurrencySelectProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// Searchable dropdown over ISO currency codes used by countries worldwide.
export function CurrencySelect({ value, onChange, disabled, className }: CurrencySelectProps) {
  const [options, setOptions] = React.useState<ComboboxOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    getCurrencies().then((currencies) => {
      if (!active) return;
      setOptions(
        currencies.map((c) => ({
          value: c.code,
          label: c.name === c.code ? c.code : `${c.code} - ${c.name}`,
        }))
      );
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Select currency"
      searchPlaceholder="Search currency..."
      emptyText="No currency found."
      disabled={disabled}
      loading={loading}
      className={className}
    />
  );
}
