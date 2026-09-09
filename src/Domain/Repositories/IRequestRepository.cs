using Domain.Entities;

namespace Domain.Repositories;

public interface IRequestRepository
{
    Task AddAsync(RequestItem request, CancellationToken cancellationToken = default);
    Task<RequestItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<RequestItem>> GetPendingAsync(CancellationToken cancellationToken = default);
    Task UpdateAsync(RequestItem request, CancellationToken cancellationToken = default);
}