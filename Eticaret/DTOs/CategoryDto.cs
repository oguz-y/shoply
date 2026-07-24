namespace Eticaret.DTOs
{
    public class CategoryDto
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public string? ParentId { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
