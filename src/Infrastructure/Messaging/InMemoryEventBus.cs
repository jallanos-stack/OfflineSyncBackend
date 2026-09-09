using Application.Interfaces;
using Microsoft.Extensions.Logging;
using Polly;

namespace Infrastructure.Messaging;

public class InMemoryEventBus : IEventBus
{
    private readonly ILogger<InMemoryEventBus> _logger;

    public InMemoryEventBus(ILogger<InMemoryEventBus> logger)
    {
        _logger = logger;
    }

    public async Task PublishAsync<T>(T message, CancellationToken cancellationToken = default)
    {
        // Definición de política de reintentos con Polly (3 reintentos con retardo exponencial)
        var retryPolicy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning("Reintento {RetryCount} al publicar evento. Motivo: {Message}", retryCount, exception.Message);
                });

        await retryPolicy.ExecuteAsync(async () =>
        {
            _logger.LogInformation("Simulando envío asíncrono de mensaje al Event Bus: {Message}", message);
            await Task.Delay(100, cancellationToken); // Simulación de I/O de red
        });
    }
}