import { useEffect } from "react";
import { useAuthStore } from "../stores/auth.store";

export const useBootstrap = () => {
  const hydrate =
    useAuthStore(
      (state) => state.hydrate
    );

  useEffect(() => {
    hydrate();
  }, []);
};