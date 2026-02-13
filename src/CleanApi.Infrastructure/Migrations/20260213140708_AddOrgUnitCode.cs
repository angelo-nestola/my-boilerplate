using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CleanApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrgUnitCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "OrgUnits",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_OrgUnits_Code",
                table: "OrgUnits",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OrgUnits_Code",
                table: "OrgUnits");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "OrgUnits");
        }
    }
}
