using System.ComponentModel.DataAnnotations;

namespace Tasks.API.DTOs;

public class CreateTaskDto
{
    [Required(ErrorMessage = "El BoardId es requerido")]
    public Guid BoardId { get; set; }

    [Required(ErrorMessage = "El ColumnId es requerido")]
    public Guid ColumnId { get; set; }

    [Required(ErrorMessage = "El título es requerido")]
    [MinLength(1, ErrorMessage = "El título debe tener al menos 1 caracter")]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int Order { get; set; } = 0;
}
