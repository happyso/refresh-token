import create from "zustand";
import { devtools } from "zustand/middleware";

interface IAuthState {
  tokens: {
    auth: string;
    refresh: string;
  };
  count: number;
  tokenExpiry: number;
  authenticate: (
    tokens: {
      auth: string;
      refresh: string;
    },
    tokenExpiry: number
  ) => void;
  logout: () => void;
  increment: () => void;
}

export const useAuth = create<IAuthState>()(
  devtools((set, get) => ({
    count: 0,
    tokens: {
      auth: "",
      // We will store the refresh token in localStorage. Again, this is an unsecure option, feel free to look for alternatives.
      refresh: localStorage.getItem("refreshToken") || "",
    },
    tokenExpiry: 0,
    increment: () => set({ count: get().count + 1 }),
    logout: () => {
      localStorage.setItem("refreshToken", "");
      set(() => ({
        tokens: {
          auth: "",
          refresh: "",
        },
        tokenExpiry: 0,
      }));
    },
    authenticate: (tokens, tokenExpiry) => {
      localStorage.setItem("refreshToken", tokens.refresh);
      set(() => ({
        tokens,
        tokenExpiry,
      }));
    },
  }))
);
