using Scalar.AspNetCore;
using Microsoft.EntityFrameworkCore;
using Eticaret.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Eticaret.Services;

using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

var encryptedConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var decryptedConnectionString = Eticaret.Services.EncryptionHelper.Decrypt(encryptedConnectionString!);

//veritabanı bağlantısı burada kuruluyor !!!
builder.Services.AddDbContext<OtokarProgsContext>(options =>
    options.UseSqlServer(decryptedConnectionString));
//******************************************

var encryptedIyzicoApiKey = builder.Configuration["Iyzico:ApiKey"];
var encryptedIyzicoSecretKey = builder.Configuration["Iyzico:SecretKey"];
var decryptedIyzicoApiKey = Eticaret.Services.EncryptionHelper.Decrypt(encryptedIyzicoApiKey!);
var decryptedIyzicoSecretKey = Eticaret.Services.EncryptionHelper.Decrypt(encryptedIyzicoSecretKey!);

builder.Services.AddSingleton(new Eticaret.Services.IyzicoSettings
{
    ApiKey = decryptedIyzicoApiKey,
    SecretKey = decryptedIyzicoSecretKey,
    BaseUrl = builder.Configuration["Iyzico:BaseUrl"]!
});

//***********************************************************************************************
//CORS servisini ekleme
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod();
    
    });
});
//************************************************************************************************

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))

    };

});



builder.Services.AddOpenApi();

//*****************RATE***LİMİTİNG***********************
//Rate Limiting ( Token Bucket ) - tüm endpointlere IP bazlı uygulanır
builder.Services.AddRateLimiter(options =>
{
//Limit aşıldığında dönecek HTTP durum kodu: 429 Too Many Requests
options.RejectionStatusCode = 429;

//Global limiter: her istekte çalışır, isteği hangi IP'nin attığına göre ayrı bir "kova" (partition) oluşturur .
options.GlobalLimiter = System.Threading.RateLimiting.PartitionedRateLimiter.Create<HttpContext, string> (HttpContext =>
{
    //Partition anahtarı olarak istemcinin IP adresini kullanıyoruz .
    //Aynı IP'den gelen istekler aynı kovayı paylaşır, farklı IP'ler birbirinden tamamen bağımsız kovalara sahip olur .
    var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

    return System.Threading.RateLimiting.RateLimitPartition.GetTokenBucketLimiter(ipAddress, _ =>
        new System.Threading.RateLimiting.TokenBucketRateLimiterOptions
        {
            TokenLimit = 20, //Kovanın maksimum kapasitesi(20 jeton)
            TokensPerPeriod = 5, //Her periyotta eklenecek jeton sayısı
            ReplenishmentPeriod = TimeSpan.FromSeconds(1), //Jetonların eklenme sıklığı
            QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst,
            QueueLimit = 0, //Jeton yoksa bekletmeden direkt reddet
            AutoReplenishment = true //Jetonları otomatik arkaplanda ekle
        });
    });

});
//*****************RATE***LİMİTİNG************************

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
//*************CORS***************
app.UseCors("AllowReactApp");
//*************CORS***************
//****RATE*****LİMİTİNG***********
app.UseRateLimiter();
//****RATE*****LİMİTİNG***********

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
