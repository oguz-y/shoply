using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Eticaret.Models;
using Eticaret.Services;
using Iyzipay;
using Iyzipay.Model;
using Iyzipay.Request;
using System.Globalization;
using System.Threading.Tasks;

namespace Eticaret.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly OtokarProgsContext _context;
        private readonly IyzicoSettings _iyzicoSettings;
        private readonly OrderService _orderService;

        public PaymentController(OtokarProgsContext context, IyzicoSettings iyzicoSettings, OrderService orderService)
        {
            _context = context;
            _iyzicoSettings = iyzicoSettings;
            _orderService = orderService;
        }

        public class InitiatePaymentDto
        {
            public string UserId { get; set; } = null!;
            public string AddressId { get; set; } = null!;
        }

        [HttpPost("Initiate")]
        public async Task<IActionResult> Initiate(InitiatePaymentDto dto)
        {
            var cartItems = _context.OguzCartItems.Where(c => c.UserId == dto.UserId).ToList();
            if (cartItems.Count == 0)
            {
                return BadRequest("Sepetiniz boş.");
            }

            var user = _context.OguzUsers.Find(dto.UserId);
            var address = _context.OguzAddresses.Find(dto.AddressId);
            if (user == null || address == null)
            {
                return BadRequest("Kullanıcı veya adres bulunamadı.");
            }

            decimal totalPrice = 0;
            var basketItems = new List<BasketItem>();

            foreach (var item in cartItems)
            {
                var product = _context.OguzProducts.Find(item.ProductId);
                if (product == null) continue;

                var lineTotal = product.Price * item.Quantity;
                totalPrice += lineTotal;

                var basketItem = new BasketItem
                {
                    Id = product.Id,
                    Name = product.Name,
                    Category1 = product.CategoryId ?? "Genel",
                    ItemType = BasketItemType.PHYSICAL.ToString(),
                    Price = lineTotal.ToString(CultureInfo.InvariantCulture)
                };
                basketItems.Add(basketItem);
            }

            var conversationId = Guid.NewGuid().ToString();
            var basketId = Guid.NewGuid().ToString();

            var options = new Options
            {
                ApiKey = _iyzicoSettings.ApiKey,
                SecretKey = _iyzicoSettings.SecretKey,
                BaseUrl = _iyzicoSettings.BaseUrl
            };

            var request = new CreateCheckoutFormInitializeRequest
            {
                Locale = Locale.TR.ToString(),
                ConversationId = conversationId,
                Price = totalPrice.ToString(CultureInfo.InvariantCulture),
                PaidPrice = totalPrice.ToString(CultureInfo.InvariantCulture),
                Currency = Currency.TRY.ToString(),
                BasketId = basketId,
                PaymentGroup = PaymentGroup.PRODUCT.ToString(),
                CallbackUrl = "https://localhost:7115/api/Payment/Callback"
            };

            var nameParts = (user.Name ?? "Müşteri").Split(' ', 2);
            var firstName = nameParts.Length > 0 ? nameParts[0] : "Müşteri";
            var lastName = nameParts.Length > 1 ? nameParts[1] : "Kullanıcı";

            var buyer = new Buyer
            {
                Id = user.Id,
                Name = firstName,
                Surname = lastName,
                GsmNumber = string.IsNullOrEmpty(user.Phone) ? "+905000000000" : user.Phone,
                Email = user.Email,
                IdentityNumber = "11111111111",
                LastLoginDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                RegistrationDate = (user.CreatedAt ?? DateTime.Now).ToString("yyyy-MM-dd HH:mm:ss"),
                RegistrationAddress = address.FullAddress,
                Ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "85.34.78.112",
                City = address.City ?? "Istanbul",
                Country = "Turkey",
                ZipCode = "34000"
            };
            request.Buyer = buyer;

            var billingAddress = new Iyzipay.Model.Address
            {
                ContactName = user.Name ?? "Müşteri",
                City = address.City ?? "Istanbul",
                Country = "Turkey",
                Description = address.FullAddress,
                ZipCode = "34000"
            };
            request.ShippingAddress = billingAddress;
            request.BillingAddress = billingAddress;

            request.BasketItems = basketItems;

            var checkoutFormInitialize = await CheckoutFormInitialize.Create(request, options);

            if (checkoutFormInitialize.Status != "success")
            {
                return BadRequest(checkoutFormInitialize.ErrorMessage ?? "Ödeme başlatılamadı.");
            }

            PendingPaymentStore.Add(basketId, dto.UserId, dto.AddressId);

            return Ok(new
            {
                paymentPageUrl = checkoutFormInitialize.PaymentPageUrl,
                token = checkoutFormInitialize.Token
            });
        }


        [HttpPost("Callback")]
        [AllowAnonymous]
        public async Task<IActionResult> Callback([FromForm] string token)
        {
            var options = new Options
            {
                ApiKey = _iyzicoSettings.ApiKey,
                SecretKey = _iyzicoSettings.SecretKey,
                BaseUrl = _iyzicoSettings.BaseUrl
            };

            var request = new RetrieveCheckoutFormRequest
            {
                Token = token
            };

            var checkoutForm = await CheckoutForm.Retrieve(request, options);

            const string frontendBaseUrl = "http://localhost:5173";

            if (checkoutForm.PaymentStatus == "SUCCESS")
            {
                var pending = PendingPaymentStore.Get(checkoutForm.BasketId);
                if (pending != null)
                {
                    _orderService.CreateOrderFromCart(pending.UserId, pending.AddressId);
                    PendingPaymentStore.Remove(checkoutForm.BasketId);
                }

                return Redirect($"{frontendBaseUrl}/siparis-basarili");
            }

            return Redirect($"{frontendBaseUrl}/odeme-basarisiz");
        }

    }
}
