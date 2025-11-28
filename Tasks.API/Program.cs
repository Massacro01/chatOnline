using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Tasks.API.Data;
using Tasks.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// 1. CONFIGURACIÓN DE SQLITE
builder.Services.AddDbContext<TasksDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. CONFIGURACIÓN DE JWT AUTHENTICATION
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };

    // IMPORTANTE: Configuración para que SignalR pueda usar JWT desde query string
    // SignalR envía el token en la query string cuando usa WebSockets
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];

            // Si la petición es para el hub de SignalR
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/kanban"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// 3. CONFIGURACIÓN DE SIGNALR
builder.Services.AddSignalR();

// 4. CONFIGURACIÓN DE CORS (CRÍTICO PARA SIGNALR)
builder.Services.AddCors(options =>
{
    options.AddPolicy("KanbanCorsPolicy", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:3000",
                  "http://localhost:5173") // Puertos de frontends (CRA y Vite)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // IMPRESCINDIBLE para SignalR WebSockets
    });
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// ORDEN CRÍTICO DEL MIDDLEWARE:
// 1. CORS debe ir ANTES de Authentication y Authorization
app.UseCors("KanbanCorsPolicy");

// 2. Authentication y Authorization
app.UseAuthentication();
app.UseAuthorization();

// 3. Map SignalR Hub (chat)
app.MapHub<KanbanHub>("/hubs/kanban");

// 4. Map Controllers
app.MapControllers();

app.Run();

