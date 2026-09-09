using Domain.Enums;

namespace Domain.Entities;

public class RequestItem
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Payload { get; private set; } = string.Empty;
    public string Type { get; private set; } = string.Empty;
    public RequestStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // Constructor privado para EF Core / Encapsulamiento
    private RequestItem() { }

    public RequestItem(Guid id, string name, string payload, string type, DateTime createdAt)
    {
        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        Name = name;
        Payload = payload;
        Type = type;
        Status = RequestStatus.Pending;
        CreatedAt = createdAt == default ? DateTime.UtcNow : createdAt;
    }

    public void MarkAsProcessed()
    {
        Status = RequestStatus.Processed;
    }

    public void MarkAsFailed()
    {
        Status = RequestStatus.Failed;
    }

    public void UpdatePayload(string newPayload)
    {
        Payload = newPayload;
    }
}