namespace Boards.API.Models;

public class Board
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Relación con columnas
    public List<BoardColumn> Columns { get; set; } = new();
}
