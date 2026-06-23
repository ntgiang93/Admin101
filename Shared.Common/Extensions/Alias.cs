using System.ComponentModel.DataAnnotations.Schema;
using System.Linq.Expressions;
using System.Reflection;

namespace Shared.Common.Extensions
{
    public class Alias<TEntity>
    {
        private readonly string _alias;
        public readonly bool UseSnakeCase = true;

        public Alias(string alias)
        {
            _alias = alias;
        }
        public string RawTable => GetTableName();
        public string Table => $"{GetTableName()} as {_alias}";
        /// <summary>
        /// Gets the column name with alias for the specified property expression.
        /// For example, if the alias is "u" and the expression is x => x.UserName, it will return "u.user_name".
        /// </summary>
        /// <typeparam name="TProperty"></typeparam>
        /// <param name="expression"></param>
        /// <param name="withoutAlias"></param>
        /// <returns></returns>
        /// <exception cref="ArgumentException"></exception>
        // get column name with alias

        public string Col<TProperty>(Expression<Func<TEntity, TProperty>> expression, bool withoutAlias = false)
            => ColFromExpression(expression.Body, withoutAlias);
        /// <summary>
        /// Gets the column name with alias for the specified expression.
        /// The expression can be a MemberExpression or a UnaryExpression (for value types).
        /// </summary>
        /// <param name="expression"></param>
        /// <param name="withoutAlias"></param>
        /// <returns></returns>
        public string Col(Expression expression, bool withoutAlias = false)
            => ColFromExpression(expression, withoutAlias);

        // Hàm private dùng chung
        private string ColFromExpression(Expression expression, bool withoutAlias = false)
        {
            // Unwrap Convert
            if (expression is UnaryExpression { NodeType: ExpressionType.Convert } unary)
                expression = unary.Operand;

            if (expression is not MemberExpression member)
                throw new ArgumentException(
                    $"Expected MemberExpression, got '{expression.NodeType}': {expression}");
            if (withoutAlias) return $"{(UseSnakeCase ? member.Member.Name.ToSnakeCase() : member.Member.Name)}";
            return $"{_alias}.{(UseSnakeCase ? member.Member.Name.ToSnakeCase() : member.Member.Name)}";
        }

        /// <summary>
        /// Gets the database table name for the specified entity type.
        /// First checks for [Table] attribute, if found returns the attribute's Name property.
        /// If no [Table] attribute is found, returns the entity class name.
        /// </summary>
        /// <typeparam name="TEntity">The entity type to get table name for</typeparam>
        /// <returns>
        /// The database table name. Returns the value from [Table(Name = "TableName")] attribute 
        /// if present, otherwise returns the entity class name.
        /// </returns>
        /// <example>
        /// <code>
        /// // For entity with [Table("Users")] attribute
        /// string tableName = StringHelper.GetTableName&lt;User&gt;(); // Returns "Users"
        /// 
        /// // For entity without [Table] attribute  
        /// string tableName = StringHelper.GetTableName&lt;Product&gt;(); // Returns "Product"
        /// </code>
        /// </example>
        private string GetTableName()
        {
            // Get Type of TEntity
            Type entityType = typeof(TEntity);

            // Find TableAttribute
            var tableAttribute = entityType.GetCustomAttribute<TableAttribute>();

            if (tableAttribute != null && !string.IsNullOrWhiteSpace(tableAttribute.Name))
            {
                // if TableAttribute is found and has a valid Name, return it
                return tableAttribute.Name;
            }
            else
            {
                return UseSnakeCase ? entityType.Name.ToSnakeCase() : entityType.Name;
            }
        }
    }
}
