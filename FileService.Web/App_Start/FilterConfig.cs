using FileService.Web.Filters;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new MyAuthorizeAttribute());
            filters.Add(new MyHandleErrorAttribute());
            filters.Add(new CheckParamsForNullAttribute());
            filters.Add(new ValidateModelStateAttribute());
        }
    }
}
