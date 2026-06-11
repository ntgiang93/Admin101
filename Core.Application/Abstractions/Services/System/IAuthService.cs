using Core.Application.Contracts.System.Auth;
using Core.Domain.Entities.System;

namespace Core.Application.Abstractions.Services.System;

public interface IAuthService
{
    Task<TokenDto> LoginAsync(User user, LoginDto loginDto);
    Task<TokenDto?> RefreshTokenAsync(RefreshTokenDto dto);
    Task<bool> LogoutAsync(TokenDto tokenDto);
    Task<bool> RevokeTokenAssync(List<string> deviceIds);
    Task<(User User, string? VerificationId)> RegisterAsync(RegisterUserDto registerDto);
    Task<bool> VerifyAccountAsync(VerifyAccountDto dto);
    Task ResendVerificationAsync(string verificationId);
    Task<bool> ChangePasswordAsync(string oldPassword, string newpPassword);
    Task<bool> ResetPasswordAsync(string userId);
    Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto );
    Task<TokenDto?> LoginProxyAsync(LoginDto loginDto);
}