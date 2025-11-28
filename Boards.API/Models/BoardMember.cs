namespace Boards.API.Models;

public class BoardMember
{
    public Guid BoardId { get; set; }
    public Guid UserId { get; set; }
    public bool IsMember { get; set; } = true; // true = member, false = left
}
