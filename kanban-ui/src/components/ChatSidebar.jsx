import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import boardService from '../services/boardService';
import { toast } from 'react-toastify';
import signalrService from '../services/signalrService';
import '../styles/ChatLayout.css';
import { getAvatarColor, getInitial } from '../utils/avatarUtils';
import { useAuth } from '../context/AuthContext';

/**
 * ChatSidebar - Componente de barra lateral estilo WhatsApp
 * Muestra la lista de grupos/tableros disponibles
 * ACTUALIZACIÓN EN TIEMPO REAL cuando se crean nuevos grupos
 */
const ChatSidebar = ({ activeGroupId = null, hiddenOnMobile = false }) => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadGroups();
        setupRealtimeUpdates();
    }, []);

    const loadGroups = async () => {
        try {
            setLoading(true);
            const boards = await boardService.getAllBoards();
            setGroups(boards);
        } catch (error) {
            console.error('Error al cargar grupos:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * NUEVO: Configurar actualización en tiempo real
     * Cuando otro usuario crea un grupo, aparece automáticamente aquí
     */
    const setupRealtimeUpdates = async () => {
        try {
            // Conectar a SignalR si no está conectado
            await signalrService.startConnection();

            // Suscribirse al evento de nuevo grupo
            signalrService.onGroupCreated((newGroup) => {
                // Agregar el nuevo grupo al estado (evitar duplicados)
                setGroups((prevGroups) => {
                    const exists = prevGroups.some((g) => g.id === newGroup.id);
                    if (exists) {
                        return prevGroups;
                    }
                    return [newGroup, ...prevGroups]; // Agregar al inicio
                });
            });
        } catch (error) {
            console.error('Error al configurar actualizaciones en tiempo real:', error);
        }
    };

    const handleGroupClick = (groupId) => {
        navigate(`/board/${groupId}`);
    };

    const handleCreateGroup = () => {
        const title = prompt('Nombre del nuevo grupo:');
        if (title && title.trim()) {
            createNewGroup(title.trim());
        }
    };

    const { user } = useAuth();

    const handleDeleteGroup = async (e, group) => {
        e.stopPropagation(); // evitar que el click abra el chat

        if (!window.confirm(`¿Eliminar el chat "${group.title}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            await boardService.deleteBoard(group.id);
            setGroups((prev) => prev.filter((g) => g.id !== group.id));
            toast.success('Chat eliminado');
        } catch (error) {
            console.error('Error al eliminar grupo:', error);
            toast.error('No se pudo eliminar el chat');
        }
    };

    // Funcionalidad de "salirse" removida: no hay persistencia cliente de tableros "abandonados".

    const createNewGroup = async (title) => {
        try {
            const newBoard = await boardService.createBoard(title);
            setGroups([...groups, newBoard]);
            navigate(`/board/${newBoard.id}`);
        } catch (error) {
            console.error('Error al crear grupo:', error);
            alert('No se pudo crear el grupo');
        }
    };

    const filteredGroups = groups.filter((group) =>
        group.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    

    if (loading) {
        return (
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <h2>Cargando...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className={`chat-sidebar ${hiddenOnMobile ? 'mobile-hidden' : ''}`}>
            {/* Header con botón para crear nuevo grupo */}
            <div className="sidebar-header">
                <h2>Chats</h2>
                <button
                    className="btn-new-chat"
                    onClick={handleCreateGroup}
                    title="Nuevo grupo"
                >
                    +
                </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="sidebar-search">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar o comenzar un nuevo chat"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Lista de grupos/chats */}
            <div className="chat-list">
                {filteredGroups.length === 0 ? (
                    <div className="empty-chat-list">
                        <div style={{ fontSize: '64px' }}>💬</div>
                        <h3>Sin conversaciones</h3>
                        <p>Crea un nuevo grupo para comenzar a chatear</p>
                    </div>
                ) : (
                    filteredGroups.map((group) => {
                        // Determinar ownerId con varias posibles convenciones (OwnerId, ownerId, owner_id)
                        const ownerRaw = group.ownerId ?? group.OwnerId ?? group.owner_id ?? null;
                        const currentUserRaw = user?.id ?? null;

                        let isOwner = false;
                        try {
                            // Intentar comparar como GUIDs si es posible
                            if (ownerRaw && currentUserRaw) {
                                const ownerGuid = ownerRaw.toString();
                                const userGuid = currentUserRaw.toString();
                                // Normalizar: quitar llaves y minúsculas
                                const normalize = (s) => s.replace(/\{|\}|\s+/g, '').toLowerCase();
                                if (normalize(ownerGuid) === normalize(userGuid)) {
                                    isOwner = true;
                                }
                            }
                        } catch (err) {
                            // fallback a comparación por string
                            const ownerIdStr = ownerRaw ? String(ownerRaw).toLowerCase() : null;
                            const currentUserId = currentUserRaw ? String(currentUserRaw).toLowerCase() : null;
                            isOwner = ownerIdStr && currentUserId && ownerIdStr === currentUserId;
                        }
                        return (
                            <div
                                key={group.id}
                                className={`chat-item ${activeGroupId === group.id ? 'active' : ''}`}
                                onClick={() => handleGroupClick(group.id)}
                            >
                                <div
                                    className="chat-avatar"
                                    style={{ backgroundColor: getAvatarColor(group.title) }}
                                    title={group.title}
                                >
                                    {getInitial(group.title)}
                                </div>
                                <div className="chat-info">
                                    <h3 className="chat-name">{group.title}</h3>
                                    <p className="chat-last-message">
                                        Haz clic para ver los mensajes
                                    </p>
                                </div>
                                <div style={{ marginLeft: 8 }}>
                                    {isOwner ? (
                                        <button
                                            className="delete-btn"
                                            title={`Eliminar ${group.title}`}
                                            onClick={(e) => handleDeleteGroup(e, group)}
                                        >
                                            ✕
                                        </button>
                                    ) : (
                                        <span style={{ width: 24, display: 'inline-block' }} />
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

ChatSidebar.propTypes = {
    activeGroupId: PropTypes.string,
};


export default ChatSidebar;
