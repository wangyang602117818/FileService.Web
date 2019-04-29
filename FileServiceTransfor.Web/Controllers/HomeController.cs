using FileService.Util;
using FileServiceTransfor.Web.Models;
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
            string path = Request.Headers["path"];
            if (string.IsNullOrEmpty(path)) return new ResponseModel<string>(ErrorCode.invalid_params, "");
            if (!Directory.Exists(path)) Directory.CreateDirectory(path);
            file.SaveAs(path + file.FileName);
            Log4Net.InfoLog("save file:" + file.FileName);
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        public ActionResult GetCacheFiles()
        {
            string path = Request.Headers["path"];
            string cacheFiles = ServerState.GetCacheFiles(path);
            return new ResponseModel<string>(ErrorCode.success, cacheFiles);
        }
    }
}