using Boards.API.Data;
using Boards.API.DTOs;
using Boards.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Boards.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BoardsController : ControllerBase
{
    private readonly BoardsDbContext _context;

    public BoardsController(BoardsDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBoards()
    {
        // ✅ CAMBIO: Ahora lista TODOS los grupos (públicos)
        // Eliminado el filtro .Where(b => b.OwnerId == userId)
        // para que todos los usuarios vean todos los grupos disponibles
        
        var boards = await _context.Boards
            .Include(b => b.Columns.OrderBy(c => c.Order))
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return Ok(boards);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBoardById(Guid id)
    {
        // ✅ CAMBIO: Eliminado el filtro de OwnerId
        // Ahora cualquier usuario autenticado puede ver cualquier grupo
        
        var board = await _context.Boards
            .Include(b => b.Columns.OrderBy(c => c.Order))
            .FirstOrDefaultAsync(b => b.Id == id);

        if (board == null)
        {
            return NotFound(new { message = "Tablero no encontrado" });
        }

        return Ok(board);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBoard([FromBody] CreateBoardDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        // Obtener el ID del usuario desde el token JWT
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
        {
            return Unauthorized(new { message = "Usuario no autenticado" });
        }

        // Crear el nuevo tablero
        var newBoard = new Board
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            OwnerId = userId,
            CreatedAt = DateTime.UtcNow,
            Columns = new List<BoardColumn>
            {
                new BoardColumn { Id = Guid.NewGuid(), Name = "To Do", Order = 1 },
                new BoardColumn { Id = Guid.NewGuid(), Name = "In Progress", Order = 2 },
                new BoardColumn { Id = Guid.NewGuid(), Name = "Done", Order = 3 }
            }
        };

        // Asignar el BoardId a cada columna
        foreach (var column in newBoard.Columns)
        {
            column.BoardId = newBoard.Id;
        }

        _context.Boards.Add(newBoard);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBoards), new { id = newBoard.Id }, newBoard);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBoard(Guid id)
    {
        var board = await _context.Boards.FirstOrDefaultAsync(b => b.Id == id);
        if (board == null)
        {
            return NotFound(new { message = "Tablero no encontrado" });
        }

        // Sólo el propietario puede eliminar su tablero
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
        {
            return Unauthorized(new { message = "Usuario no autenticado" });
        }

        if (board.OwnerId != userId)
        {
            return Forbid();
        }

        // Eliminar columnas relacionadas primero (si hay FK con cascade, esto puede omitirse)
        var columns = _context.Columns.Where(c => c.BoardId == board.Id);
        _context.Columns.RemoveRange(columns);

        _context.Boards.Remove(board);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
