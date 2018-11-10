﻿using System;
using System.Configuration;
using System.Diagnostics;

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
        public static string sharedUserName = ConfigurationManager.AppSettings["sharedUserName"];
        public static string sharedUserPwd = ConfigurationManager.AppSettings["sharedUserPwd"];
        /// <summary>
        /// 本web页面的权限配置
        /// </summary>
        public static string appName = ConfigurationManager.AppSettings["appName"];
        public static string authCode = ConfigurationManager.AppSettings["authCode"];
        public static string apiType = ConfigurationManager.AppSettings["apiType"];
        //public static PerformanceCounter cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
        //public static PerformanceCounter ramCounter = new PerformanceCounter("Memory", "Available MBytes");

        public static bool connectState(string path, string userName, string passWord)
        {
            if (sharedUserName == "" && sharedUserPwd == "") return true;
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
