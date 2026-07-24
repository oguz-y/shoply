using System;
using System.Collections.Generic;

namespace Eticaret.Models;

public partial class OguzOrder
{
    public string Id { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string AddressId { get; set; } = null!;

    public decimal TotalPrice { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual OguzAddress Address { get; set; } = null!;

    public virtual ICollection<OguzOrderItem> OguzOrderItems { get; set; } = new List<OguzOrderItem>();

    public virtual OguzUser User { get; set; } = null!;
}
