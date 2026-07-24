using Eticaret.Models;
using Visus.Cuid;

namespace Eticaret.Services
{
    public class OrderService
    {
        private readonly OtokarProgsContext _context;

        public OrderService(OtokarProgsContext context)
        {
            _context = context;
        }

        public OguzOrder CreateOrderFromCart(string userId, string addressId)
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
                Status = "pending",
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
