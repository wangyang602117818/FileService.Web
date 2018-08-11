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

            var fileDirectory = AppDomain.CurrentDomain.BaseDirectory + AppSettings.tempFileDir;
            if (!Directory.Exists(fileDirectory))
            {
                //创建文件夹
                DirectoryInfo directoryInfo = Directory.CreateDirectory(fileDirectory);
                //获取文件夹权限
                DirectorySecurity directorySecurity = directoryInfo.GetAccessControl();
                //添加文件夹权限
                directorySecurity.AddAccessRule(new FileSystemAccessRule("Everyone", FileSystemRights.FullControl, AccessControlType.Allow));
                //设置文件夹权限
                directoryInfo.SetAccessControl(directorySecurity);
            }
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
