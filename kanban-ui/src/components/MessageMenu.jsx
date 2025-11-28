import React from 'react';
import PropTypes from 'prop-types';
import '../styles/MessageMenu.css';

const MessageMenu = ({ onEdit, onDelete }) => {
    return (
        <div className="message-menu-container">
            <ul className="message-menu-list">
                <li onClick={onEdit}>Editar</li>
                <li onClick={onDelete} className="delete-option">Eliminar</li>
            </ul>
        </div>
    );
};

MessageMenu.propTypes = {
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default MessageMenu;
