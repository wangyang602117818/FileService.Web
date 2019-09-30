using System;
using System.Messaging;

namespace FileService.Util
{
    public class MsQueue<T>
    {
        public string path = "";
        public MsQueue(string path)
        {
            this.path = path;
        }
        /// <summary>
        /// 不能操作远程队列,只能由本地的程序创建队列,程序只能对远程的队列发送消息
        /// 创建队列需要消耗较多资源,确保只创建一次
        /// </summary>
        /// <param name="path">远程或者本地队列的地址(FormatName:DIRECT=OS:computename\\private$\\task_queue)</param>
        public void CreateQueue(bool transaction = false)
        {
            if (!MessageQueue.Exists(path)) MessageQueue.Create(path, transaction);
        }
        public void SendMessage(T data, string label)
        {
            MessageQueue messageQueue = new MessageQueue(path);
            messageQueue.Send(data, label);
        }
        /// <summary>
        /// 事务性队列只能发送事务性消息,发送普通消息会丢弃
        /// </summary>
        /// <param name="data"></param>
        /// <param name="label"></param>
        public void SendMessageTransactional(T data, string label)
        {
            MessageQueue messageQueue = new MessageQueue(path);
            MessageQueueTransaction myTransaction = new MessageQueueTransaction();
            myTransaction.Begin();
            messageQueue.Send(data, label, myTransaction);
            myTransaction.Commit();
        }
        public void ReceiveMessage(Action<T> action)
        {
            MessageQueue messageQueue = new MessageQueue(path);
            messageQueue.Formatter = new XmlMessageFormatter(new Type[] { typeof(T) });
            while (true)
            {
                var obj = messageQueue.Receive();
                T person = (T)obj.Body;
                action(person);
            }
        }
        public void ReceiveMessageTransactional(Action<T> action)
        {
            MessageQueue messageQueue = new MessageQueue(path);
            messageQueue.Formatter = new XmlMessageFormatter(new Type[] { typeof(T) });
            while (true)
            {
                MessageQueueTransaction myTransaction = new MessageQueueTransaction();
                try
                {
                    myTransaction.Begin();
                    var obj = messageQueue.Receive(myTransaction);
                    T person = (T)obj.Body;
                    action(person);
                    myTransaction.Commit();
                }
                catch (Exception ex)
                {
                    myTransaction.Abort();
                }
            }
        }
    }
    public class Person
    {
        public string Name { get; set; }
        public int Age { get; set; }
    }
}
