using System.Text.RegularExpressions;

namespace Auth.API.Services;

public class PasswordValidator
{
    public static (bool IsValid, string ErrorMessage) Validate(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            return (false, "La contraseña es requerida");
        }

        if (password.Length < 8)
        {
            return (false, "La contraseña debe tener al menos 8 caracteres");
        }

        if (!Regex.IsMatch(password, @"[A-Z]"))
        {
            return (false, "La contraseña debe contener al menos una letra mayúscula");
        }

        if (!Regex.IsMatch(password, @"[a-z]"))
        {
            return (false, "La contraseña debe contener al menos una letra minúscula");
        }

        if (!Regex.IsMatch(password, @"[0-9]"))
        {
            return (false, "La contraseña debe contener al menos un número");
        }

        if (!Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]"))
        {
            return (false, "La contraseña debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{};':\"\\|,.<>/?)");
        }

        return (true, string.Empty);
    }
}
