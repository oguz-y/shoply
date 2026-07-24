using Eticaret.DTOs;
using Eticaret.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Visus.Cuid;

namespace Eticaret.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly OtokarProgsContext _context;
        public ProductsController(OtokarProgsContext context)
        {
            _context = context;
        }

        [HttpGet("GetAll")]
        public IActionResult GetAll([FromQuery] string? category)
        {
            var query = _context.OguzProducts.AsQueryable();
            query = query.Where(p => p.IsActive);

            if (!string.IsNullOrEmpty(category))
            {
                var categoryIds = new List<string> { category };
                var childIds = _context.OguzCategories
                    .Where(c => c.ParentId == category)
                    .Select(c => c.Id)
                    .ToList();
                categoryIds.AddRange(childIds);

                query = query.Where(p => categoryIds.Contains(p.CategoryId));
            }

            var products = query.ToList();
            return Ok(products);
        }

        [Authorize(Roles = "admin")]
        [HttpGet("GetAllForAdmin")]

        public IActionResult GetAllForAdmin()
        {
            var products = _context.OguzProducts.ToList();
            return Ok(products);
        }

        [HttpGet("GetById/{id}")]
        public IActionResult GetById(string id)
        {
            var product = _context.OguzProducts.Find(id);
            if (product == null)
            {
                return NotFound();
            }
            return Ok(product);
        }

        [Authorize(Roles = "admin")]
        [HttpPost("Create")]
        public IActionResult Create(ProductDto dto)
        {
            var product = new OguzProduct
            {
                Id = new Cuid2().ToString(),
                CategoryId = dto.CategoryId,
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                Stock = dto.Stock,
                ImageUrl = dto.ImageUrl,
                IsActive = dto.IsActive
            };
            _context.OguzProducts.Add(product);
            _context.SaveChanges();
            return Ok(product);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("Update/{id}")]
        public IActionResult Update(string id, ProductDto dto)
        {
            var product = _context.OguzProducts.Find(id);
            if (product == null)
            {
                return NotFound();
            }
            product.CategoryId = dto.CategoryId;
            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.ImageUrl = dto.ImageUrl;
            product.IsActive = dto.IsActive;

            _context.SaveChanges();
            return Ok(product);
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("Delete/{id}")]
        public IActionResult Delete(string id)
        {
            var product = _context.OguzProducts
                .Include(p => p.OguzCartItems)
                .Include(p => p.OguzOrderItems)
                .Include(p => p.OguzReviews)
                .FirstOrDefault(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            if (product.OguzOrderItems.Any())
            {
                return BadRequest("Bu ürün geçmiş siparişlerde yer alıyor, silinemez. İsterseniz ürünü pasif hale getirin.");
            }

            _context.OguzCartItems.RemoveRange(product.OguzCartItems);
            _context.OguzReviews.RemoveRange(product.OguzReviews);

            _context.OguzProducts.Remove(product);
            _context.SaveChanges();
            return Ok();
        }

        [Authorize(Roles = "admin")]
        [HttpPatch("ToggleActive/{id}")]
        public IActionResult ToggleActive(string id)
        {
            var product = _context.OguzProducts.Find(id);
            
            if(product == null)
            {
                return NotFound();
            }

            product.IsActive = !product.IsActive;
            _context.SaveChanges();
            return Ok(product);
        }


    }
}
