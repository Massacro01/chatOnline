using Boards.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Boards.API.Data;

public class BoardsDbContext : DbContext
{
    public BoardsDbContext(DbContextOptions<BoardsDbContext> options) : base(options)
    {
    }

    public DbSet<Board> Boards => Set<Board>();
    public DbSet<BoardColumn> Columns => Set<BoardColumn>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración de Board
        modelBuilder.Entity<Board>(entity =>
        {
            entity.ToTable("brd_boards");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.OwnerId).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();

            // Relación con columnas
            entity.HasMany(e => e.Columns)
                  .WithOne()
                  .HasForeignKey(c => c.BoardId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configuración de BoardColumn
        modelBuilder.Entity<BoardColumn>(entity =>
        {
            entity.ToTable("brd_columns");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.BoardId).IsRequired();
            entity.Property(e => e.Order).IsRequired();
        });
    }
}
