namespace Core.Domain.Constants;

public static class MsgKey
{
    public static class Common
    {
        public const string CreateSuccess = "Common.Create.Success";
        public const string UpdateSuccess = "Common.Update.Success";
        public const string DeleteSuccess = "Common.Delete.Success";
        public const string SaveSuccess = "Common.Save.Success";
        public const string Success = "Common.Success";
        public const string Failed = "Common.Failed";
    }

    public static class Error
    {
        public const string NotFound = "Error.NotFound";
        public const string Forbidden = "Error.Forbidden";
        public const string Unauthorized = "Error.Unauthorized";
        public const string InternalServer = "Error.InternalServer";
        public const string BadRequest = "Error.BadRequest";
        public const string Conflict = "Error.Conflict";
        public const string InUse = "Error.InUse";
        public const string CannotDelete = "Error.CannotDelete";
    }

    public static class Validation
    {
        public const string Required = "Validation.Required";
        public const string MaxLength = "Validation.MaxLength";
        public const string MinLength = "Validation.MinLength";
        public const string RangeLength = "Validation.RangeLength";
        public const string Min = "Validation.Min";
        public const string Max = "Validation.Max";
        public const string Range = "Validation.Range";
        public const string InvalidFormat = "Validation.InvalidFormat";
        public const string InvalidEmail = "Validation.InvalidEmail";
        public const string InvalidPhone = "Validation.InvalidPhone";
        public const string InvalidDate = "Validation.InvalidDate";
        public const string StartDateGreaterThanEndDate = "Validation.StartDateGreaterThanEndDate";
        public const string Duplicate = "Validation.Duplicate";
        public const string MustBePositive = "Validation.MustBePositive";
        public const string MustBeInteger = "Validation.MustBeInteger";
        public const string InvalidReference = "Validation.InvalidReference";
        public const string CodeExisted = "Validation.CodeExisted";
        public const string InCorrectPassword = "Validation.InCorrectPassword";
        public const string TokenInvalid = "Validation.TokenInvalid";
    }

    public static class Workflow
    {
        public const string SubmitSuccess = "Workflow.Submit.Success";
        public const string ApproveSuccess = "Workflow.Approve.Success";
        public const string RejectSuccess = "Workflow.Reject.Success";
        public const string CancelSuccess = "Workflow.Cancel.Success";
        public const string CloseSuccess = "Workflow.Close.Success";
        public const string ReopenSuccess = "Workflow.Reopen.Success";
        public const string InvalidTransition = "Workflow.InvalidTransition";
    }

    public static class Auth
    {
        public const string PasswordChanged = "Auth.Password.Changed";
        public const string PasswordMismatch = "Auth.Password.Mismatch";
        public const string AccountLocked = "Auth.Account.Locked";
        public const string SessionExpired = "Auth.Session.Expired";
        public const string TokenInvalid = "Auth.Token.Invalid";
        public const string LoginFailed = "Auth.Login.Failed";
        public const string LoginSuccess = "Auth.Login.Success";
        public const string PasswordReseted = "Auth.Password.Reseted";
        public const string LogoutSuccess = "Auth.Logout.Success";
    }

    public static class Import
    {
        public const string Success = "Import.Success";
        public const string Partial = "Import.Partial";
        public const string Failed = "Import.Failed";
        public const string InvalidFileFormat = "Import.InvalidFileFormat";
        public const string FileTooLarge = "Import.FileTooLarge";
    }

    public static class Export
    {
        public const string Failed = "Export.Failed";
        public const string NoData = "Export.NoData";
    }

    public static class Upload
    {
        public const string Success = "Upload.Success";
        public const string Failed = "Upload.Failed";
        public const string InvalidType = "Upload.InvalidType";
        public const string TooLarge = "Upload.TooLarge";
        public const string NoFileUploaded = "Upload.NoFileUploaded";
    }

    public static class Role
    {
        public const string Existed = "Role.Existed";
        public const string NotFound = "Role.NotFound";
        public const string Protected = "Role.Protected";
        public const string NotAllowEdit = "Role.NotAllowEdit";
    }

    public static class User
    {
        public const string Existed = "User.Existed";
        public const string NotFound = "User.NotFound";
        public const string NotAllowed = "User.NotAllowed";
        public const string EmailExisted = "User.EmailExisted";
        public const string PhoneExisted = "User.PhoneExisted";
        public const string ChangeEmailSubject = "User.ChangeEmailSubject";
        public const string EmailChangedNotiSubject = "User.EmailChangedNotiSubject";

    }

}