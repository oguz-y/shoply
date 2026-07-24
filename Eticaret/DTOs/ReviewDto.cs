namespace Eticaret.DTOs
{
    public class ReviewDto
    {
        public string UserId { get; set; }
        public string ProductId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}
