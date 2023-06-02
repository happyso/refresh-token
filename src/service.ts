import http from "./lib/axios";
import axios, { AxiosError } from "axios";

// This interface is used to give structure to the response object. This was directly taken from the backend
export interface IHttpException {
  success: boolean;
  statusCode: number;
  error: string;
  code: string;
  message: string;
  details?: any;
}

// A custom error that you can throw to signifiy that the frontend should log out
export class ActionLogout extends Error {}
// service function to login

/**
 * An function that attempts to log in a user.
 * Accepts a username and a password, and returns the tokens and the token expiration or throws an error
 */
export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<
  | {
      auth: string;
      refresh: string;
      tokenExpiry: number;
    }
  | undefined
> {
  try {
    const credentials = {
      username: "admin",
      password: "password123",
    };
    // this is equal to http.post("http://<your-backend-uri>/auth/login", credentials);
    const res = await http.post("/auth/login", credentials);
    const {
      token: { auth, refresh },
      token_expiry,
    } = res.data;
    return { auth, refresh, tokenExpiry: token_expiry };
  } catch (err) {
    const error = err as Error | AxiosError;
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as IHttpException;
      console.log(data.message);
      console.log(data.code);
      return;
    }
    console.error(error);
  }
}

/*
 * An asynchronous function that refreshes the authenticated user's tokens.
 * Returns a new set of tokens and its expiration time.
 */
export async function refreshTokens(token: string): Promise<
  | {
      auth: string;
      refresh: string;
      tokenExpiry: number;
    }
  | undefined
> {
  try {
    // This is equivalent to http.get("http://<path-to-uri>/auth/refresh", { ... })
    const res = await http.get("/auth/refresh", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const {
      token: { auth, refresh },
      token_expiry,
    } = res.data;

    return { auth, refresh, tokenExpiry: token_expiry };
  } catch (err) {
    const error = err as Error | AxiosError;
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as IHttpException;
      console.log(data.message);
      console.log(data.code);
      if (data.code === "token/expired") {
        throw new ActionLogout();
      }
    }
    console.error(error);
    return;
  }
}
