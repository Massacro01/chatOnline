import PropTypes from 'prop-types';
import '../styles/ChatLayout.css';
import { getAvatarColor, getInitial } from '../utils/avatarUtils';

/**
 * MessageBubble - Componente de burbuja de mensaje estilo WhatsApp
 * Muestra mensajes con formato diferenciado para propios y ajenos
 */
import { useState } from 'react';
import chatService from '../services/chatService';
import MessageMenu from './MessageMenu'; // Importar el menú

const MessageBubble = ({ message, currentUserId = null, onEdit, onDelete }) => {
    const isOwn = currentUserId && message.senderId === currentUserId;

    // Formatear solo la hora (HH:mm)
    const formatTime = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        } catch {
            return '';
        }
    };

    const time = formatTime(message.sentAt);

    const reactions = message.reactions ? JSON.parse(message.reactions) : {};
    const reactionEntries = Object.entries(reactions);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleReact = async () => {
        try {
            // Por ahora, reaccionamos siempre con un corazón ❤️
            await chatService.reactToMessage(message.id, currentUserId, '❤️');
        } catch (error) {
            console.error("Error al reaccionar:", error);
        }
    };

    return (
            <div className={`message-row ${isOwn ? 'own' : 'other'}`}>
                {!isOwn && (
                    <div
                        className="chat-avatar"
                        style={{ width: 36, height: 36, marginRight: 8, backgroundColor: getAvatarColor(message.senderName) }}
                        title={message.senderName}
                    >
                        {getInitial(message.senderName)}
                    </div>
                )}

                <div className={`message-bubble ${isOwn ? 'own-bubble' : 'other-bubble'}`}>
                {/* Mostrar nombre del remitente solo en mensajes de otros */}
                {!isOwn && (
                    <div className="message-sender">{message.senderName}</div>
                )}

                {/* Contenido del mensaje */}
                <div className="message-content">{message.content}</div>

                {/* Hora en la esquina inferior derecha */}
                <div className="message-time">{time}</div>

                {/* Panel de acciones unificado (estilo WhatsApp) */}
                <div className="message-actions">
                    <button className="message-action-btn" onClick={handleReact} title="Reaccionar">
                        🙂
                    </button>
                    {isOwn && (
                        <button className="message-action-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} title="Menú">
                            ▼
                        </button>
                    )}
                </div>

                {/* Renderizar el menú si está abierto */}
                {isMenuOpen && (
                    <MessageMenu 
                        onEdit={() => { onEdit(message); setIsMenuOpen(false); }} 
                        onDelete={() => { onDelete(message); setIsMenuOpen(false); }} 
                    />
                )}
            </div>

            {/* Mostrar reacciones si existen */}
            {reactionEntries.length > 0 && (
                <div className="message-reactions-container">
                    {reactionEntries.map(([userId, emoji]) => (
                        <span key={userId} className="reaction-emoji">{emoji}</span>
                    ))}
                    <span className="reaction-count">{reactionEntries.length}</span>
                </div>
            )}
        </div>
    );
};

MessageBubble.propTypes = {
    message: PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        senderId: PropTypes.string.isRequired,
        senderName: PropTypes.string.isRequired,
        sentAt: PropTypes.string.isRequired,
    }).isRequired,
    currentUserId: PropTypes.string,
};


export default MessageBubble;

