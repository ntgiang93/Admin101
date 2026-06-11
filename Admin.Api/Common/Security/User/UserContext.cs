using Common.Security.User;

namespace Admin.Api.Common.Security.User
{
    public class UserContext
    {
        private static readonly AsyncLocal<CurrentUser?> _currentUser = new();

        public static CurrentUser? Current
        {
            get => _currentUser.Value;
            set => _currentUser.Value = value;
        }

        public static void Clear()
        {
            _currentUser.Value = null;
        }
    }
}