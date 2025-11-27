using Microsoft.EntityFrameworkCore;
using Tasks.API.Models;

namespace Tasks.API.Data;

public class TasksDbContext : DbContext
{
    public TasksDbContext(DbContextOptions<TasksDbContext> options) : base(options)
    {
    }

    // Ahora representa mensajes de chat
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración de Message (tabla de mensajes de chat)
        modelBuilder.Entity<Message>(entity =>
        {
            entity.ToTable("msg_messages");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.BoardId).IsRequired();
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.SenderId).IsRequired();
            entity.Property(e => e.SenderName).IsRequired();
            entity.Property(e => e.SentAt).IsRequired();
        });
    }
}
