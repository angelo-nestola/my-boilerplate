using FluentValidation;

namespace CleanApi.Application.Features.Organization;

public class CreateOrgUnitValidator : AbstractValidator<CreateOrgUnitDto>
{
    public CreateOrgUnitValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.Domain).MaximumLength(200);
    }
}

public class UpdateOrgUnitValidator : AbstractValidator<UpdateOrgUnitDto>
{
    public UpdateOrgUnitValidator()
    {
        RuleFor(x => x.Name).MaximumLength(200).When(x => x.Name != null);
        RuleFor(x => x.Description).MaximumLength(2000).When(x => x.Description != null);
        RuleFor(x => x.Domain).MaximumLength(200).When(x => x.Domain != null);
        RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
    }
}

public class CreatePersonValidator : AbstractValidator<CreatePersonDto>
{
    public CreatePersonValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Notes).MaximumLength(2000);
    }
}

public class UpdatePersonValidator : AbstractValidator<UpdatePersonDto>
{
    public UpdatePersonValidator()
    {
        RuleFor(x => x.FirstName).MaximumLength(100).When(x => x.FirstName != null);
        RuleFor(x => x.LastName).MaximumLength(100).When(x => x.LastName != null);
        RuleFor(x => x.Email).EmailAddress().MaximumLength(256).When(x => x.Email != null);
        RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes != null);
        RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
    }
}

public class CreateOrgAssignmentValidator : AbstractValidator<CreateOrgAssignmentDto>
{
    public CreateOrgAssignmentValidator()
    {
        RuleFor(x => x.PersonId).NotEmpty();
        RuleFor(x => x.OrgUnitId).NotEmpty();
        RuleFor(x => x.OrgRoleId).NotEmpty();
        RuleFor(x => x.ValidFrom).NotEmpty();
        RuleFor(x => x.ValidTo).GreaterThan(x => x.ValidFrom)
            .When(x => x.ValidTo.HasValue)
            .WithMessage("ValidTo must be after ValidFrom");
    }
}
