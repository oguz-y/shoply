using Microsoft.AspNetCore.Mvc;
using Eticaret.Models;
using Eticaret.DTOs;
using Visus.Cuid;
using Eticaret.Services;

namespace Eticaret.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly OtokarProgsContext _context;
        private readonly OrderService _orderService;

        public OrdersController(OtokarProgsContext context, OrderService orderService)
        {
            _context = context;
            _orderService = orderService;
        }

        [HttpGet("GetByUser/{userId}")]
        public IActionResult GetByUser(string userId)
        {
            var orders = _context.OguzOrders.Where(o => o.UserId == userId).ToList();
            return Ok(orders);
        }

        [HttpGet("GetDetail/{id}")]
        public IActionResult GetById(string id)
        {
            var order = _context.OguzOrders.Find(id);
            if (order == null)
            {
                return NotFound();
            }

            var items = _context.OguzOrderItems.Where(oi => oi.OrderId == id).ToList();
            return Ok(new { order,items});
        }

        [HttpPost("Create")]
        public IActionResult Create(OrderDto dto)
        {
            var cartItems = _context.OguzCartItems.Where(c => c.UserId == dto.UserId).ToList();
            if (cartItems.Count == 0)
            {
                return BadRequest("Sepetiniz Boş");
            }

            var order = _orderService.CreateOrderFromCart(dto.UserId, dto.AddressId);
            return Ok(order);
        }


        [HttpPut("UpdateStatus/{id}")]
        public IActionResult UpdateStatus(string id, [FromBody] string status)
        {
            var order = _context.OguzOrders.Find(id);
            if (order == null)
            {
                return NotFound();
            }

            order.Status = status;
            _context.SaveChanges();
            return Ok(order);
        }

        private OguzOrder CreateOrderFromCart(string userId, string addressId)
        {
            var cartItems = _context.OguzCartItems.Where(c => c.UserId == userId).ToList();

            decimal totalPrice = 0;
            foreach (var item in cartItems)
            {
                var product = _context.OguzProducts.Find(item.ProductId);
                if (product != null)
                {
                    totalPrice += product.Price * item.Quantity;
                }
            }

            var order = new OguzOrder
            {
                Id = new Cuid2().ToString(),
                UserId = userId,
                AddressId = addressId,
                TotalPrice = totalPrice,
                Status = "paid",
                CreatedAt = DateTime.Now
            };

            _context.OguzOrders.Add(order);

            foreach (var item in cartItems)
            {
                var product = _context.OguzProducts.Find(item.ProductId);
                if (product == null) continue;

                var orderItem = new OguzOrderItem
                {
                    Id = new Cuid2().ToString(),
                    OrderId = order.Id,
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    PriceAtPurchase = product.Price
                };
                _context.OguzOrderItems.Add(orderItem);

                product.Stock -= item.Quantity;
            }

            _context.OguzCartItems.RemoveRange(cartItems);
            _context.SaveChanges();

            return order;
        }

    }
}
