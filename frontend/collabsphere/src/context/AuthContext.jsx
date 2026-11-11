import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContextValue";
import {
  getCurrentUser,
  login as loginUser,
  logout as logoutUser,
} from "../services/authService";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((data) => {
        if (isMounted) {
          setUser(data.user);
          setSessionError("");
        }
      })
      .catch((error) => {
        if (isMounted && error.status !== 401) {
          setSessionError(error.message || "Unable to check your session.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const retrySession = async () => {
    setLoading(true);
    setSessionError("");
    try {
      const data = await getCurrentUser();
      setUser(data.user);
    } catch (error) {
      if (error.status !== 401) {
        setSessionError(error.message || "Unable to check your session.");
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials) => {
    const data = await loginUser(credentials);
    setUser(data.user);
    setSessionError("");
    return data;
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
    setSessionError("");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, sessionError, signIn, signOut, retrySession, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}