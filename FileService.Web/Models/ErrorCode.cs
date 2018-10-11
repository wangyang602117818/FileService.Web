namespace FileService.Web.Models
{
    public enum ErrorCode
    {
        /// <summary>
        /// 成功
        /// </summary>
        
        success = 0,
        /// <summary>
        /// 重定向
        /// </summary>
        redirect = 1,
        /// <summary>
        /// 权限不足
        /// </summary>
        authorize_fault = 100,
        authcode_is_null = 101,
        app_not_exist = 102,
        app_blocked = 103,
        error_permission = 104,
        invalid_params = 105,
        params_valid_fault = 106,
        owner_not_match = 107,
        /// <summary>
        /// 不存在
        /// </summary>
        record_not_exist = 200,
        uri_not_found = 201,
        username_exist = 202,
        login_fault = 203,
        task_not_completed = 204,
        invalid_password = 205,
        /// <summary>
        /// 已存在
        /// </summary>
        record_exist=400,
        /// <summary>
        /// 任务未完成
        /// </summary>
        task_not_complete = 300,
        /// <summary>
        /// 未知错误
        /// </summary>
        server_exception = -1000,
        unknow_error = -1001,
    }
}