/**
 * Compara si dos fechas corresponden al mismo día (ignora la hora).
 * @param {Date} d1 - Primera fecha
 * @param {Date} d2 - Segunda fecha
 * @returns {boolean} - True si son el mismo día
 */
const isSameDay = (d1, d2) => {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

/**
 * Procesa una lista de mensajes y añade separadores de fecha entre ellos.
 * @param {Array} messages - Lista de mensajes, cada uno con una propiedad `sentAt`.
 * @returns {Array} - Un nuevo array con mensajes y objetos separadores.
 */
export const groupMessagesByDate = (messages) => {
    if (!messages || messages.length === 0) {
        return [];
    }

    const grouped = [];
    let lastDate = null;

    messages.forEach((message) => {
        const messageDate = new Date(message.sentAt);

        // Si no hay fecha anterior o el día es diferente, añadir separador
        if (!lastDate || !isSameDay(lastDate, messageDate)) {
            grouped.push({ type: 'date-separator', date: message.sentAt, id: `sep-${message.sentAt}` });
            lastDate = messageDate;
        }

        // Añadir el mensaje original
        grouped.push({ type: 'message', ...message });
    });

    return grouped;
};
