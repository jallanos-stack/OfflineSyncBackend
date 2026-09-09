using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class RequestRepository : IRequestRepository
{
    private readonly ApplicationDbContext _context;

    public RequestRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(RequestItem request, CancellationToken cancellationToken = default)
    {
        await _context.Requests.AddAsync(request, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<RequestItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Requests.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<RequestItem>> GetPendingAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Requests
            .Where(r => r.Status == RequestStatus.Pending)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(RequestItem request, CancellationToken cancellationToken = default)
    {
        _context.Requests.Update(request);
        await _context.SaveChangesAsync(cancellationToken);
    }
}