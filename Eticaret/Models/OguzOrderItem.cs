using System;
using System.Collections.Generic;

namespace Eticaret.Models;

public partial class OguzOrderItem
{
    public string Id { get; set; } = null!;

    public string OrderId { get; set; } = null!;

    public string ProductId { get; set; } = null!;

    public int Quantity { get; set; }

    public decimal PriceAtPurchase { get; set; }

    public virtual OguzOrder Order { get; set; } = null!;

    public virtual OguzProduct Product { get; set; } = null!;
}
