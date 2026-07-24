using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Eticaret.Models;

public partial class OtokarProgsContext : DbContext
{
    public OtokarProgsContext()
    {
    }

    public OtokarProgsContext(DbContextOptions<OtokarProgsContext> options)
        : base(options)
    {
    }

    public virtual DbSet<OguzAddress> OguzAddresses { get; set; }

    public virtual DbSet<OguzCartItem> OguzCartItems { get; set; }

    public virtual DbSet<OguzCategory> OguzCategories { get; set; }

    public virtual DbSet<OguzOrder> OguzOrders { get; set; }

    public virtual DbSet<OguzOrderItem> OguzOrderItems { get; set; }

    public virtual DbSet<OguzProduct> OguzProducts { get; set; }

    public virtual DbSet<OguzReview> OguzReviews { get; set; }

    public virtual DbSet<OguzUser> OguzUsers { get; set; }

    public virtual DbSet<OguzFavorite> OguzFavorites { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=OF1SRV20;Database=OTOKAR_PROGS;User Id=sql_kullanicisi;Password=Xy99zz55;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.UseCollation("Turkish_CI_AS");

        modelBuilder.Entity<OguzAddress>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__oguz_add__3213E83F9E5EBEEC");

            entity.ToTable("oguz_addresses");

            entity.Property(e => e.Id)
                .HasMaxLength(30)
                .HasColumnName("id");
            entity.Property(e => e.City)
                .HasMaxLength(50)
                .HasColumnName("city");
            entity.Property(e => e.District)
                .HasMaxLength(10)
                .HasColumnName("district");
            entity.Property(e => e.FullAddress).HasColumnName("full_address");
            entity.Property(e => e.PostalCode)
                .HasMaxLength(10)
                .HasColumnName("postal_code");
            entity.Property(e => e.Title)
                .HasMaxLength(50)
                .HasColumnName("title");
            entity.Property(e => e.UserId)
                .HasMaxLength(30)
                .HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.OguzAddresses)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__oguz_addr__user___00F9BF71");
        });

        modelBuilder.Entity<OguzFavorite>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_oguz_favorites");

            entity.ToTable("oguz_favorites");

            entity.HasIndex(e => new { e.UserId, e.ProductId }, "UQ_oguz_favorites_user_product").IsUnique();

            entity.Property(e => e.Id)
                .HasMaxLength(30)
                .HasColumnName("id");

            entity.Property(e => e.UserId)
                .HasMaxLength(30)
                .HasColumnName("user_id");

            entity.Property(e => e.ProductId)
                .HasMaxLength(30)
                .HasColumnName("product_id");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");

            entity.HasOne(d => d.User).WithMany()
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_oguz_favorites_user");

            entity.HasOne(d => d.Product).WithMany()
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK_oguz_favorites_product");
        });


        modelBuilder.Entity<OguzCartItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__oguz_car__3213E83F5F336372");

            entity.ToTable("oguz_cart_items");

            entity.Property(e => e.Id)
                .HasMaxLength(30)
                .HasColumnName("id");
            entity.Property(e => e.AddedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("added_at");
            entity.Property(e => e.ProductId)
                .HasMaxLength(30)
                .HasColumnName("product_id");
            entity.Property(e => e.Quantity)
                .HasDefaultValue(1)
                .HasColumnName("quantity");
            entity.Property(e => e.UserId)
                .HasMaxLength(30)
                .HasColumnName("user_id");

            entity.HasOne(d => d.Product).WithMany(p => p.OguzCartItems)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__oguz_cart__produ__0E53BA8F");

            entity.HasOne(d => d.User).WithMany(p => p.OguzCartItems)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__oguz_cart__user___0D5F9656");
        });

        modelBuilder.Entity<OguzCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__oguz_cat__3213E83F29806F11");

            entity.ToTable("oguz_categories");

            entity.HasIndex(e => e.Name, "UQ__oguz_cat__72E12F1B9D272516").IsUnique();

            entity.Property(e => e.Id)
                .HasMaxLength(30)
                .HasColumnName("id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");

            entity.Property(e => e.ParentId)
                .HasMaxLength(30)
                .HasColumnName("parent_id");

            entity.HasOne(d => d.Parent).WithMany(p => p.Children)
                .HasForeignKey(d => d.ParentId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<OguzOrder>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__oguz_ord__3213E83F63DA150B");

            entity.ToTable("oguz_orders");

            entity.Property(e => e.Id)
                .HasMaxLength(30)
                .HasColumnName("id");
            entity.Property(e => e.AddressId)
                .HasMaxLength(30)
                .HasColumnName("address_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("pending")
                .HasColumnName("status");
            entity.Property(e => e.TotalPrice)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("total_price");
            entity.Property(e => e.UserId)
                .HasMaxLength(30)
                .HasColumnName("user_id");

            entity.HasOne(d => d.Address).WithMany(p => p.OguzOrders)
                .HasForeignKey(d => d.AddressId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__oguz_orde__addre__1500B81E");

            entity.HasOne(d => d.User).WithMany(p => p.OguzOrders)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__oguz_orde__user___140C93E5");
        });

        modelBuilder.Entity<OguzOrderItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__oguz_ord__3213E83F76467707");

            entity.ToTable("oguz_order_items");

            entity.Property(e => e.Id)
                .HasMaxLength(30)
                .HasColumnName("id");
            entity.Property(e => e.OrderId)
                .HasMaxLength(30)
                .HasColumnName("order_id");
            entity.Property(e => e.PriceAtPurchase)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("price_at_purchase");
            entity.Property(e => e.ProductId)
                .HasMaxLength(30)
                .HasColumnName("product_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");

            entity.HasOne(d => d.Order).WithMany(p => p.OguzOrderItems)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__oguz_orde__order__17DD24C9");

            entity.HasOne(d => d.Product).WithMany(p => p.OguzOrderItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__oguz_orde__produ__18D14902");
        });

        modelBuilder.Entity<OguzProduct>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__oguz_pro__3213E83F842FB329");

            entity.ToTable("oguz_products");

            entity.Property(e => e.Id)
                .HasMaxLength(30)
                .HasColumnName("id");
            entity.Property(e => e.CategoryId)
                .HasMaxLength(30)
                .HasColumnName("category_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(255)
                .HasColumnName("image_url");
            entity.Property(e => e.Name)
                .HasMaxLength(150)
                .HasColumnName("name");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("price");
            entity.Property(e => e.Stock).HasColumnName("stock");

            entity.HasOne(d => d.Category).WithMany(p => p.OguzProducts)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK__oguz_prod__categ__089AE139");
        });

        modelBuilder.Entity<OguzReview>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__oguz_rev__3213E83FA817B7DD");

            entity.ToTable("oguz_reviews");

            entity.Property(e => e.Id)
                .HasMaxLength(30)
                .HasColumnName("id");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.ProductId)
                .HasMaxLength(30)
                .HasColumnName("product_id");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.UserId)
                .HasMaxLength(30)
                .HasColumnName("user_id");

            entity.HasOne(d => d.Product).WithMany(p => p.OguzReviews)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__oguz_revi__produ__1D95FE1F");

            entity.HasOne(d => d.User).WithMany(p => p.OguzReviews)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__oguz_revi__user___1CA1D9E6");
        });

        modelBuilder.Entity<OguzUser>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__oguz_use__3213E83FC3736B21");

            entity.ToTable("oguz_users");

            entity.HasIndex(e => e.Email, "UQ__oguz_use__AB6E616484AC07D9").IsUnique();

            entity.Property(e => e.Id)
                .HasMaxLength(30)
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(150)
                .HasColumnName("email");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasDefaultValue("customer")
                .HasColumnName("role");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
