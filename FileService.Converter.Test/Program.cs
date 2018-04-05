using FileService.Model;
using FileService.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FileService.Business;
using System.Collections.Concurrent;
using System.Threading;
using System.Diagnostics;
using System.IO;
using System.Net.Sockets;
using System.Net;
using System.ServiceProcess;

namespace FileService.Converter.Test
{
    class Program
    {
        static string handlerId = AppSettings.handlerId;

        static void Main(string[] args)
        {
            FileInfo fileInfo = new FileInfo(AppDomain.CurrentDomain.BaseDirectory + "log4net.config");
            log4net.Config.XmlConfigurator.ConfigureAndWatch(fileInfo);

            Processor processor = new Processor();
            processor.StartMonitor(handlerId);
            System.Threading.Tasks.Task.Factory.StartNew(processor.StartWork);

            Console.WriteLine("ok");
            Console.ReadKey();
        }


    }
}
