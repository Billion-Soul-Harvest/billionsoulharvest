import { useState, useEffect } from "react";
import * as Location from "expo-location";

interface LocationState {
  coords: { lat: number; lng: number } | null;
  error: string | null;
  isLoading: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coords: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function getLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          if (isMounted) {
            setState({
              coords: null,
              error: "Location permission denied",
              isLoading: false,
            });
          }
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          setState({
            coords: {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            },
            error: null,
            isLoading: false,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            coords: null,
            error: "Failed to get location",
            isLoading: false,
          });
        }
      }
    }

    getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
