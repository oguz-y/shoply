using Microsoft.AspNetCore.Mvc;
using Eticaret.Models;
using Eticaret.DTOs;
using Eticaret.Services;
using Microsoft.AspNetCore.Authorization;
using Visus.Cuid;

namespace Eticaret.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly OtokarProgsContext _context;
        private readonly TokenService _tokenService;

        public UsersController(OtokarProgsContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("Register")]
        public IActionResult Register(RegisterDto dto)
        {
            // Bu email zaten kayıtlı mı kontrol et
            var existingUser = _context.OguzUsers.FirstOrDefault(u => u.Email == dto.Email);
            if (existingUser != null)
            {
                return BadRequest("Bu email adresi zaten kayıtlı.");
            }

            // Şifreyi hashle
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new OguzUser
            {
                Id = new Cuid2().ToString(),
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Password = hashedPassword,
                Role = "customer"
            };

            _context.OguzUsers.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "Kayıt başarılı." });
        }

        [HttpPost("Login")]
        public IActionResult Login(LoginDto dto)
        {
            var user = _context.OguzUsers.FirstOrDefault(u => u.Email == dto.Email);
            if (user == null)
            {
                return BadRequest("Email veya şifre hatalı.");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.Password);
            if (!isPasswordValid)
            {
                return BadRequest("Email veya şifre hatalı.");
            }

            string token = _tokenService.CreateToken(user);

            return Ok(new { token = token });
        }

        [Authorize]
        [HttpGet("Profile")]
        public IActionResult GetProfile()
        {
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            var user = _context.OguzUsers.FirstOrDefault(u => u.Email == email);
            if(user == null)
            {
                return NotFound("Kullanıcı bulunamadı.");
            }

            return Ok(new
            {
                name = user.Name,
                email = user.Email
            });
        }
    }
}
