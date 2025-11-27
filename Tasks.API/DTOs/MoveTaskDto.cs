using System.ComponentModel.DataAnnotations;

namespace Tasks.API.DTOs;

public class MoveTaskDto
{
    [Required(ErrorMessage = "El ColumnId de destino es requerido")]
    public Guid TargetColumnId { get; set; }

    [Required(ErrorMessage = "El nuevo orden es requerido")]
    public int NewOrder { get; set; }
}
