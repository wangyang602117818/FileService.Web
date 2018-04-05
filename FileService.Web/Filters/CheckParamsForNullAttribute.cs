using FileService.Web.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Web.Mvc;

namespace FileService.Web.Filters
{
    /// <summary>
    /// 检测方法的参数是否为null
    /// </summary>
    [AttributeUsage(AttributeTargets.Method, Inherited = true)]
    public class CheckParamsForNullAttribute : ActionFilterAttribute
    {
        /// <summary>
        /// Action运行前，如果验证不通过，
        /// </summary>
        /// <param name="actionContext"></param>
        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            IDictionary<string, string> invalid_params = CheckParams(actionContext.ActionParameters);
            if (invalid_params.Count > 0)
            {
                actionContext.Result = new ResponseModel<IDictionary<string, string>>(ErrorCode.params_valid_fault, invalid_params);
            }
        }
        /// <summary>
        /// 传入请求参数，返回不合法的参数列表
        /// </summary>
        /// <param name="dictionary"></param>
        /// <returns></returns>
        public Dictionary<string, string> CheckParams(IDictionary<string, object> dictionary)
        {
            Dictionary<string, string> invalid_params = new Dictionary<string, string>();
            foreach (KeyValuePair<string, object> keyValuePair in dictionary)
            {
                if (keyValuePair.Value == null) invalid_params.Add(keyValuePair.Key, "the "+ keyValuePair.Key + " field is required");
            }
            return invalid_params;
        }
    }
}