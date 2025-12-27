using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sanrachna.Ai.Models.Entities;

namespace Sanrachna.Ai.Data.Configurations;

public class UserSessionConfiguration : IEntityTypeConfiguration<UserSession>
{
    public void Configure(EntityTypeBuilder<UserSession> builder)
    {
        builder.ToTable("UserSessions");

        builder.HasKey(us => us.Id);

        builder.Property(us => us.SessionToken)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(us => us.DeviceInfo)
            .HasMaxLength(255);

        builder.Property(us => us.IpAddress)
            .HasMaxLength(50);

        builder.Property(us => us.UserAgent)
            .HasMaxLength(500);

        builder.Property(us => us.CreatedAt)
            .HasDefaultValueSql("(UTC_TIMESTAMP())");

        builder.Property(us => us.ExpiresAt)
            .IsRequired();

        builder.Property(us => us.IsActive)
            .HasDefaultValue(true);

        // Indexes
        builder.HasIndex(us => us.UserId)
            .HasDatabaseName("IX_UserSessions_UserId");

        builder.HasIndex(us => us.SessionToken)
            .HasDatabaseName("IX_UserSessions_SessionToken");

        builder.HasIndex(us => new { us.IsActive, us.ExpiresAt })
            .HasDatabaseName("IX_UserSessions_IsActive");
    }
}
