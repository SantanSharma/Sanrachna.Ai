using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sanrachna.Ai.Models.Entities;

namespace Sanrachna.Ai.Data.Configurations;

public class UserApplicationConfiguration : IEntityTypeConfiguration<UserApplication>
{
    public void Configure(EntityTypeBuilder<UserApplication> builder)
    {
        builder.ToTable("UserApplications");

        builder.HasKey(ua => ua.Id);

        builder.Property(ua => ua.GrantedAt)
            .HasDefaultValueSql("(UTC_TIMESTAMP())");

        // Unique constraint on UserId and ApplicationId
        builder.HasIndex(ua => new { ua.UserId, ua.ApplicationId })
            .IsUnique()
            .HasDatabaseName("UQ_UserApplications_UserApp");

        // Indexes
        builder.HasIndex(ua => ua.UserId)
            .HasDatabaseName("IX_UserApplications_UserId");

        builder.HasIndex(ua => ua.ApplicationId)
            .HasDatabaseName("IX_UserApplications_ApplicationId");

        // Relationships
        builder.HasOne(ua => ua.User)
            .WithMany(u => u.UserApplications)
            .HasForeignKey(ua => ua.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ua => ua.Application)
            .WithMany(a => a.UserApplications)
            .HasForeignKey(ua => ua.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ua => ua.GrantedByUser)
            .WithMany()
            .HasForeignKey(ua => ua.GrantedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
