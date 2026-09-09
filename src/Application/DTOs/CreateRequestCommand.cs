namespace Application.DTOs;

public record CreateRequestCommand(
    Guid? Id,
    string Name,
    string Payload,
    string Type,
    DateTime? CreatedAt
);