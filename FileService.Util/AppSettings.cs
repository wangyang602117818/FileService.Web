using MongoDB.Bson;
using System;
using System.Configuration;
using System.Diagnostics;
using System.IO;

namespace FileService.Util
{
    public class AppSettings
    {
        public static string mongodb = ConfigurationManager.AppSettings["mongodb"];
        public static string database = ConfigurationManager.AppSettings["database"];
        public static string handlerId = ConfigurationManager.AppSettings["handlerId"];
        public static int taskCount = Convert.ToInt32(ConfigurationManager.AppSettings["taskCount"]);
        public static string libreOffice = ConfigurationManager.AppSettings["libreOffice"];
        //public static string tempFileDir = ConfigurationManager.AppSettings["tempFileDir"];

        public static string saveFileType = ConfigurationManager.AppSettings["saveFileType"];
        public static string saveFileApi = ConfigurationManager.AppSettings["saveFileApi"];
        public static string saveFilePath = ConfigurationManager.AppSettings["saveFilePath"];

        //public static string sharedFolders = ConfigurationManager.AppSettings["sharedFolders"];
        //public static string sharedUserNames = ConfigurationManager.AppSettings["sharedUserNames"];
        //public static string sharedUserPwds = ConfigurationManager.AppSettings["sharedUserPwds"];
        /// <summary>
        /// 本web页面的权限配置
        /// </summary>
        public static string appName = ConfigurationManager.AppSettings["appName"];
        public static string authCode = ConfigurationManager.AppSettings["authCode"];
        public static string apiType = ConfigurationManager.AppSettings["apiType"];

        public static string ExePath = AppDomain.CurrentDomain.BaseDirectory + "ffmpeg.exe";

        public static string GetFullPath(BsonDocument task)
        {
            string path = saveFilePath + task["Folder"].AsString + "\\";
            if (!Directory.Exists(path)) Directory.CreateDirectory(path);
            string fileExt = task["FileName"].ToString().GetFileExt();
            return path + task["FileId"].ToString() + fileExt;
        }
        public static bool connectState(string path, string userName, string passWord, ref string message)
        {
            if (userName == "" && passWord == "") return true;
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
                string dosLine = "net use " + path + " " + passWord + " /user:\"" + userName + "\"";
                proc.StandardInput.WriteLine(dosLine);
                proc.StandardInput.WriteLine("exit");
                while (!proc.HasExited)
                {
                    proc.WaitForExit(1000);
                }
                message = proc.StandardError.ReadToEnd();
                proc.StandardError.Close();
                if (string.IsNullOrEmpty(message))
                {
                    Flag = true;
                }
                else
                {
                    Log4Net.ErrorLog(message);
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
