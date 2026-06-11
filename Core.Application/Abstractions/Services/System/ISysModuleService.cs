using Core.Application.Contracts.Base;
using Core.Domain.Security;

namespace Core.Application.Abstractions.Services.System;

public interface ISysModuleService
{
    Task<List<SelectOption<string>>> GetModuleOptionsAsync(string? languageCode = null);
}

