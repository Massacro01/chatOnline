import PropTypes from 'prop-types';
import './MessageBubble.css';

const MessageBubble = ({ message, currentUserId }) => {
    const isOwn = currentUserId && message.senderId === currentUserId;

    const time = new Date(message.sentAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className={`message-row ${isOwn ? 'own' : 'other'}`}>
            <div className={`message-bubble ${isOwn ? 'own-bubble' : 'other-bubble'}`}>
                {!isOwn && (
                    <div className="message-sender">{message.senderName}</div>
                )}
                <div className="message-content">{message.content}</div>
                <div className="message-time">{time}</div>
            </div>
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

MessageBubble.defaultProps = {
    currentUserId: null,
};

export default MessageBubble;
