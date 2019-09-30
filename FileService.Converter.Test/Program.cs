using FileService.Util;
using System;
using System.IO;

namespace FileService.Converter.Test
{
    class Program
    {
        public static System.Threading.Tasks.Task workTask = null;

        static void Main(string[] args)
        {
            FileInfo fileInfo = new FileInfo(AppDomain.CurrentDomain.BaseDirectory + "log4net.config");
            log4net.Config.XmlConfigurator.ConfigureAndWatch(fileInfo);

            //Processor processor = new Processor();
            //processor.StartMonitor();
            //workTask = System.Threading.Tasks.Task.Factory.StartNew(processor.StartWork);

            MsQueue<Person> msQueue = new MsQueue<Person>(@".\private$\task_queue");
            msQueue.CreateQueue(true);

            msQueue.ReceiveMessage(M);

            Console.WriteLine("ok");
            Console.ReadKey();
        }

        private static void M(Person obj)
        {
            Console.WriteLine(obj.Name + ":" + obj.Age);
            throw new Exception();
        }
    }
}
