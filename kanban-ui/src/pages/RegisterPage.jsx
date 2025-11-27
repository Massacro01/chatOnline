import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación básica
        if (!fullName || !email || !password || !confirmPassword) {
            return;
        }

        // Verificar que las contraseñas coincidan
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);
        await register(fullName, email, password);
        setIsLoading(false);
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h1>Crear Cuenta</h1>
                    <p>Únete a KanbanApp hoy</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Nombre Completo</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Tu nombre completo"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                            required
                            disabled={isLoading}
                            minLength={8}
                        />
                        <small className="password-hint">
                            La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite tu contraseña"
                            required
                            disabled={isLoading}
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className="register-footer">
                    <p>
                        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
