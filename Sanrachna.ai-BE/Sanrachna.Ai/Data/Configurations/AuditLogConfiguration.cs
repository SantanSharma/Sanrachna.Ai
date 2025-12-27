using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sanrachna.Ai.Models.Entities;

namespace Sanrachna.Ai.Data.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(al => al.Id);

        builder.Property(al => al.Action)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(al => al.EntityType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(al => al.OldValues)
            .HasColumnType("LONGTEXT");

        builder.Property(al => al.NewValues)
            .HasColumnType("LONGTEXT");

        builder.Property(al => al.IpAddress)
            .HasMaxLength(50);

        builder.Property(al => al.UserAgent)
            .HasMaxLength(500);

        builder.Property(al => al.Timestamp)
            .HasDefaultValueSql("(UTC_TIMESTAMP())");

        // Indexes
        builder.HasIndex(al => al.UserId)
            .HasDatabaseName("IX_AuditLogs_UserId");

        builder.HasIndex(al => al.EntityType)
            .HasDatabaseName("IX_AuditLogs_EntityType");

        builder.HasIndex(al => al.Timestamp)
            .IsDescending()
            .HasDatabaseName("IX_AuditLogs_Timestamp");

        builder.HasIndex(al => new { al.Action, al.Timestamp })
            .IsDescending(false, true)
            .HasDatabaseName("IX_AuditLogs_Action");

        // Relationships
        builder.HasOne(al => al.User)
            .WithMany()
            .HasForeignKey(al => al.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
