using Domain.Enums;

namespace Application.DTOs;

public record RequestDto(
    Guid Id,
    string Name,
    string Payload,
    string Type,
    RequestStatus Status,
    DateTime CreatedAt
);