using FileService.Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    public class BaseController : Controller
    {
        public Log log = new Log();
        public void Log(string fileId, string content)
        {
            log.Insert(Request.Headers["AuthCode"], fileId, content,
                Request.Headers["UserName"] ?? User.Identity.Name,
                Request.Headers["UserIp"] ?? Request.UserHostAddress,
                Request.Headers["UserAgent"] ?? Request.UserAgent);
        }
        public void LogInRecord(string content, string userName)
        {
            log.Insert(Request.Headers["AuthCode"], "-", content, userName,
                Request.Headers["UserIp"] ?? Request.UserHostAddress,
                Request.Headers["UserAgent"] ?? Request.UserAgent);
        }
    }
}