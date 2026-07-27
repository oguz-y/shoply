using System;
using System.Collections.Generic;

namespace Eticaret.Models;

public partial class OguzCategory
{
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public string? ParentId { get; set; }
    public virtual OguzCategory? Parent { get; set; }
    public virtual ICollection<OguzCategory> Children { get; set; } = new List<OguzCategory>();
    public virtual ICollection<OguzProduct> OguzProducts { get; set; } = new List<OguzProduct>();
}
