using Microsoft.AspNetCore.Mvc;
using Eticaret.Models;
using Eticaret.DTOs;
using Visus.Cuid;

namespace Eticaret.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoritesController : ControllerBase
    {
        private readonly OtokarProgsContext _context;

        public FavoritesController(OtokarProgsContext context)
        {
            _context = context;
        }

        [HttpGet("GetByUser/{userId}")]
        public IActionResult GetByUser(string userId)
        {
            var favorites = _context.OguzFavorites
                .Where(f => f.UserId == userId)
                .ToList();

            return Ok(favorites);
        }

        [HttpPost("Add")]
        public IActionResult Add(FavoriteDto dto)
        {
            var existing = _context.OguzFavorites
                .FirstOrDefault(f => f.UserId == dto.UserId && f.ProductId == dto.ProductId);

            if (existing != null)
            {
                return Ok(existing);
            }

            var favorite = new OguzFavorite
            {
                Id = new Cuid2().ToString(),
                UserId = dto.UserId,
                ProductId = dto.ProductId,
                CreatedAt = DateTime.Now
            };

            _context.OguzFavorites.Add(favorite);
            _context.SaveChanges();

            return Ok(favorite);
        }

        [HttpDelete("Remove")]
        public IActionResult Remove([FromQuery] string userId, [FromQuery] string productId)
        {
            var favorite = _context.OguzFavorites
                .FirstOrDefault(f => f.UserId == userId && f.ProductId == productId);

            if (favorite == null)
            {
                return NotFound();
            }

            _context.OguzFavorites.Remove(favorite);
            _context.SaveChanges();

            return Ok();
        }
    }
}
