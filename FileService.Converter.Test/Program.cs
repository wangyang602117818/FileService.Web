using FileService.Util;
using System;
using System.IO;
using System.Messaging;

namespace FileService.Converter.Test
{
    class Program
    {
        //public static System.Threading.Tasks.Task workTask = null;

        static void Main(string[] args)
        {
            FileInfo fileInfo = new FileInfo(AppDomain.CurrentDomain.BaseDirectory + "log4net.config");
            log4net.Config.XmlConfigurator.ConfigureAndWatch(fileInfo);

            MsQueue<TaskMessage> msQueue = new MsQueue<TaskMessage>(AppSettings.msqueue);
            msQueue.CreateQueue();

            Processor processor = new Processor();
            processor.StartWork();

            Console.WriteLine("ok");
            Console.ReadKey();
        }

        private static void M2(TaskMessage obj)
        {
            Console.WriteLine(obj.CollectionId);
        }

        private static bool M(TaskMessage arg)
        {
            Console.WriteLine(arg.CollectionId);
            return true;
        }
    }
}
