using FileServiceTransfor.Web.Models;
using System;
using System.IO;
using System.Web;
using System.Web.Mvc;

namespace FileServiceTransfor.Web.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return Content("ok");
        }
        public ActionResult SaveFile(HttpPostedFileBase file)
        {
            string savePath = Request.Headers["savePath"];
            if(string.IsNullOrEmpty(savePath)) return new ResponseModel<string>(ErrorCode.invalid_params, "");
            if (!Directory.Exists(savePath)) Directory.CreateDirectory(savePath);
            file.SaveAs(savePath + file.FileName);
            return new ResponseModel<string>(ErrorCode.success, "");
        }
    }
}