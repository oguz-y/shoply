using Microsoft.AspNetCore.Mvc;
using Eticaret.Models;
using Eticaret.DTOs;
using Visus.Cuid;

namespace Eticaret.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AddressesController : ControllerBase
    {
        private readonly OtokarProgsContext _context;

        public AddressesController(OtokarProgsContext context)
        {
            _context = context;
        }

        [HttpGet("GetByUser/{userId}")]
        public IActionResult GetByUser(string userId)
        {
            var addresses = _context.OguzAddresses
                .Where(a => a.UserId == userId)
                .ToList();
            return Ok(addresses);
        }

        [HttpPost("Create")]
        public IActionResult Create(AddressDto dto)
        {
            var address = new OguzAddress
            {
                Id = new Cuid2().ToString(),
                UserId = dto.UserId,
                Title = dto.Title,
                FullAddress = dto.FullAddress,
                City = dto.City,
                District = dto.District,
                PostalCode = dto.PostalCode
            };

            _context.OguzAddresses.Add(address);
            _context.SaveChanges();
            return Ok(address);
        }

        [HttpPut("Update/{id}")]
        public IActionResult Update(string id, AddressDto dto)
        {
            var address = _context.OguzAddresses.Find(id);
            if (address == null)
            {
                return NotFound();
            }

            address.Title = dto.Title;
            address.FullAddress = dto.FullAddress;
            address.City = dto.City;
            address.District = dto.District;
            address.PostalCode = dto.PostalCode;

            _context.SaveChanges();
            return Ok(address);
        }

        [HttpDelete("Delete/{id}")]
        public IActionResult Delete(string id)
        {
            var address = _context.OguzAddresses.Find(id);
            if (address == null)
            {
                return NotFound();
            }
            _context.OguzAddresses.Remove(address);
            _context.SaveChanges();
            return Ok();
        }
    }
}
