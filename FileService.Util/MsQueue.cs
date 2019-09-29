using System;
using System.Messaging;

namespace FileService.Util
{
    public class MsQueue<T>
    {
        MessageQueue messageQueue = null;
        public MsQueue(string path)
        {
            try
            {
                if (!MessageQueue.Exists(path)) MessageQueue.Create(path);
            }
            catch (MessageQueueException ex)
            {
                Log4Net.ErrorLog(ex);
            }
            messageQueue = new MessageQueue(path);
            messageQueue.SetPermissions("Everyone", MessageQueueAccessRights.FullControl);
            messageQueue.Formatter = new XmlMessageFormatter(new Type[] { typeof(T) });
        }
        public void SendMessage(T data, string label)
        {
            messageQueue.Send(data, label);
        }
        public void ReceiveMessage(Action<T> action)
        {
            while (true)
            {
                var obj = messageQueue.Receive();
                T person = (T)obj.Body;
                action(person);
            }
        }
    }
    public class Person
    {
        public string Name { get; set; }
        public int Age { get; set; }
    }
}
