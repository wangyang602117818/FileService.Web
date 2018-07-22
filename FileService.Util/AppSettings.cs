using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
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
        public static string libreOffice = ConfigurationManager.AppSettings["libreOffice"];
        public static string tempFileDir = ConfigurationManager.AppSettings["tempFileDir"];
        public static string sharedFolder = ConfigurationManager.AppSettings["sharedFolder"];
        public static string sharedUserName= ConfigurationManager.AppSettings["sharedUserName"];
        public static string sharedUserPwd = ConfigurationManager.AppSettings["sharedUserPwd"];
        public static bool connectState(string path, string userName, string passWord)
        {
            bool Flag = false;
            Process proc = new Process();
            try
            {
                proc.StartInfo.FileName = "cmd.exe";
                proc.StartInfo.UseShellExecute = false;
                proc.StartInfo.RedirectStandardInput = true;
                proc.StartInfo.RedirectStandardOutput = true;
                proc.StartInfo.RedirectStandardError = true;
                proc.StartInfo.CreateNoWindow = true;
                proc.Start();
                string dosLine = "net use " + path + " " + passWord + " /user:" + userName;
                proc.StandardInput.WriteLine(dosLine);
                proc.StandardInput.WriteLine("exit");
                while (!proc.HasExited)
                {
                    proc.WaitForExit(1000);
                }
                string errormsg = proc.StandardError.ReadToEnd();
                proc.StandardError.Close();
                if (string.IsNullOrEmpty(errormsg))
                {
                    Flag = true;
                }
                else
                {
                    Log4Net.ErrorLog(errormsg);
                }
            }
            catch (Exception ex)
            {
                Log4Net.ErrorLog(ex);
            }
            finally
            {
                proc.Close();
                proc.Dispose();
            }
            return Flag;
        }
    }
}
