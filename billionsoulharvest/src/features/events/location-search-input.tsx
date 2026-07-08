"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PlaceResult {
  venue: string;
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
}

interface NominatimResult {
  display_name: string;
  name: string;
  address: {
    amenity?: string;
    building?: string;
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    region?: string;
    country?: string;
    postcode?: string;
    suburb?: string;
    county?: string;
  };
}

interface Props {
  onPlaceSelect: (place: PlaceResult) => void;
}

export function LocationSearchInput({ onPlaceSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  }

  function handleSelect(result: NominatimResult) {
    const addr = result.address;
    onPlaceSelect({
      venue: addr.amenity || addr.building || result.name || "",
      address: result.display_name,
      city: addr.city || addr.town || addr.village || addr.municipality || "",
      region: addr.state || addr.region || addr.county || "",
      country: addr.country || "",
      postalCode: addr.postcode || "",
    });
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Search for a venue or address..."
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#29BDD6] focus:border-transparent"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#29BDD6] rounded-full animate-spin" />
        </div>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <span className="font-medium text-gray-900">
                  {r.address.amenity || r.address.building || r.name}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5 truncate">
                  {r.display_name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
