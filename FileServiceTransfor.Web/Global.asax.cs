using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace FileServiceTransfor.Web
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            FileInfo fileInfo = new FileInfo(AppDomain.CurrentDomain.BaseDirectory + "bin\\log4net.config");
            log4net.Config.XmlConfigurator.ConfigureAndWatch(fileInfo);
        }
    }
}
