import React from 'react';
import '../styles/DateSeparator.css';

const DateSeparator = ({ date }) => {
    const formatDate = (separatorDate) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const messageDate = new Date(separatorDate);

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Hoy';
        }
        if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        }
        // Formato: Lunes, 1 de enero
        return messageDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    };

    return (
        <div className="date-separator-container">
            <div className="date-separator-badge">{formatDate(date)}</div>
        </div>
    );
};

export default DateSeparator;
