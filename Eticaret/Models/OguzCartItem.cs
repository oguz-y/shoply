using System;
using System.Collections.Generic;

namespace Eticaret.Models;

public partial class OguzCartItem
{
    public string Id { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string ProductId { get; set; } = null!;

    public int Quantity { get; set; }

    public DateTime? AddedAt { get; set; }

    public virtual OguzProduct Product { get; set; } = null!;

    public virtual OguzUser User { get; set; } = null!;
}
