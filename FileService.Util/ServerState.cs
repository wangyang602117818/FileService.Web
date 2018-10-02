using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Management;
using Microsoft.VisualBasic;
namespace FileService.Util
{
    public class ServerState
    {
        public string ServerName { get; set; }
        public string OS { get; set; }
        public string MemoryTotal { get; set; }
        public string Disk { get; set; }
        public string CacheFiles { get; set; }
        public string LogFiles { get; set; }
        public ServerState GetServerState()
        {
            ServerName = Environment.MachineName;
            OS = Environment.OSVersion.VersionString;
            ManagementObjectSearcher objCS = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystem");
            foreach (ManagementObject objMgmt in objCS.Get())
            {
                MemoryTotal = Math.Round(Convert.ToDouble(objMgmt["totalphysicalmemory"].ToString()) / 1024 / 1024 / 1024).ToString();
            }
            DriveInfo[] allDirves = DriveInfo.GetDrives();
            List<string> dirvesInfo = new List<string>();
            foreach (DriveInfo item in allDirves)
            {
                if (item.IsReady)
                {
                    dirvesInfo.Add(item.Name.TrimEnd('\\') + Math.Round(item.TotalFreeSpace * 1.0 / 1024 / 1024 / 1024) + "G/" + Math.Round(item.TotalSize * 1.0 / 1024 / 1024 / 1024) + "G");
                }
            }
            Disk = string.Join(",", dirvesInfo);
            string cacheDir = AppDomain.CurrentDomain.BaseDirectory + AppSettings.tempFileDir;
            CacheFiles = GetFileConvertSize(DirectorySize(new DirectoryInfo(cacheDir))) + "/" + Directory.GetDirectories(cacheDir).Length;
            string logDir = AppDomain.CurrentDomain.BaseDirectory + @"App_Data\Log\";
            LogFiles = GetFileConvertSize(DirectorySize(new DirectoryInfo(logDir))) + "/" + Directory.GetDirectories(logDir).Length;
            return this;
        }
        static long DirectorySize(DirectoryInfo directoryInfo)
        {
            long size = 0;
            IEnumerable<FileInfo> fis = directoryInfo.GetFiles();
            foreach (FileInfo fi in fis)
            {
                size += fi.Length;
            }
            DirectoryInfo[] dis = directoryInfo.GetDirectories();
            foreach (DirectoryInfo d in dis)
            {
                size += DirectorySize(d);
            }
            return size;
        }
        public static string GetFileConvertSize(long size)
        {
            size = size / 1024;
            if (size < 1024) return size + "KB";
            size = size / 1024;
            if (size < 1024) return size + "MB";
            size = size / 1024;
            if (size < 1024) return size + "GB";
            size = size / 1024;
            return size + "TB";
        }
    }
    public class MongoServerState
    {
        public string ServerName { get; set; }
        public int Port { get; set; }
        public int State { get; set; }    //1:PRIMARY,2:SECONDARY,7:ARBITER,other:not reachable
        public string Version { get; set; }
        public string OS { get; set; }
        public string Memory { get; set; }
        public int Health { get; set; }  //1:ok,other:error
    }
}
