using FileService.Business;
using FileService.Util;
using FileService.Web.Models;
using MongoDB.Bson;
using System.Web.Mvc;

namespace FileService.Web.Filters
{
    /// <summary>
    /// 验证从第三方请求过来的headers里面是否带有authCode
    /// 并验证authCode是否正确，如果不正确直接阻止提交
    /// </summary>
    public class AppAuthorizeAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);
            string authCode = filterContext.HttpContext.Request.Headers["AuthCode"];
            if (string.IsNullOrEmpty(authCode))
            {
                filterContext.Result = new ResponseModel<string>(ErrorCode.authcode_is_null, "");
            }
            else
            {
                BsonDocument application = new Application().FindByAuthCode(authCode);
                if (application == null)
                {
                    filterContext.Result = new ResponseModel<string>(ErrorCode.app_not_exist, "");
                }
                else if (application["Action"] == "block")
                {
                    filterContext.Result = new ResponseModel<string>(ErrorCode.app_blocked, "");
                }
                else
                {
                    filterContext.HttpContext.Request.Headers.Add("AppName", application["ApplicationName"].AsString);
                }
            }
        }
    }
    /// <summary>
    /// 验证从第三方请求过来的headers里面是否带有authCode
    /// 并验证authCode是否正确，如果不正确则设置默认值
    /// </summary>
    public class AppAuthorizeDefaultAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);
            string authCode = filterContext.HttpContext.Request.Headers["AuthCode"];
            if (string.IsNullOrEmpty(authCode))
            {
                filterContext.HttpContext.Request.Headers.Add("AuthCode", AppSettings.authCode);
                filterContext.HttpContext.Request.Headers.Add("AppName", AppSettings.appName);
            }
            else
            {
                BsonDocument application = new Application().FindByAuthCode(authCode);
                if (application == null)
                {
                    filterContext.HttpContext.Request.Headers.Add("AuthCode", AppSettings.authCode);
                    filterContext.HttpContext.Request.Headers.Add("AppName", AppSettings.appName);
                }
                else
                {
                    filterContext.HttpContext.Request.Headers.Add("AppName", application["ApplicationName"].AsString);
                }
            }
        }
    }
}