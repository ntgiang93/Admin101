using System.Globalization;

namespace Admin.Api.Middleware;

public class LanguageMiddleware
{
    private readonly RequestDelegate _next;
    public LanguageMiddleware(RequestDelegate next)
    {
        _next = next;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        // get language from "Accept-Language"
        var language = context.Request.Headers["Accept-Language"].ToString();

        // default language is "vi"
        if (string.IsNullOrEmpty(language) || (language != "en" && language != "vi"))
        {
            language = "vi";
        }

        // Lưu ngôn ngữ vào HttpContext để các phần khác có thể truy cập
        context.Items["Language"] = language;
        if (!string.IsNullOrEmpty(language))
        {
            var culture = new CultureInfo(language);

            CultureInfo.CurrentCulture = culture;
            CultureInfo.CurrentUICulture = culture;
        }

        // Tiếp tục xử lý request
        await _next(context);
    }
}