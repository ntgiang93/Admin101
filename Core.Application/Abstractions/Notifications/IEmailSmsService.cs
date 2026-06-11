using Core.Application.Notification;

namespace Core.Application.Abstractions.Notifications
{
    public interface IEmailSmsService
    {
        Task SendSMTPEmailAsync(EmailMessage message);
        Task SendSmsAsync(string phoneNumber, string message);
        Task<string> GetEmailTemplate(string templateName);
    }
}