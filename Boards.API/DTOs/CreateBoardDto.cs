using System.ComponentModel.DataAnnotations;

namespace Boards.API.DTOs;

public class CreateBoardDto
{
    [Required(ErrorMessage = "El título es requerido")]
    [MinLength(3, ErrorMessage = "El título debe tener al menos 3 caracteres")]
    public string Title { get; set; } = string.Empty;
}
