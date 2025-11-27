import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import boardService from '../services/boardService';
import { toast } from 'react-toastify';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cargar tableros al montar el componente
    useEffect(() => {
        loadBoards();
    }, []);

    const loadBoards = async () => {
        try {
            setLoading(true);
            const data = await boardService.getAllBoards();
            setBoards(data);
        } catch (error) {
            console.error('Error al cargar tableros:', error);
            toast.error('Error al cargar los tableros');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBoard = async () => {
        const title = window.prompt('Ingresa el nombre del nuevo tablero:');

        if (!title || title.trim() === '') {
            return;
        }

        try {
            const newBoard = await boardService.createBoard(title.trim());
            toast.success('¡Tablero creado exitosamente!');

            // Agregar el nuevo tablero a la lista
            setBoards([newBoard, ...boards]);
        } catch (error) {
            console.error('Error al crear tablero:', error);
            toast.error('Error al crear el tablero');
        }
    };

    const handleBoardClick = (boardId) => {
        navigate(`/board/${boardId}`);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando tableros...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Mis Tableros Kanban</h1>
                <div className="user-info">
                    <p>Bienvenido/a, <strong>{user?.fullName || user?.email}</strong></p>
                    <button onClick={logout} className="btn-logout">
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="boards-header">
                    <h2>Tableros</h2>
                    <button onClick={handleCreateBoard} className="btn-create">
                        + Crear Nuevo Tablero
                    </button>
                </div>

                {boards.length === 0 ? (
                    <div className="empty-state">
                        <p>No tienes tableros todavía.</p>
                        <p>¡Crea tu primer tablero para comenzar!</p>
                    </div>
                ) : (
                    <div className="boards-grid">
                        {boards.map((board) => (
                            <div
                                key={board.id}
                                className="board-card"
                                onClick={() => handleBoardClick(board.id)}
                            >
                                <h3>{board.title}</h3>
                                <div className="board-meta">
                                    <span className="board-columns">
                                        {board.columns?.length || 0} columnas
                                    </span>
                                    <span className="board-date">
                                        {new Date(board.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
