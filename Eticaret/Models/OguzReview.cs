using System;
using System.Collections.Generic;

namespace Eticaret.Models;

public partial class OguzReview
{
    public string Id { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string ProductId { get; set; } = null!;

    public int Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual OguzProduct Product { get; set; } = null!;

    public virtual OguzUser User { get; set; } = null!;
}
