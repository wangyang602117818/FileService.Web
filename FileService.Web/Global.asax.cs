using FileService.Util;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Management;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;

namespace FileService.Web
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            //AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            FileInfo fileInfo = new FileInfo(AppDomain.CurrentDomain.BaseDirectory + "bin\\log4net.config");
            log4net.Config.XmlConfigurator.ConfigureAndWatch(fileInfo);

        }
        protected void Application_AuthorizeRequest(object sender, System.EventArgs e)
        {
            HttpApplication App = (HttpApplication)sender;
            HttpContext Ctx = App.Context;
            if (Ctx.Request.IsAuthenticated == true)
            {
                FormsIdentity id = (FormsIdentity)Ctx.User.Identity;
                string[] Roles = id.Ticket.UserData.Split(',');
                Ctx.User = new GenericPrincipal(id, Roles);
            }
        }
       
    }
}
