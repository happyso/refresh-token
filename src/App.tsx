import React, { useCallback, useRef } from "react";
import "./App.css";
// start of 1
import { useAuth } from "./store";
import { login, refreshTokens, ActionLogout } from "./service";
import { useEffectOnce } from "./hooks";
// end of 1
function App() {
  // start of 2
  const {
    tokens: { refresh, auth },
    tokenExpiry,

    logout,
    authenticate,
  } = useAuth((state) => state);
  const intervalRef = useRef<NodeJS.Timer>();
  // end of 2

  // start of 3
  useEffectOnce(() => {
    if (refresh) {
      // try to renew tokens
      refreshTokens(refresh)
        .then((result) => {
          if (!result) return;
          const { auth, refresh, tokenExpiry } = result;
          authenticate({ auth, refresh }, tokenExpiry);
          intervalRef.current = setInterval(() => {
            console.log("called in useEffect()");
            sendRefreshToken();
          }, tokenExpiry);
        })
        .catch((err) => {
          if (err instanceof ActionLogout) {
            handleLogout();
          }
        });
    }
  });
  // end of 3

  // start of 4
  const handleLogout = useCallback(() => {
    logout();
    clearInterval(intervalRef.current);
    // eslint-disable-next-line
  }, [intervalRef]);

  const handleLogin = useCallback(async () => {
    const res = await login({ username: "admin", password: "password123" });
    if (!res) {
      return;
    }
    const { refresh: newRefresh, tokenExpiry, auth } = res;
    authenticate({ auth, refresh: newRefresh }, tokenExpiry);

    intervalRef.current = setInterval(() => {
      sendRefreshToken();
    }, tokenExpiry);

    // eslint-disable-next-line
  }, [refresh]);

  const sendRefreshToken = async () => {
    const refresh = localStorage.getItem("refreshToken")!;

    try {
      const result = await refreshTokens(refresh);
      if (!result) {
        return;
      }
      const { auth, refresh: newRefresh, tokenExpiry } = result;
      authenticate({ auth, refresh: newRefresh }, tokenExpiry);
    } catch (error) {
      if (error instanceof ActionLogout) {
        handleLogout();
      }
    }
  };

  // end of 4
  // start of part 5
  return (
    <div className="App">
      <p>
        {auth ? (
          <button onClick={() => handleLogout()}>Log out</button>
        ) : (
          <button onClick={() => handleLogin()}>Login</button>
        )}
      </p>
      <p>
        Token expiry:{" "}
        {tokenExpiry !== 0 && new Date(Date.now() + tokenExpiry).toUTCString()}
      </p>
      <p>Auth token: {auth}</p>
      <p>Refresh token: {refresh}</p>
    </div>
  );
  // end of part 5
}

export default App;
