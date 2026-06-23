using System.Collections;
using System.Linq.Expressions;
using SqlKata;

namespace Shared.Common.Extensions
{
    public static class SqlKataColumnHelper
    {
        public static string GetColumn<TEntity, TProperty>(
            string alias,
            Expression<Func<TEntity, TProperty>> expression)
        {
            var body = expression.Body;

            if (body is UnaryExpression unary)
                body = unary.Operand;

            var member = (MemberExpression)body;

            return $"{alias}.{member.Member.Name.ToSnakeCase()}";
        }
    }

    public static class SqlKataExtensions
    {
        public static Query Where<TEntity, TProperty>(
            this Query query,
            Alias<TEntity> alias,
            Expression<Func<TEntity, TProperty>> column,
            object value)
        {
            return query.Where(alias.Col(column), value);
        }

        public static Query Where<TEntity, TProperty>(
        this Query query,
        Alias<TEntity> alias,
        Expression<Func<TEntity, TProperty>> column,
        string operatorSymbol,
        object value)
        {
            return query.Where(alias.Col(column), operatorSymbol, value);
        }

        public static Query WhereLike<TEntity, TProperty>(
            this Query query,
            Alias<TEntity> alias,
            Expression<Func<TEntity, TProperty>> column,
            object value,
            bool caseSensitive = false)
        {
            return query.WhereLike(alias.Col(column), value, caseSensitive: caseSensitive);
        }

        public static Query OrWhereLike<TEntity, TProperty>(
            this Query query,
            Alias<TEntity> alias,
            Expression<Func<TEntity, TProperty>> column,
            object value,
            bool caseSensitive = false)
        {
            return query.OrWhereLike(alias.Col(column), value, caseSensitive: caseSensitive);
        }

        public static Query WhereNot<TEntity, TProperty>(
        this Query query,
        Alias<TEntity> alias,
        Expression<Func<TEntity, TProperty>> column,
        object value)
        {
            return query.WhereNot(alias.Col(column), value);
        }
        public static Query WhereIn<TEntity, TProperty>(
        this Query query,
        Alias<TEntity> alias,
        Expression<Func<TEntity, TProperty>> column,
        IEnumerable<object> values)
        {
            return query.WhereIn(alias.Col(column), values);
        }

        public static Query WhereNull<TEntity, TProperty>(
        this Query query,
        Alias<TEntity> alias,
        Expression<Func<TEntity, TProperty>> column)
        {
            return query.WhereNull(
                alias.Col(column));
        }

        public static Query OrderBy<TEntity, TProperty>(
        this Query query,
        Alias<TEntity> alias,
        Expression<Func<TEntity, TProperty>> column)
        {
            return query.OrderBy(
                alias.Col(column));
        }

        public static Query OrderByDesc<TEntity, TProperty>(
        this Query query,
        Alias<TEntity> alias,
        Expression<Func<TEntity, TProperty>> column)
        {
            return query.OrderByDesc(
                alias.Col(column));
        }

        public static Query Select<TEntity, TProperty>(
        this Query query,
        Alias<TEntity> alias,
        Expression<Func<TEntity, TProperty>> column)
        {
            return query.Select(
                alias.Col(column));
        }

        public static Query Select<TEntity>(
        this Query query,
        Alias<TEntity> alias,
        params Expression<Func<TEntity, object>>[] columns)
        {
            var result = columns
                .Select(x =>
                    alias.Col(x))
                .ToArray();

            return query.Select(result);
        }

        public static Query AsInsertIgnore<TEntity>(
            this Query query,
            TEntity entity,
            params string[] ignoreColumns)
        {
            var alias = new Alias<TEntity>("t");
            var ignoredSet = new HashSet<string>(
                ignoreColumns, StringComparer.OrdinalIgnoreCase);

            var data = typeof(TEntity)
                .GetProperties()
                .Where(p => !ignoredSet.Contains(p.Name))
                .ToDictionary(
                    p => alias.UseSnakeCase ? p.Name.ToSnakeCase() : p.Name,
                    p => p.GetValue(entity)
                );
            return query.AsInsert(data, true);
        }

        public static Dictionary<string, object?> ToDictionary<TEntity>(this TEntity entity, params string[] ignoreColumns)
        {
            var alias = new Alias<TEntity>("t");
            var ignoredSet = new HashSet<string>(
                ignoreColumns, StringComparer.OrdinalIgnoreCase);

            var data = typeof(TEntity)
                .GetProperties()
                .Where(p => !ignoredSet.Contains(p.Name))
                .ToDictionary(
                    p => alias.UseSnakeCase ? p.Name.ToSnakeCase() : p.Name,
                    p => p.GetValue(entity)
                );
            return data;
        }
    }
}
