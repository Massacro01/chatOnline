using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using Tasks.API.Data;
using Tasks.API.Models;

namespace Tasks.API.Hubs;

[Authorize]
public class KanbanHub : Hub
{
    private readonly TasksDbContext _context;

    public KanbanHub(TasksDbContext context)
    {
        _context = context;
    }

    /// <param name="groupId">ID del grupo/sala al que se unirá el usuario</param>
    public async Task JoinGroup(string groupId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupId);

        await Clients.Group(groupId).SendAsync("UserJoined", new
        {
            userId = Context.UserIdentifier,
            groupId,
            timestamp = DateTime.UtcNow
        });
    }

    // Alias para mantener compatibilidad si el frontend aún llama a JoinBoard
    public Task JoinBoard(string boardId) => JoinGroup(boardId);
    public async Task LeaveGroup(string groupId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);

        await Clients.Group(groupId).SendAsync("UserLeft", new
        {
            userId = Context.UserIdentifier,
            groupId,
            timestamp = DateTime.UtcNow
        });
    }

    // Alias de compatibilidad
    public Task LeaveBoard(string boardId) => LeaveGroup(boardId);

    public async Task SendMessage(Guid groupId, string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return;
        }

        // Obtener información del usuario que envía el mensaje
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid senderId))
        {
            // Si no hay usuario autenticado, no enviamos nada
            return;
        }

        var senderName =
            Context.User?.Identity?.Name
            ?? Context.User?.FindFirst("name")?.Value
            ?? Context.User?.FindFirst("unique_name")?.Value
            ?? "Usuario";

        var message = new Message
        {
            Id = Guid.NewGuid(),
            BoardId = groupId,
            Content = content,
            SenderId = senderId,
            SenderName = senderName,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        // Emitir el mensaje a todos en el grupo
        await Clients.Group(groupId.ToString())
            .SendAsync("ReceiveMessage", message);
    }

    public async Task Typing(Guid groupId)
    {
        var senderName =
            Context.User?.Identity?.Name
            ?? Context.User?.FindFirst("name")?.Value
            ?? Context.User?.FindFirst("unique_name")?.Value
            ?? "Usuario";

        await Clients.Group(groupId.ToString())
            .SendAsync("UserTyping", senderName);
    }
}
