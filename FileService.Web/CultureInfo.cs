using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;

namespace FileService.Web
{
    public static class CultureInfo
    {
        public static string GetCulture()
        {
            var httpCookie = HttpContext.Current.Request.Cookies["culture"];
            if (httpCookie != null) return httpCookie.Value;
            return Thread.CurrentThread.CurrentUICulture.Name;
        }
    }
}