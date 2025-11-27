import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import chatService from '../services/chatService';
import signalrService from '../services/signalrService';
import MessageBubble from '../components/MessageBubble';
import boardService from '../services/boardService';
import './BoardPage.css';

const ChatPage = () => {
    const { id } = useParams(); // id del tablero/grupo
    const navigate = useNavigate();

    const [board, setBoard] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(null);
    const [connectionState, setConnectionState] = useState('Disconnected');
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const currentUserId = getCurrentUserId();

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);

                // Cargar datos del "grupo" (reutilizamos Board)
                const boardData = await boardService.getBoardById(id);
                setBoard(boardData);

                // Cargar historial de mensajes
                const history = await chatService.getHistory(id);
                setMessages(history);

                // Iniciar SignalR y unirse al grupo
                await signalrService.startConnection();
                setConnectionState('Connected');
                await signalrService.joinGroup(id);

                // Suscribirse a nuevos mensajes
                signalrService.onReceiveMessage((message) => {
                    setMessages((prev) => {
                        const exists = prev.some((m) => m.id === message.id);
                        return exists ? prev : [...prev, message];
                    });
                });

                // Suscribirse a eventos de typing
                signalrService.onUserTyping((userName) => {
                    setIsTyping(userName);

                    if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                    }

                    typingTimeoutRef.current = setTimeout(() => {
                        setIsTyping(null);
                    }, 3000);
                });
            } catch (error) {
                console.error('Error al inicializar chat:', error);
                setConnectionState('Error');
                toast.error('No se pudo conectar al chat');
            } finally {
                setLoading(false);
            }
        };

        init();

        return () => {
            if (id) {
                signalrService.leaveGroup(id);
            }
        };
    }, [id]);

    // Auto scroll al final cuando cambian los mensajes
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        const content = newMessage.trim();
        if (!content) return;

        try {
            await chatService.sendMessage(id, content);
            setNewMessage('');
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            toast.error('No se pudo enviar el mensaje');
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setNewMessage(value);

        if (value.trim()) {
            signalrService.sendTyping(id);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando chat...</p>
            </div>
        );
    }

    if (!board) {
        return null;
    }

    return (
        <div className="board-page">
            <div className="board-header">
                <div className="header-left">
                    <button onClick={() => navigate('/dashboard')} className="btn-back">
                        ← Volver al Dashboard
                    </button>
                    <h1>{board.title}</h1>
                </div>

                <div className="header-right">
                    <div className={`connection-indicator ${connectionState.toLowerCase()}`}>
                        <span className="indicator-dot"></span>
                        <span className="indicator-text">{connectionState}</span>
                    </div>
                </div>
            </div>

            <div className="chat-body">
                <div className="chat-messages">
                    {messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            currentUserId={currentUserId}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {isTyping && (
                    <div className="typing-indicator">{isTyping} está escribiendo...</div>
                )}
            </div>

            <form className="chat-footer" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={handleInputChange}
                />
                <button type="submit" className="chat-send-btn">
                    Enviar
                </button>
            </form>
        </div>
    );
};

function getCurrentUserId() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const [, payload] = token.split('.');
        if (!payload) return null;

        const json = JSON.parse(atob(payload));
        // Dependiendo de cómo se emita el JWT, puede ser nameid, sub, etc.
        return json.nameid || json.sub || null;
    } catch {
        return null;
    }
}

export default ChatPage;
