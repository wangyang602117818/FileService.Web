using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FileService.Web.Models
{
    public enum ErrorCode
    {

        /// <summary>
        /// 成功
        /// </summary>
        success = 0,
        redirect = 1,
        authorize_fault = 2,
        /// <summary>
        /// 记录不存在
        /// </summary>
        record_not_exist = 100,
        /// <summary>
        /// 参数不合法错误，主要针对null值
        /// </summary>
        invalid_params = 101,
        /// <summary>
        /// 参数验证失败，主要正对ModelState验证结果
        /// </summary>
        params_valid_fault = 102,
        /// <summary>
        /// url不存在错误
        /// </summary>
        uri_not_found = 110,
        appname_not_exist = 111,
        username_exist = 112,
        login_fault = 140,
        task_not_completed = 150,
        /// <summary>
        /// 权限错误
        /// </summary>
        error_permission = 200,
        server_exception = -1000,
        unknow_error = -1001,
    }
}