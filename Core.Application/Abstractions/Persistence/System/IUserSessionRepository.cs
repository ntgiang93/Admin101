using Core.Domain.Entities.System;

namespace Core.Application.Abstractions.Persistence.System;

public interface IUserSessionRepository : IGenericRepository<UserToken, long>
{
}