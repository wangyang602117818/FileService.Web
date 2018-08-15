using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    public class SharedController : Controller
    {
        // GET: Shared
        public ActionResult Index(string id)
        {
            
            return View();
        }
    }
}