using System;
using System.Collections.Generic;
using System.Linq;
using System.Messaging;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Util
{
    public class MsQueue
    {
        string path = @".\private$\yqueue";
        MessageQueue messageQueue = null;
        public MsQueue()
        {
            messageQueue = new MessageQueue(path);
            messageQueue.Formatter = new XmlMessageFormatter(new Type[] { typeof(Person) });
        }
        public void SendMessage(object data, string label)
        {
            messageQueue.Send(data, label);
        }
        public void ReceiveMessage()
        {
            while (true)
            {
                var obj = messageQueue.Receive();
                Person person = (Person)obj.Body;
                Console.WriteLine(person.Name);
            }

        }
    }
    public class Person
    {
        public string Name { get; set; }
        public int Age { get; set; }
    }
}
