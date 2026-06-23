using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;
using Admin.Api.Common.Security.Policies;
using Admin.Api.Common.Security.User;
using Admin.Api.DependencyInjection;
using Admin.Api.Filters;
using Admin.Api.Middleware;
using Common.Security.User;
using Core.Application.Abstractions.Caching;
using Core.Application.Abstractions.Persistence;
using Core.Application.Configuration;
using Core.Infrastructure.Caching;
using Core.Infrastructure.Jobs.Jobs;
using Core.Infrastructure.Persistence;
using Quartz;
using Core.Application.Abstractions.Security;

var builder = WebApplication.CreateBuilder(args);

// Use Autofac as the service provider factory
builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());

// Register Autofac modules
builder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
{
    containerBuilder.RegisterModule<AutofacModule>();
});

var appSettings = builder.Configuration.GetSection("AppSettings").Get<AppSettings>();
builder.Services.AddSingleton(appSettings ?? new AppSettings());

// Add Memory Cache Service
builder.Services.AddMemoryCache();

// Add CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        corsBuilder =>
        {
            var allowedOrigins = appSettings != null ? appSettings.Cors.ToArray() : [];
            corsBuilder.WithOrigins(allowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
});

// Add authentication service with JWT
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
            ValidIssuer = appSettings?.Jwt.Issuer,
            ValidAudience = appSettings?.Jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appSettings != null
                ? appSettings.Jwt.SingingKey
                : "$3!kP#r2^Lq@v9&yFgXwNzTb8Uj*JhV5mDchfyresds845HGYR9843hhdsu!@hre83uDFG0HD"))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();
// injection services
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddSingleton<IAuthorizationHandler, PermissionHandler>();
builder.Services.AddScoped<IDbConnectionFactory, DbConnectionFactory>();
builder.Services.AddSingleton<ICacheService, CacheManager>();
builder.Services.AddScoped<ICurrentUser, CurrentUserAccessor>();

// Add Quartz.NET services
builder.Services.AddQuartz(q =>
{
    q.UseInMemoryStore();
    q.UseDefaultThreadPool();
});

// Add Quartz hosted service
builder.Services.AddQuartzHostedService(options =>
{
    options.WaitForJobsToComplete = true;
});

builder.Services.AddHostedService<JobLoaderService>();

// Add controllers with filters
builder.Services.AddControllers(options => { options.Filters.Add<GlobalExceptionFilter>(); });

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Read serilog configuration from appsetting.json
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();
// Configure Dapper to match column names with underscores to C# properties with PascalCase
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
// localization setup
builder.Services.AddLocalization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) 
    app.MapOpenApi();

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("CorsPolicy");
// middleware setup
app.UseMiddleware<LanguageMiddleware>();

app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseJwtBlacklist();// Add authentication middleware
app.UseJwtUserInfo(); // Add our custom JWT user info middleware
app.UseAuthorization();

app.MapControllers();

app.Run();