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
    public class CategoriesController : ControllerBase
    {
        private readonly OtokarProgsContext _context;

        public CategoriesController(OtokarProgsContext context)

        {
            _context = context;
        }
        
        //**********************************************************************************

        [HttpGet("GetAll")]
        public IActionResult GetAll()
        {

            var categories = _context.OguzCategories.Where(c => c.IsActive).ToList();
            return Ok(categories);
        }

        [Authorize(Roles = "admin")]
        [HttpGet("GetAllForAdmin")]
        public IActionResult GetAllForAdmin() 
        {
            var categories = _context.OguzCategories.ToList();
            return Ok(categories);
        }

        //***********************************************************************************

        [Authorize(Roles ="admin")]
        [HttpPost("Create")]
        public IActionResult Create(CategoryDto dto)
        {
            var category = new OguzCategory
            {
                Id = new Cuid2().ToString(),
                Name = dto.Name,
                Description = dto.Description,
                ParentId = dto.ParentId,
                IsActive = dto.IsActive
            };
            
            _context.OguzCategories.Add(category);
            _context.SaveChanges();
            return Ok(category);

        }
        
        //************************************************************************************

        [Authorize(Roles = "admin")]
        [HttpPut("Update/{id}")]
        public IActionResult Update(string id, CategoryDto dto)
        {
            var category = _context.OguzCategories.Find(id);
            if (category == null)
            {
                return NotFound();
            }

            category.Name = dto.Name;
            category.Description = dto.Description;
            category.ParentId = dto.ParentId;
            category.IsActive = dto.IsActive;

            _context.SaveChanges();
            return Ok(category);
        }

        //*************************************************************************************

        [Authorize(Roles = "admin")]
        [HttpDelete("Delete/{id}")]
        public IActionResult Delete(string id)
        {
            var category = _context.OguzCategories
                .Include(c => c.OguzProducts)
                .Include(c => c.Children)
                .FirstOrDefault(c => c.Id == id);

            if (category == null)
            {
                return NotFound();
            }

            if (category.Children.Any())
            {
                return BadRequest("Bu kategorinin alt kategorileri var, önce onları silin.");
            }

            if (category.OguzProducts.Any())
            {
                return BadRequest("Bu kategoriye bağlı ürünler var, önce onları silin.");
            }

            _context.OguzCategories.Remove(category);
            _context.SaveChanges();
            return Ok();
        }

        [Authorize(Roles ="admin")]
        [HttpPatch("ToggleActive/{id}")]
        public IActionResult ToggleActive(string id)
        {
            var category = _context.OguzCategories.Find(id);
            if(category == null)
            {
                return NotFound();
            }

            category.IsActive = !category.IsActive;
            _context.SaveChanges();
            return Ok(category);
        }


    }
}
