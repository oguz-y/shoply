import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

function getRoleFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload.role ||
      null
    );
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ token });
    }
    setAuthChecked(true);
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setUser({ token });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const role = getRoleFromToken(user?.token);
  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider value={{ user, login, logout, authChecked, role, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
