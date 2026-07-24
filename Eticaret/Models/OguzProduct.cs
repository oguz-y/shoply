using System;
using System.Collections.Generic;

namespace Eticaret.Models;

public partial class OguzProduct
{
    public string Id { get; set; } = null!;

    public string CategoryId { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int Stock { get; set; }

    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual OguzCategory Category { get; set; } = null!;

    public virtual ICollection<OguzCartItem> OguzCartItems { get; set; } = new List<OguzCartItem>();

    public virtual ICollection<OguzOrderItem> OguzOrderItems { get; set; } = new List<OguzOrderItem>();

    public virtual ICollection<OguzReview> OguzReviews { get; set; } = new List<OguzReview>();
}
