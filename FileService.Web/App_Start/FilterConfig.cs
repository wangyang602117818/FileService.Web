using FileService.Web.Filters;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            //判断登录过的user是否有权限访问相应的资源
            filters.Add(new MyAuthorizeAttribute()); 
            //filters.Add(new AppAuthorizeAttribute());   
            filters.Add(new MyHandleErrorAttribute());
            filters.Add(new CheckParamsForNullAttribute());
            filters.Add(new ValidateModelStateAttribute());
        }
    }
}
