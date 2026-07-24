using System;

namespace Eticaret.Models
{
    public partial class OguzFavorite
    {
        public string Id { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string ProductId { get; set; } = null!;
        public DateTime? CreatedAt {  get; set; }

        public virtual OguzUser User { get; set; } = null!;
        public virtual OguzProduct Product { get; set; } = null!;
    }
}