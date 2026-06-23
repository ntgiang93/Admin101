using Admin.Api.Common.Extensions;
using Admin.Api.Common.Security.Policies;
using Core.Application.Abstractions.Localizer;
using Core.Application.Abstractions.Message;
using Core.Application.Abstractions.Services.System;
using Core.Application.Contracts.Base;
using Core.Application.Contracts.System.Auth;
using Core.Domain.Constants;
using Core.Domain.Entities.System;
using Core.Domain.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Common.Security;

namespace Admin.Api.Controllers.System;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IMessageLocalizer _localizer;
    private readonly IUserService _userService;

    public AuthController(IUserService userService, IAuthService authService, IMessageLocalizer  localizer)
    {
        _userService = userService;
        _authService = authService;
        _localizer = localizer;
    }
    
    [HttpPost("login-proxy")]
    public async Task<IActionResult> LoginProxy([FromBody] LoginDto loginDto)
    {
        var token = await _authService.LoginProxyAsync(loginDto);
        if (token == null) return Ok(ApiResponse<TokenDto>.Fail(_localizer.Get(MsgKey.Auth.LoginFailed)));
        SetRefreshTokenCookie(token);
        return Ok(ApiResponse<TokenDto>.Succeed(token, _localizer.Get(MsgKey.Auth.LoginSuccess)));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var user = await _userService.GetSingleAsync<User>(u => u.UserName == loginDto.UserName);
        if (user == null)
            return Ok(ApiResponse<TokenDto>.Fail(_localizer.Get(MsgKey.Auth.LoginFailed)));

        var passwordIsCorrect = PasswordHelper.VerifyPassword(loginDto.Password, user.PasswordHash);
        if (!passwordIsCorrect)
            return Ok(ApiResponse<TokenDto>.Fail(_localizer.Get(MsgKey.Auth.LoginFailed)));
        loginDto.IpAddress = HttpContext.GetClientIpAddress();
        var token = await _authService.LoginAsync(user, loginDto);
        if (string.IsNullOrEmpty(token.RefreshToken)) return Ok(ApiResponse<TokenDto>.Fail(_localizer.Get(MsgKey.Auth.LoginFailed)));
        SetRefreshTokenCookie(token);
        return Ok(ApiResponse<TokenDto>.Succeed(token, _localizer.Get(MsgKey.Auth.LoginSuccess)));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
            return BadRequest(_localizer.Get(MsgKey.Auth.TokenInvalid));
        var dto = new RefreshTokenDto();
        dto.RefreshToken = refreshToken;
        dto.IpAddress = HttpContext.GetClientIpAddress();
        var token = await _authService.RefreshTokenAsync(dto);
        if (token == null)
            return Unauthorized();
        SetRefreshTokenCookie(token);
        return Ok(ApiResponse<TokenDto>.Succeed(token, _localizer.Get(MsgKey.Common.Success)));
    }

    private void SetRefreshTokenCookie(TokenDto token)
    {
        HttpContext.Response.Cookies.Append(
            "refreshToken",
            token.RefreshToken,
            new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.None,
                Secure = true,
                Expires = token.Expiration
            }
        );
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var tokenDto = new TokenDto();

        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
            return BadRequest(_localizer.Get(MsgKey.Auth.TokenInvalid));

        // Get the access token from the Authorization header
        if (Request.Headers.TryGetValue("Authorization", out var authHeader) &&
            !string.IsNullOrEmpty(authHeader) &&
            authHeader.ToString().StartsWith("Bearer "))
        {
            tokenDto.AccessToken = authHeader.ToString().Substring("Bearer ".Length).Trim();
            tokenDto.RefreshToken = refreshToken;
        }

        var result = await _authService.LogoutAsync(tokenDto);
        if (result) return Ok(ApiResponse<bool>.Succeed(result, _localizer.Get(MsgKey.Auth.LogoutSuccess)));
        return Ok(ApiResponse<bool>.Fail(_localizer.Get(MsgKey.Common.Failed)));
    }

    [HttpPost("revoke-token")]
    [Authorize]
    public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenDto dto)
    {
        if (dto.DeviceIds.Count == 0)
            return BadRequest(_localizer.Get(MsgKey.Error.BadRequest));
        var result = await _authService.RevokeTokenAssync(dto.DeviceIds);
        if (result) return Ok(ApiResponse<bool>.Succeed(result, _localizer.Get(MsgKey.Common.Success)));
        return Ok(ApiResponse<bool>.Fail(_localizer.Get(MsgKey.Common.Failed)));
    }

    [HttpPost("reset-password")]
    [Policy(ESysModule.Users, EPermission.Edit)]
    public async Task<IActionResult> ResetPassword([FromBody] string userId)
    {
        var result = await _authService.ResetPasswordAsync(userId);
        if (result) return Ok(ApiResponse<bool>.Succeed(result, _localizer.Get(MsgKey.Auth.PasswordReseted)));
        return Ok(ApiResponse<bool>.Fail(_localizer.Get(MsgKey.Common.Failed)));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _authService.ChangePasswordAsync(dto.OldPassword, dto.NewPassword);
        if (result) return Ok(ApiResponse<bool>.Succeed(result, _localizer.Get(MsgKey.Auth.PasswordChanged)));
        return Ok(ApiResponse<bool>.Fail(_localizer.Get(MsgKey.Common.Failed)));
    }
    
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ForgotPasswordDto dto)
    {
        var result = await _authService.ForgotPasswordAsync(dto);
        if (result) return Ok(ApiResponse<bool>.Succeed(result, _localizer.Get(MsgKey.Auth.PasswordReseted)));
        return Ok(ApiResponse<bool>.Fail(_localizer.Get(MsgKey.Common.Failed)));
    }
}