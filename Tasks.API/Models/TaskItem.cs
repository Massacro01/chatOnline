namespace Tasks.API.Models;

public class Message
{
    public Guid Id { get; set; }

    // Reutilizamos BoardId como identificador del grupo/sala de chat
    public Guid BoardId { get; set; }

    public string Content { get; set; } = string.Empty;

    public Guid SenderId { get; set; }

    public string SenderName { get; set; } = string.Empty;

    public DateTime SentAt { get; set; }
}
