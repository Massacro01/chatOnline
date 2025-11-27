using Auth.API.Data;
using Auth.API.DTOs;
using Auth.API.Models;
using Auth.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Auth.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthDbContext _context;
    private readonly JwtTokenService _jwtService;

    public AuthController(AuthDbContext context, JwtTokenService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        // Validar si el modelo es válido
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Validar fortaleza de la contraseña
        var (isValid, errorMessage) = PasswordValidator.Validate(dto.Password);
        if (!isValid)
        {
            return BadRequest(new { message = errorMessage });
        }

        // Verificar si el email ya existe
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

        if (existingUser != null)
        {
            return BadRequest(new { message = "El email ya está registrado" });
        }

        // Hashear la contraseña con BCrypt
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        // Crear el nuevo usuario
        var newUser = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            PasswordHash = passwordHash,
            FullName = dto.FullName
        };

        // Guardar en la base de datos
        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Usuario registrado exitosamente", userId = newUser.Id });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // Validar si el modelo es válido
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Buscar el usuario por email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

        if (user == null)
        {
            return Unauthorized(new { message = "Credenciales inválidas" });
        }

        // Verificar la contraseña
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

        if (!isPasswordValid)
        {
            return Unauthorized(new { message = "Credenciales inválidas" });
        }

        // Generar el token JWT
        var token = _jwtService.GenerateToken(user.Id, user.Email, user.FullName);

        return Ok(new
        {
            message = "Login exitoso",
            token = token,
            user = new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName
            }
        });
    }
}
