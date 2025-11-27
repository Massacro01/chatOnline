using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Tasks.API.Data;
using Tasks.API.Hubs;
using Tasks.API.Models;

namespace Tasks.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly TasksDbContext _context;
    private readonly IHubContext<ChatHub> _hubContext;

    public MessagesController(TasksDbContext context, IHubContext<ChatHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    /// <summary>
    /// Obtiene todos los mensajes de un grupo (tablero/sala) ordenados por fecha.
    /// </summary>
    [HttpGet("group/{groupId}")]
    public async Task<IActionResult> GetMessagesByGroup(Guid groupId)
    {
        var messages = await _context.Messages
            .Where(m => m.BoardId == groupId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        return Ok(messages);
    }

    /// <summary>
    /// Crea un nuevo mensaje y lo envía en tiempo real al grupo correspondiente.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateMessage([FromBody] CreateMessageDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // 1. Debugging de Claims: imprimir todo lo que llega en el token
            Console.WriteLine("=== Claims del usuario autenticado ===");
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"{claim.Type} = {claim.Value}");
            }
            Console.WriteLine("======================================");

            // 2. Extracción robusta del ID de usuario
            string? userIdRaw =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(userIdRaw) || !Guid.TryParse(userIdRaw, out Guid senderId))
            {
                return BadRequest(new { message = "No se pudo identificar al usuario (sin NameIdentifier/sub válido)" });
            }

            // 3. Extracción del nombre del usuario
            string senderName =
                User.FindFirst(ClaimTypes.Name)?.Value
                ?? User.FindFirst(ClaimTypes.GivenName)?.Value
                ?? "Usuario Desconocido";

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

            // Notificación en tiempo real vía SignalR
            await _hubContext.Clients
                .Group(dto.GroupId.ToString())
                .SendAsync("ReceiveMessage", message);

            return Ok(message);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error en CreateMessage:");
            Console.WriteLine(ex.ToString());

            return StatusCode(500, ex.Message);
        }
    }

    /// <summary>
    /// DTO para crear mensajes de chat.
    /// </summary>
    public class CreateMessageDto
    {
        [Required]
        public Guid GroupId { get; set; }

        [Required]
        [MinLength(1)]
        public string Content { get; set; } = string.Empty;
    }
}
