using Application.DTOs;
using FluentValidation;

namespace Application.Validators;

public class CreateRequestCommandValidator : AbstractValidator<CreateRequestCommand>
{
    public CreateRequestCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre de la solicitud es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no debe superar los 100 caracteres.");

        RuleFor(x => x.Payload)
            .NotEmpty().WithMessage("El payload no puede estar vacío.");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("El tipo de procesamiento es obligatorio.");
    }
}