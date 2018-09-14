using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using System;
using System.IO;
using System.Threading;

namespace FileService.Converter
{
    public class Processor
    {
        Business.Task task = new Business.Task();
        Business.Converter converter = new Business.Converter();
        Config config = new Config();
        public bool StartMonitor(string handlerId)
        {
            bool result = AppSettings.connectState(AppSettings.sharedFolder.TrimEnd('\\'), AppSettings.sharedUserName, AppSettings.sharedUserPwd);
            //用户名和密码可用
            if (result)
            {
                new Queue().MonitorMessage(handlerId);
            }
            else
            {
                Log4Net.ErrorLog("shared folder username or password wrong");
            }
            return result;
        }
        /// <summary>
        ///  获取一个任务，并且开启一个线程，
        ///  每获取一个任务，队列里面会少一个，如果没有任务，表示任务全部在工作，会阻塞
        ///  某个任务完成，并且往任务队列添加了任务，就又可以开启新线程了
        /// </summary>
        public void StartWork()
        {
            while (true)
            {
                if (Queue.itemlist.Count > 0)
                {
                    var p = Queue.tasklist.Take();
                    FileItem item = Queue.itemlist.Take();
                    System.Threading.Tasks.Task.Factory.StartNew(this.Worker, item);
                }
                else
                {
                    Thread.Sleep(2000);
                }
            }
        }
        /// <summary>
        /// 工作线程
        /// 1：从数据队列里面获取一个数据，这时数据队列会少一个，添加数据的worker就可以往数据队列添加数据了，如果没有数据，阻塞
        /// 2：更新某个消息的状态，让他看起来是正在处理
        /// 3：缩略图生成完成后，标记queue为处理过状态，让服务下次启动时候自动跳过
        /// 4：整个处理完成，往任务队列添加一个，表示可以开启新的线程处理了
        /// </summary>
        public void Worker(object obj)
        {
            FileItem item = (FileItem)obj;
            ObjectId messageId = item.Message["_id"].AsObjectId;
            try
            {
                task.UpdateState(messageId, TaskStateEnum.processing, 0);
                bool hasOutput = item.Message["Output"].AsBsonDocument.Contains("_id");
                bool result = false;
                switch (item.Message["Type"].AsString)
                {
                    case "image":
                        result = new ImageConverter().Convert(item);
                        break;
                    case "video":
                        result = new VideoConverter().Convert(item);
                        break;
                    case "attachment":
                        string fileExt = Path.GetExtension(item.Message["FileName"].AsString).ToLower();
                        if (fileExt == ".zip")
                        {
                            result = new ZipConverter().Convert(item);
                        }
                        else if (fileExt == ".rar")
                        {
                            result = new RarConverter().Convert(item);
                        }
                        else if (config.GetTypeByExtension(fileExt) == "office")
                        {
                            result = new OfficeConverter().Convert(item);
                        }
                        else
                        {
                            result = new DefaultConverter().Convert(item);
                        }
                        break;
                    default:
                        result = new DefaultConverter().Convert(item);
                        break;
                }
                if (result)
                {
                    new Queue().MessageProcessed(item.QueueId);
                    task.Compeleted(messageId);
                    converter.AddCount(item.Message["HandlerId"].AsString, -1);
                }
                else
                {
                    task.Fault(messageId);
                }
            }
            catch (Exception ex)
            {
                task.Error(messageId);
                Log4Net.ErrorLog(ex);
            }
            Queue.tasklist.Add(1);
        }

    }
}
