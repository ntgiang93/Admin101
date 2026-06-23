using Autofac;
using Core.Application;
using Core.Application.Abstractions.Common;
using Core.Application.Abstractions.Localizer;
using Core.Application.Abstractions.Message;
using Core.Application.Abstractions.Persistence;
using Core.Application.Services.Common;
using Core.Infrastructure;
using Core.Infrastructure.Localizer;
using Core.Infrastructure.Persistence;

namespace Admin.Api.DependencyInjection;

public class AutofacModule : Autofac.Module
{
    protected override void Load(ContainerBuilder builder)
    {
        builder.RegisterType<SysCategoryLocalizer>()
            .As<ISysCategoryLocalizer>()
            .AsSelf()
            .InstancePerLifetimeScope();
        builder.RegisterType<MessageLocalizer>()
            .As<IMessageLocalizer>()
            .AsSelf()
            .InstancePerLifetimeScope();
        // Register generic repository and service types
        builder.RegisterGeneric(typeof(GenericRepository<,>))
            .As(typeof(IGenericRepository<,>))
            .InstancePerLifetimeScope();

        builder.RegisterGeneric(typeof(GenericService<,>))
            .As(typeof(IGenericService<,>))
            .InstancePerLifetimeScope();

        // Scan application assembly for service implementations
        var applicationAssembly = typeof(IApplicationAssemblyMarker).Assembly;
        // Scan infrastructure assembly for repository implementations
        var infrastructureAssembly = typeof(IInfrastructureAssemblyMarker).Assembly;

        if (infrastructureAssembly != null)
        {
            builder.RegisterAssemblyTypes(infrastructureAssembly)
                .Where(t =>
                    t.Name.EndsWith("Repository") &&
                    !t.IsGenericType && !t.IsAbstract)
                .AsImplementedInterfaces()
                .InstancePerLifetimeScope();
            builder.RegisterAssemblyTypes(infrastructureAssembly)
                .Where(t =>
                    t.Name.EndsWith("Service") &&
                    !t.IsGenericType && !t.IsAbstract)
                .AsImplementedInterfaces()
                .InstancePerLifetimeScope();
        }

        if (applicationAssembly != null)
        {
            builder.RegisterAssemblyTypes(applicationAssembly)
                .Where(t =>
                    t.Name.EndsWith("Service") &&
                    !t.IsGenericType && !t.IsAbstract)
                .AsImplementedInterfaces()
                .InstancePerLifetimeScope();
        }
    }
}