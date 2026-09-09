using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Entities;
using Domain.Repositories;
using FluentValidation;

namespace Application.Services;

public class RequestService : IRequestService
{
    private readonly IRequestRepository _repository;
    private readonly IValidator<CreateRequestCommand> _validator;

    public RequestService(IRequestRepository repository, IValidator<CreateRequestCommand> validator)
    {
        _repository = repository;
        _validator = validator;
    }

    public async Task<Result<RequestDto>> CreateAsync(CreateRequestCommand command, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage));
            return Result<RequestDto>.Failure(errors);
        }

        var request = new RequestItem(
            command.Id ?? Guid.NewGuid(),
            command.Name,
            command.Payload,
            command.Type,
            command.CreatedAt ?? DateTime.UtcNow
        );

        await _repository.AddAsync(request, cancellationToken);

        var dto = new RequestDto(
            request.Id,
            request.Name,
            request.Payload,
            request.Type,
            request.Status,
            request.CreatedAt
        );

        return Result<RequestDto>.Success(dto);
    }

    public async Task<Result<IEnumerable<RequestDto>>> GetPendingAsync(CancellationToken cancellationToken = default)
    {
        var items = await _repository.GetPendingAsync(cancellationToken);
        var dtos = items.Select(r => new RequestDto(r.Id, r.Name, r.Payload, r.Type, r.Status, r.CreatedAt));
        return Result<IEnumerable<RequestDto>>.Success(dtos);
    }

    public async Task<Result<RequestDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var request = await _repository.GetByIdAsync(id, cancellationToken);
        if (request is null)
        {
            return Result<RequestDto>.Failure($"No se encontró la solicitud con el ID: {id}");
        }

        var dto = new RequestDto(
            request.Id,
            request.Name,
            request.Payload,
            request.Type,
            request.Status,
            request.CreatedAt
        );

        return Result<RequestDto>.Success(dto);
    }
}