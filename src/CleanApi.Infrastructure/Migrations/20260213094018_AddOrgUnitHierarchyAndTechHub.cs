using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CleanApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrgUnitHierarchyAndTechHub : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ParentId",
                table: "OrgUnits",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrgUnits_ParentId",
                table: "OrgUnits",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrgUnits_OrgUnits_ParentId",
                table: "OrgUnits",
                column: "ParentId",
                principalTable: "OrgUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrgUnits_OrgUnits_ParentId",
                table: "OrgUnits");

            migrationBuilder.DropIndex(
                name: "IX_OrgUnits_ParentId",
                table: "OrgUnits");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "OrgUnits");
        }
    }
}
