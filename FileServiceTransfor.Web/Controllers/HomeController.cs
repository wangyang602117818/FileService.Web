using FileServiceTransfor.Web.Models;
using System;
using System.IO;
using System.Web;
using System.Web.Mvc;

namespace FileServiceTransfor.Web.Controllers
{
    public class HomeController : Controller
    {
        public static string saveToFolder = System.Configuration.ConfigurationManager.AppSettings["saveToFolder"] + DateTime.Now.ToString("yyyyMMdd") + "\\";
        public ActionResult Index()
        {
            return Content("ok");
        }
        public ActionResult SaveFile(HttpPostedFileBase file)
        {
            if (!Directory.Exists(saveToFolder)) Directory.CreateDirectory(saveToFolder);
            file.SaveAs(saveToFolder + file.FileName);
            return new ResponseModel<string>(ErrorCode.success, "");
        }
    }
}