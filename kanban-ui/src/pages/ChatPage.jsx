import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import Picker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import chatService from '../services/chatService';
import signalrService from '../services/signalrService';
import MessageBubble from '../components/MessageBubble';
import DateSeparator from '../components/DateSeparator'; // <-- 1. Importar componente
import { groupMessagesByDate } from '../utils/chatUtils'; // <-- 2. Importar función
import ChatSidebar from '../components/ChatSidebar';
import boardService from '../services/boardService';
import '../styles/ChatLayout.css';

/**
 * ChatPage - Página principal estilo WhatsApp Web
 * Layout horizontal: Sidebar (30%) + Chat Area (70%)
 * 
 * FIXES IMPLEMENTADOS:
 * ✅ Bug de SignalR: Usa setMessages((prev) => ...) para inmutabilidad
 * ✅ Auto-scroll al final cuando llegan nuevos mensajes
 * ✅ Limpieza de mensajes al cambiar de grupo
 */
const ChatPage = () => {
    const { id } = useParams(); // ID del grupo/tablero activo
    const [board, setBoard] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isTyping, setIsTyping] = useState(null);
    const [connectionState, setConnectionState] = useState('Disconnected');
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);

    // <-- 3. Procesar mensajes para agruparlos (usando useMemo para eficiencia)
    const processedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);
    const typingTimeoutRef = useRef(null);

    // Detect mobile breakpoint to hide sidebar / show back button
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const currentUserId = getCurrentUserId();
    const navigate = useNavigate();

    // ============================================
    // EFFECT 1: Cargar datos cuando cambia el ID
    // ============================================
    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const init = async () => {
            try {
                setLoading(true);

                // IMPORTANTE: Limpiar mensajes anteriores primero
                // Esto evita ver mensajes del grupo anterior por un instante
                setMessages([]);

                // Cargar datos del grupo (reutilizamos Board como grupo de chat)
                const boardData = await boardService.getBoardById(id);
                setBoard(boardData);

                // Cargar historial de mensajes del grupo
                const history = await chatService.getHistory(id);
                setMessages(history);

                // Iniciar SignalR y unirse al grupo
                await signalrService.startConnection();
                setConnectionState('Connected');
                await signalrService.joinGroup(id);

                // ============================================
                // FIX CRÍTICO: Suscripción a nuevos mensajes
                // ============================================
                // ANTES (INCORRECTO): setMessages([...messages, newMessage])
                // PROBLEMA: Capturaba el estado "viejo" de messages
                //
                // AHORA (CORRECTO): Usa función de actualización
                signalrService.onReceiveMessage((newMessage) => {
                    console.log('📬 Mensaje recibido en vivo:', newMessage);

                    setMessages((prevMessages) => {
                        // Evitar duplicados (el backend podría enviar el mismo mensaje)
                        const exists = prevMessages.some((m) => m.id === newMessage.id);
                        if (exists) {
                            return prevMessages; // No modificar si ya existe
                        }

                        // Agregar el nuevo mensaje inmutablemente
                        return [...prevMessages, newMessage];
                    });
                });

                // Suscribirse a eventos de "usuario escribiendo"
                // Suscribirse a eventos de reacciones
                signalrService.onMessageReacted((data) => {
                    setMessages((prevMessages) => 
                        prevMessages.map(msg => 
                            msg.id === data.messageId 
                                ? { ...msg, reactions: JSON.stringify(data.reactions) } 
                                : msg
                        )
                    );
                });

                // Suscribirse a eventos de actualización y borrado
                signalrService.onMessageUpdated((data) => {
                    setMessages((prev) => 
                        prev.map(m => m.id === data.id ? { ...m, content: data.content } : m)
                    );
                });

                signalrService.onMessageDeleted((data) => {
                    setMessages((prev) => prev.filter(m => m.id !== data.messageId));
                });

                // Suscribirse a eventos de "usuario escribiendo"
                signalrService.onUserTyping((userName) => {
                    setIsTyping(userName);

                    // Limpiar timeout anterior si existe
                    if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                    }

                    // Ocultar indicador después de 3 segundos
                    typingTimeoutRef.current = setTimeout(() => {
                        setIsTyping(null);
                    }, 3000);
                });
            } catch (error) {
                console.error('❌ Error al inicializar chat:', error);
                setConnectionState('Error');
                toast.error('No se pudo conectar al chat');
            } finally {
                setLoading(false);
            }
        };

        init();

        // ✅ Cleanup: Salir del grupo y limpiar listeners cuando se desmonta o cambia el ID
        return () => {
            if (id) {
                console.log('🧹 Limpiando listeners para grupo:', id);
                signalrService.leaveGroup(id);
                signalrService.offReceiveMessage();
                signalrService.offUserTyping();
                signalrService.offMessageReacted();
                signalrService.offMessageUpdated();
                signalrService.offMessageDeleted();
            }
        };
    }, [id]); // Se ejecuta cuando cambia el ID

    // ============================================
    // EFFECT 2: Auto-scroll al final
    // ============================================
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]); // Se ejecuta cada vez que cambian los mensajes

    // ============================================
    // HANDLERS
    // ============================================
    const handleSendMessage = async (e) => {
        e.preventDefault();

        const content = newMessage.trim();
        if (!content) return;

        try {
            await chatService.sendMessage(id, content);
            setNewMessage('');
        } catch (error) {
            console.error('❌ Error al enviar mensaje:', error);
            toast.error('No se pudo enviar el mensaje');
        }
    };

    const handleEditMessage = async (message) => {
        const newContent = prompt("Edita tu mensaje:", message.content);
        if (newContent && newContent.trim() !== message.content) {
            try {
                await chatService.editMessage(message.id, newContent.trim(), currentUserId);
            } catch (error) {
                toast.error("No se pudo editar el mensaje.");
            }
        }
    };

    const handleDeleteMessage = async (message) => {
        if (window.confirm("¿Estás seguro de que quieres borrar este mensaje?")) {
            try {
                await chatService.deleteMessage(message.id, currentUserId);
            } catch (error) {
                toast.error("No se pudo borrar el mensaje.");
            }
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setNewMessage(value);

        // Enviar evento "typing" si hay contenido
        if (value.trim()) {
            signalrService.sendTyping(id);
        }
    };

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    // ============================================
    // RENDERS CONDICIONALES
    // ============================================
    if (loading) {
        return (
            <div className="chat-layout">
                <ChatSidebar activeGroupId={id} hiddenOnMobile={false} />
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando chat...</p>
                </div>
            </div>
        );
    }

    // Si no hay ID, mostrar pantalla vacía
    if (!id) {
        return (
            <div className="chat-layout">
                <ChatSidebar activeGroupId={null} hiddenOnMobile={false} />
                <div className="empty-chat-area">
                    <div style={{ fontSize: '100px' }}>💬</div>
                    <h2>KanbanApp Chat</h2>
                    <p>
                        Selecciona un grupo de la lista para comenzar a chatear.
                        <br />
                        O crea uno nuevo haciendo clic en el botón <strong>+</strong>
                    </p>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER PRINCIPAL - LAYOUT WHATSAPP
    // ============================================
    return (
        <div className="chat-layout">
            {/* SIDEBAR (30%) - Lista de grupos */}
            <ChatSidebar activeGroupId={id} hiddenOnMobile={isMobile && !!id} />

            {/* CHAT AREA (70%) - Mensajes e input */}
            <div className="chat-area">
                {/* Header del chat */}
                <div className="chat-header">
                    <div className="chat-header-left">
                        {isMobile && (
                            <button className="back-btn" onClick={() => navigate('/')}>←</button>
                        )}
                        <div className="chat-header-avatar">
                            {board ? getInitial(board.title) : '?'}
                        </div>
                        <div className="chat-header-info">
                            <h2>{board ? board.title : 'Cargando...'}</h2>
                            <div className="chat-header-status">
                                {isTyping ? (
                                    <span>{isTyping} está escribiendo...</span>
                                ) : (
                                    <span>{messages.length} mensajes</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Indicador de conexión */}
                    <div className={`connection-badge ${connectionState.toLowerCase()}`}>
                        <span className="connection-dot"></span>
                        <span>{connectionState}</span>
                    </div>
                </div>

                {/* Área de mensajes */}
                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            color: '#667781',
                            marginTop: '40px',
                            fontSize: '14px'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                            <p>No hay mensajes aún</p>
                            <p>Envía el primer mensaje para comenzar</p>
                        </div>
                    ) : (
                        processedMessages.map((item) => {
                            if (item.type === 'date-separator') {
                                return <DateSeparator key={item.id} date={item.date} />;
                            }
                            return (
                                <MessageBubble
                                    key={item.id}
                                    message={item}
                                    currentUserId={currentUserId}
                                    onEdit={handleEditMessage}
                                    onDelete={handleDeleteMessage}
                                />
                            );
                        })
                    )}

                    {/* Indicador de "usuario escribiendo" */}
                    {isTyping && (
                        <div className="typing-indicator">
                            {isTyping} está escribiendo...
                        </div>
                    )}

                    {/* Referencia para auto-scroll */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer - Input para escribir mensaje */}
                <form className="chat-footer" onSubmit={handleSendMessage}>
                    <div style={{ position: 'relative' }}>
                        <button
                            type="button"
                            className="emoji-btn"
                            onClick={() => setShowEmojiPicker((s) => !s)}
                            title="Emojis"
                        >
                            😊
                        </button>
                        {showEmojiPicker && (
                            <div style={{ position: 'absolute', bottom: '54px', left: 0, zIndex: 60 }}>
                                <Picker
                                    onEmojiClick={(emojiData) => {
                                        const emoji = emojiData?.emoji || (emojiData?.unified ? String.fromCodePoint(...emojiData.unified.split('-').map(u=>parseInt(u,16))) : '');
                                        setNewMessage((prev) => prev + emoji);
                                        setShowEmojiPicker(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChange={handleInputChange}
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className="chat-send-btn"
                        disabled={!newMessage.trim()}
                        title="Enviar mensaje"
                    >
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
};

/**
 * Función auxiliar para obtener el ID del usuario actual desde el JWT
 */
function getCurrentUserId() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const [, payload] = token.split('.');
        if (!payload) return null;

        const json = JSON.parse(atob(payload));
        // El claim puede ser nameid, sub, userId, etc.
        return json.nameid || json.sub || json.userId || null;
    } catch {
        return null;
    }
}

export default ChatPage;
