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
            msQueue.ReceiveMessageTransactional(M1);


            Console.WriteLine("ok");
            Console.ReadKey();
        }

        private static bool M1(Person obj)
        {
            Console.WriteLine(obj.Name);
            return false;
        }

        private static bool M(Person arg)
        {
            Console.WriteLine(arg.Name);
            return true;
        }
    }
}
