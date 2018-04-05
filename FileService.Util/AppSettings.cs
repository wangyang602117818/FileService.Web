using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Util
{
    public class AppSettings
    {
        public static string mongodb = ConfigurationManager.AppSettings["mongodb"];
        public static string database = ConfigurationManager.AppSettings["database"];
        public static string handlerId = ConfigurationManager.AppSettings["handlerId"];
        public static int taskCount = Convert.ToInt32(ConfigurationManager.AppSettings["taskCount"]);
        public static string libreOffice= ConfigurationManager.AppSettings["libreOffice"];
    }
}
