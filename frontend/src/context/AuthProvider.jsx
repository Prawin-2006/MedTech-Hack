import { useMemo, useState } from 'react';
import { authAPI } from '../services/api';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
    const savedToken = localStorage.getItem('medchain_token');
    const savedUser = localStorage.getItem('medchain_user');

    const [user, setUser] = useState(() => {
        if (!savedToken || !savedUser) return null;
        try {
            return JSON.parse(savedUser);
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(() => (savedToken && savedUser ? savedToken : null));
    const [loading] = useState(false);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('medchain_token', newToken);
        localStorage.setItem('medchain_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (data) => {
        const res = await authAPI.register(data);
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('medchain_token', newToken);
        localStorage.setItem('medchain_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('medchain_token');
        localStorage.removeItem('medchain_user');
        setToken(null);
        setUser(null);
    };

    const value = useMemo(
        () => ({ user, token, loading, login, register, logout, isAuthenticated: Boolean(token) }),
        [user, token, loading],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
