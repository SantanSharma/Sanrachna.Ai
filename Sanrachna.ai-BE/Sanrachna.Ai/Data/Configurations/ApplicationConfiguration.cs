using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sanrachna.Ai.Models.Entities;

namespace Sanrachna.Ai.Data.Configurations;

public class ApplicationConfiguration : IEntityTypeConfiguration<Application>
{
    public void Configure(EntityTypeBuilder<Application> builder)
    {
        builder.ToTable("Applications");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.Url)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.Icon)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("apps");

        builder.Property(a => a.IconColor)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("bg-blue-500");

        builder.Property(a => a.Category)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("Other");

        builder.Property(a => a.IsSupported)
            .HasDefaultValue(true);

        builder.Property(a => a.RequiresAuth)
            .HasDefaultValue(true);

        builder.Property(a => a.DisplayOrder)
            .HasDefaultValue(0);

        builder.Property(a => a.IsActive)
            .HasDefaultValue(true);

        builder.Property(a => a.CreatedAt)
            .HasDefaultValueSql("(UTC_TIMESTAMP())");

        // Indexes
        builder.HasIndex(a => a.Name)
            .IsUnique()
            .HasDatabaseName("UQ_Applications_Name");

        builder.HasIndex(a => a.Category)
            .HasDatabaseName("IX_Applications_Category");

        builder.HasIndex(a => a.IsActive)
            .HasDatabaseName("IX_Applications_IsActive");

        builder.HasIndex(a => a.DisplayOrder)
            .HasDatabaseName("IX_Applications_DisplayOrder");
    }
}
