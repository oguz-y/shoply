using System;
using System.Collections.Generic;

namespace Eticaret.Models;

public partial class OguzUser
{
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public string Password { get; set; } = null!;

    public string Role { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<OguzAddress> OguzAddresses { get; set; } = new List<OguzAddress>();

    public virtual ICollection<OguzCartItem> OguzCartItems { get; set; } = new List<OguzCartItem>();

    public virtual ICollection<OguzOrder> OguzOrders { get; set; } = new List<OguzOrder>();

    public virtual ICollection<OguzReview> OguzReviews { get; set; } = new List<OguzReview>();
}
