using System;
using System.Collections.Generic;

namespace Eticaret.Models;

public partial class OguzAddress
{
    public string Id { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string? Title { get; set; }

    public string FullAddress { get; set; } = null!;

    public string City { get; set; } = null!;

    public string? District { get; set; }

    public string? PostalCode { get; set; }

    public virtual ICollection<OguzOrder> OguzOrders { get; set; } = new List<OguzOrder>();

    public virtual OguzUser User { get; set; } = null!;
}
