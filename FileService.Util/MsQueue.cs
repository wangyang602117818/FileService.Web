using System;
using System.Collections.Generic;
using System.Linq;
using System.Messaging;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace FileService.Util
{
    public class MsQueue<T>
    {
        string path = @".\private$\yqueue";
        MessageQueue messageQueue = null;
        public MsQueue()
        {
            messageQueue = new MessageQueue(path);
            messageQueue.Formatter = new XmlMessageFormatter(new Type[] { typeof(T) });
        }
        public void SendMessage(T data, string label)
        {
            messageQueue.Send(data, label);
        }
        public void ReceiveMessage()
        {
            while (true)
            {
                var obj = messageQueue.Receive();
                T person = (T)obj.Body;
                Console.WriteLine(person);
            }
        }
    }
    public class Person
    {
        public string Name { get; set; }
        public int Age { get; set; }
    }
}
