using FileService.Util;
using System;
using System.IO;

namespace FileService.Converter.Test
{
    class Program
    {
        static string handlerId = AppSettings.handlerId;
        public static System.Threading.Tasks.Task workTask = null;
        static void Main(string[] args)
        {
            FileInfo fileInfo = new FileInfo(AppDomain.CurrentDomain.BaseDirectory + "log4net.config");
            log4net.Config.XmlConfigurator.ConfigureAndWatch(fileInfo);

            Processor processor = new Processor();
            processor.StartMonitor(handlerId);
            workTask = System.Threading.Tasks.Task.Factory.StartNew(processor.StartWork);



            Console.WriteLine("ok");
            Console.ReadKey();
        }


    }
}
