import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import './App.css';

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando...</p>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="app">
                    <Routes>
                        {/* Ruta de Login */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Ruta de Registro */}
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Ruta protegida de Chat (sin ID - muestra layout vacío) */}
                        <Route
                            path="/chat"
                            element={
                                <PrivateRoute>
                                    <ChatPage />
                                </PrivateRoute>
                            }
                        />

                        {/* Ruta protegida de Chat con grupo específico */}
                        <Route
                            path="/board/:id"
                            element={
                                <PrivateRoute>
                                    <ChatPage />
                                </PrivateRoute>
                            }
                        />

                        {/* Ruta raíz - Redirige según estado de autenticación */}
                        <Route
                            path="/"
                            element={<LoginRedirect />}
                        />

                        {/* Ruta 404 */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>

                    {/* Toast Container para notificaciones */}
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

// Componente auxiliar para redirigir la ruta raíz
const LoginRedirect = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando...</p>
            </div>
        );
    }

    return <Navigate to={isAuthenticated ? '/chat' : '/login'} />;
};

export default App;
