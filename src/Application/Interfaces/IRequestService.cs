using Application.DTOs;
using Domain.Common;

namespace Application.Interfaces;

public interface IRequestService
{
    Task<Result<RequestDto>> CreateAsync(CreateRequestCommand command, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<RequestDto>>> GetPendingAsync(CancellationToken cancellationToken = default);
    Task<Result<RequestDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}