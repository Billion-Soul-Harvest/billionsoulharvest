"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export interface PlaceResult {
  venue: string;
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
}

interface Props {
  onPlaceSelect: (place: PlaceResult) => void;
}

export function GooglePlacesInput({ onPlaceSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !inputRef.current) return;

    setOptions({ key: apiKey, v: "weekly" });

    let autocomplete: google.maps.places.Autocomplete | null = null;

    importLibrary("places").then(() => {
      if (!inputRef.current) return;
      setLoaded(true);

      autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["establishment", "geocode"],
        fields: ["name", "formatted_address", "address_components"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete?.getPlace();
        if (!place?.address_components) return;

        const get = (type: string): string => {
          const comp = place.address_components?.find((c) =>
            c.types.includes(type)
          );
          return comp?.long_name ?? "";
        };

        onPlaceSelect({
          venue: place.name ?? "",
          address: place.formatted_address ?? "",
          city:
            get("locality") ||
            get("administrative_area_level_2") ||
            get("sublocality_level_1"),
          region: get("administrative_area_level_1"),
          country: get("country"),
          postalCode: get("postal_code"),
        });

        // Clear the search input after selection
        if (inputRef.current) inputRef.current.value = "";
      });
    });

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [onPlaceSelect]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <p className="text-xs text-amber-600">
        Google Maps API key not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={loaded ? "Search for a venue or address..." : "Loading..."}
        disabled={!loaded}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#29BDD6] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  );
}
