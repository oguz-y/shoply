namespace Eticaret.DTOs
{
    public class ProductDto
    {
        public string CategoryId { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; } 
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;




    }
}
