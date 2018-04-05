using FileService.Web.Models;
using FileService.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web.Filters
{
    ///<summary>
    ///自定义mvc异常处理
    ///</summary>
    public class MyHandleErrorAttribute : HandleErrorAttribute
    {
        public override void OnException(ExceptionContext filterContext)
        {
            //设置错误已处理
            filterContext.ExceptionHandled = true;
            //记录错误日志
            Log4Net.ErrorLog(filterContext.Exception);
            //返回
            filterContext.Result = new ResponseModel<string>(ErrorCode.server_exception, filterContext.Exception.Message);
        }
    }
}