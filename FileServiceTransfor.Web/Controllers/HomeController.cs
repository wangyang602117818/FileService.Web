using FileService.Util;
using FileServiceTransfor.Web.Models;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
            file.InputStream.Close();
            file.InputStream.Dispose();
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        public ActionResult GetCacheFiles()
        {
            string path = Request.Headers["path"];
            string cacheFiles = ServerState.GetCacheFiles(path);
            return new ResponseModel<string>(ErrorCode.success, cacheFiles);
        }
        [HttpPost]
        public ActionResult DeleteCacheFiles(IEnumerable<string> notdeletepaths)
        {
            string path = Request.Headers["path"];
            int count = 0;
            DirectoryInfo[] directoryInfos = new DirectoryInfo(path).GetDirectories();
            if (notdeletepaths == null) notdeletepaths = new List<string>() { };
            count = ServerState.DeleteAllCacheFiles(path, notdeletepaths);
            return new ResponseModel<int>(ErrorCode.success, count);
        }
        [HttpPost]
        public ActionResult CheckFileExists(string relativePath)
        {
            string path = Request.Headers["path"];
            string fullPath = path + relativePath;
            return new ResponseModel<bool>(ErrorCode.success, System.IO.File.Exists(fullPath));
        }
        [HttpPost]
        public ActionResult DeleteCacheFile(string relativePath)
        {
            string path = Request.Headers["path"];
            string fullPath = path + relativePath;
            if (System.IO.File.Exists(fullPath)) System.IO.File.Delete(fullPath);
            return new ResponseModel<bool>(ErrorCode.success, true);
        }
        public ActionResult GetCacheFile(string relativePath)
        {
            string path = Request.Headers["path"];
            string fullPath = path + relativePath;
            if (System.IO.File.Exists(fullPath))
            {
                FileStream fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
                return File(fullPath, "application/octet-stream", Path.GetFileName(fullPath));
            }
            return File(new MemoryStream(), "application/octet-stream");
        }
    }
}