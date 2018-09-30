using System;
using System.Diagnostics;

namespace FileService.Model
{
    public class ServerState
    {
        static readonly PerformanceCounter ramCounter = new PerformanceCounter("Memory", "Available MBytes");
        public string ServerName { get; set; }
        public string OS { get; set; }
        public string Memory { get; set; }
        public string DiskTotal { get; set; }
        public string DiskUsage { get; set; }
        public string CacheFiles { get; set; }
        public string LogFiles { get; set; }
        public ServerState GetServerState()
        {
            ServerName = Environment.MachineName;
            OS = Environment.OSVersion.VersionString;
            Memory=

            Microsoft.VisualBasic.VBCodeProvider.
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
