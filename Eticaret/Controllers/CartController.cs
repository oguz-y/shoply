using Microsoft.AspNetCore.Mvc;
using Eticaret.Models;
using Eticaret.DTOs;
using Visus.Cuid;

namespace Eticaret.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly OtokarProgsContext _context;

        public CartController(OtokarProgsContext context)
        {
            _context = context;
        }

        [HttpGet("GetByUser{userId}")]
        
        public IActionResult GetByUser(string userId)
        { 
            var cartItems = _context.OguzCartItems
                .Where(c => c.UserId == userId)
                .ToList();
            return Ok(cartItems);   
        }

        [HttpPost("AddToCart")]
        public IActionResult AddToCart(CartItemDto dto)
        {
            // Ürünü bul, stok bilgisini al
            var product = _context.OguzProducts.Find(dto.ProductId);
            if (product == null)
            {
                return NotFound("Ürün bulunamadı.");
            }

            // Aynı ürün zaten sepette mi kontrolü
            var existingItem = _context.OguzCartItems.FirstOrDefault(c => c.UserId == dto.UserId && c.ProductId == dto.ProductId);

            // Sepette şu an bu üründen kaç adet var (yoksa 0)
            var currentQuantityInCart = existingItem?.Quantity ?? 0;
            var totalRequestedQuantity = currentQuantityInCart + dto.Quantity;

            // Stok kontrolü - toplam istenen miktar stoğu aşıyor mu?
            if (totalRequestedQuantity > product.Stock)
            {
                var remainingStock = product.Stock - currentQuantityInCart;
                return BadRequest($"Yetersiz stok. Bu üründen sepetinize en fazla {Math.Max(remainingStock, 0)} adet daha ekleyebilirsiniz.");
            }

            if (existingItem != null)
            {
                // Zaten varsa, adedini artır
                existingItem.Quantity += dto.Quantity;
                _context.SaveChanges();
                return Ok(existingItem);
            }

            // Yoksa yeni satır oluştur
            var cartItem = new OguzCartItem
            {
                Id = new Cuid2().ToString(),
                UserId = dto.UserId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                AddedAt = DateTime.Now
            };

            _context.OguzCartItems.Add(cartItem);
            _context.SaveChanges();
            return Ok(cartItem);
        }


        [HttpPut("UpdateQuantity/{id}")]
        public IActionResult UpdateQuantity(string id, [FromBody] int quantity)
        {
            var cartItem = _context.OguzCartItems.Find(id);
            if (cartItem == null)
            {
                return NotFound();
            }

            // 0 veya negatif miktar mantıksız - en az 1 olmalı
            if (quantity < 1)
            {
                return BadRequest("Miktar en az 1 olmalıdır. Ürünü kaldırmak için silme işlemini kullanın.");
            }

            // Stok kontrolü
            var product = _context.OguzProducts.Find(cartItem.ProductId);
            if (product == null)
            {
                return NotFound("Ürün bulunamadı.");
            }

            if (quantity > product.Stock)
            {
                return BadRequest($"Yetersiz stok. Bu üründen en fazla {product.Stock} adet sepete ekleyebilirsiniz.");
            }

            cartItem.Quantity = quantity;
            _context.SaveChanges();
            return Ok(cartItem);
        }


        [HttpDelete("RemoveFromCart/{id}")]
        public IActionResult RemoveFromCart(string id)
        {
            var cartItem = _context.OguzCartItems.Find(id);
            if (cartItem == null)
            {
                return NotFound();
            }
            
            _context.OguzCartItems.Remove(cartItem);
            _context.SaveChanges();
            return Ok();
        }






    }
}
