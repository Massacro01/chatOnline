using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tasks.API.Migrations
{
    /// <inheritdoc />
    public partial class AddReactionsToMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Reactions",
                table: "msg_messages",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Reactions",
                table: "msg_messages");
        }
    }
}
