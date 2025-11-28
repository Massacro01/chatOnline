import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Cargar token y usuario desde localStorage al iniciar
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                // Verificar que el token no haya expirado
                const decoded = jwtDecode(storedToken);
                const currentTime = Date.now() / 1000;

                if (decoded.exp > currentTime) {
                    setToken(storedToken);
                    // Ensure stored user has id; if not, try to extract from token
                    const parsed = JSON.parse(storedUser);
                    if (!parsed?.id) {
                        const idFromToken = decoded.sub || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid'];
                        if (idFromToken) parsed.id = idFromToken;
                    }
                    setUser(parsed);
                    setIsAuthenticated(true);
                } else {
                    // Token expirado, limpiar
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Error al validar token:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        setLoading(false);
    }, []);

    // Función de Login
    const login = async (email, password) => {
        try {
            setLoading(true);
            const response = await authService.login(email, password);

            // Extraer token y decodificar datos del usuario
            const { token: jwtToken } = response;
            const decoded = jwtDecode(jwtToken);

            // Preparar objeto de usuario (usar sub como fallback para id)
            const userData = {
                id: decoded.sub || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid'],
                email: decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                fullName: decoded.name || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
            };

            // Guardar en localStorage
            localStorage.setItem('token', jwtToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Actualizar estado
            setToken(jwtToken);
            setUser(userData);
            setIsAuthenticated(true);

            toast.success('¡Bienvenido/a!');
            navigate('/dashboard');

            return { success: true };
        } catch (error) {
            console.error('Error en login:', error);

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.title ||
                'Error al iniciar sesión. Verifica tus credenciales.';

            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Función de Registro
    const register = async (fullName, email, password) => {
        try {
            setLoading(true);
            await authService.register(fullName, email, password);

            toast.success('¡Registro exitoso! Ahora puedes iniciar sesión.');
            navigate('/login');

            return { success: true };
        } catch (error) {
            console.error('Error en registro:', error);

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.title ||
                'Error al registrarse. Intenta nuevamente.';

            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Función de Logout
    const logout = () => {
        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Limpiar estado
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);

        toast.info('Sesión cerrada');
        navigate('/login');
    };

    const value = {
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }

    return context;
};

export default AuthContext;
