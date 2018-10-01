using System;
using System.Diagnostics;
using System.Management;
using Microsoft.VisualBasic;
namespace FileService.Util
{
    public class ServerState
    {
        public string ServerName { get; set; }
        public string OS { get; set; }
        public string MemoryTotal { get; set; }
        //public string MemoryUsage { get; set; }
        //public string CPUUsage { get; set; }
        public string DiskTotal { get; set; }
        public string DiskUsage { get; set; }
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
            //MemoryUsage = Math.Round(AppSettings.ramCounter.NextValue() / 1024).ToString();
            //CPUUsage = Math.Round(AppSettings.cpuCounter.NextValue()) + "%";

            return this;
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
