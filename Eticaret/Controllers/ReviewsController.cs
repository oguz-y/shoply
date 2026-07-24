using Microsoft.AspNetCore.Mvc;
using Eticaret.Models;
using Eticaret.DTOs;
using Visus.Cuid;

namespace Eticaret.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly OtokarProgsContext _context;

        public ReviewsController(OtokarProgsContext context)
        {
            _context = context;
        }

        
        [HttpGet("GetByProduct/{productId}")]
        public IActionResult GetByProduct(string productId)
        {
            var reviews = _context.OguzReviews
                .Where(r => r.ProductId == productId)
                .Select(r => new
                {
                    r.Id,
                    r.UserId,
                    r.ProductId,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
                    ReviewerEmail = _context.OguzUsers
                        .Where(u => u.Id == r.UserId)
                        .Select(u => u.Email)
                        .FirstOrDefault()
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToList();
            return Ok(reviews);
        }

       
        [HttpPost("Create")]
        public IActionResult Create(ReviewDto dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                return BadRequest("Puan 1 ile 5 arasında olmalıdır.");
            }

            var review = new OguzReview
            {
                Id = new Cuid2().ToString(),
                UserId = dto.UserId,
                ProductId = dto.ProductId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.Now
            };

            _context.OguzReviews.Add(review);
            _context.SaveChanges();
            return Ok(review);
        }

        
        [HttpDelete("Delete/{id}")]
        public IActionResult Delete(string id)
        {
            var review = _context.OguzReviews.Find(id);
            if (review == null)
            {
                return NotFound();
            }
            _context.OguzReviews.Remove(review);
            _context.SaveChanges();
            return Ok();
        }
    }
}
