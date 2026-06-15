/** Shape returned by api.countrystatecity.in (used by EIPFrontEnd useCountryStore). */
export type CountryStateApiEntry = { iso2: string; name: string };

/** Enough coverage for matrix Excel rows (NSW, VIC, QLD). */
export const COUNTRY_STATE_FIXTURES: Record<string, CountryStateApiEntry[]> = {
  countries: [
    { iso2: 'AU', name: 'Australia' },
    { iso2: 'NZ', name: 'New Zealand' },
  ],
  AU: [
    { iso2: 'NSW', name: 'New South Wales' },
    { iso2: 'VIC', name: 'Victoria' },
    { iso2: 'QLD', name: 'Queensland' },
    { iso2: 'SA', name: 'South Australia' },
    { iso2: 'WA', name: 'Western Australia' },
    { iso2: 'TAS', name: 'Tasmania' },
    { iso2: 'ACT', name: 'Australian Capital Territory' },
    { iso2: 'NT', name: 'Northern Territory' },
  ],
};
