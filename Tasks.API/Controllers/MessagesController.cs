using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Tasks.API.Data;
using Tasks.API.Hubs;
using Tasks.API.Models;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace Tasks.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly TasksDbContext _context;
    private readonly IHubContext<KanbanHub> _hubContext;

    public MessagesController(TasksDbContext context, IHubContext<KanbanHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public record ReactionRequest(Guid UserId, string Emoji);

    [HttpPost("{id:guid}/react")]
    public async Task<IActionResult> ReactToMessage(Guid id, [FromBody] ReactionRequest request)
    {
        var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == id);

        if (message == null)
        {
            return NotFound("Message not found.");
        }

        if (request == null)
        {
            return BadRequest("Request body is required.");
        }

        if (string.IsNullOrEmpty(request.Emoji))
        {
            return BadRequest("Emoji is required.");
        }

        var reactions = !string.IsNullOrEmpty(message.Reactions) 
            ? JsonSerializer.Deserialize<Dictionary<Guid, string>>(message.Reactions)
            : new Dictionary<Guid, string>();

        if (reactions == null) 
        {
            reactions = new Dictionary<Guid, string>();
        }

        // Comportamiento de Toggle: si el usuario ya reaccionó con el mismo emoji, se quita la reacción.
        if (reactions.ContainsKey(request.UserId) && reactions[request.UserId] == request.Emoji)
        {
            reactions.Remove(request.UserId);
        }
        else
        {
            // Si no ha reaccionado, o reacciona con un emoji diferente, se añade o actualiza.
            reactions[request.UserId] = request.Emoji;
        }

        message.Reactions = JsonSerializer.Serialize(reactions);
        await _context.SaveChangesAsync();

        // Notificar a los clientes en tiempo real
        await _hubContext!.Clients.Group(message.BoardId.ToString()).SendAsync("MessageReacted", new 
        {
            MessageId = message.Id,
            Reactions = reactions
        });

        return Ok(reactions);
    }

    [HttpGet("group/{groupId}")]
    public async Task<IActionResult> GetMessagesByGroup(Guid groupId)
    {
        var messages = await _context.Messages
            .Where(m => m.BoardId == groupId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        return Ok(messages);
    }

    public record CreateMessageDto([Required] Guid GroupId, [Required, MinLength(1)] string Content);

    [HttpPost]
    public async Task<IActionResult> CreateMessage([FromBody] CreateMessageDto dto)
    {
        string? userIdRaw = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User?.FindFirst("sub")?.Value;
        if (!Guid.TryParse(userIdRaw, out Guid senderId)){
            return Unauthorized();
        }

        string senderName =
            User?.Identity?.Name
            ?? User?.FindFirst("name")?.Value
            ?? User?.FindFirst("unique_name")?.Value
            ?? "Usuario";

        var message = new Message
        {
            Id = Guid.NewGuid(),
            BoardId = dto.GroupId,
            Content = dto.Content,
            SenderId = senderId,
            SenderName = senderName,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        await _hubContext!.Clients.Group(dto.GroupId.ToString()).SendAsync("ReceiveMessage", message);

        return Ok(message);
    }

    public record EditMessageRequest(string NewContent, Guid UserId);

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> EditMessage(Guid id, [FromBody] EditMessageRequest request)
    {
        var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == id);

        if (message == null) return NotFound();

        // Validación: Solo el autor puede editar
        if (message.SenderId != request.UserId)
        {
            return Forbid();
        }

        message.Content = request.NewContent;
        await _context.SaveChangesAsync();

        await _hubContext!.Clients.Group(message.BoardId.ToString()).SendAsync("MessageUpdated", new { message.Id, message.Content });

        return Ok(message);
    }

    public record DeleteMessageRequest(Guid UserId);

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteMessage(Guid id, [FromBody] DeleteMessageRequest request)
    {
        var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == id);

        if (message == null) return NotFound();

        // Validación: Solo el autor puede borrar
        if (message.SenderId != request.UserId)
        {
            return Forbid();
        }

        _context.Messages.Remove(message);
        await _context.SaveChangesAsync();

        await _hubContext!.Clients.Group(message.BoardId.ToString()).SendAsync("MessageDeleted", new { MessageId = id, BoardId = message.BoardId });

        return NoContent();
    }
}
