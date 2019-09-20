using FileService.Business;
using FileService.Data;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Concurrent;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace FileService.Converter
{
    public class Processor
    {
        Business.Task task = new Business.Task();
        Business.Converter converter = new Business.Converter();
        Business.Extension extension = new Business.Extension();
        Business.Queue queue = new Business.Queue();
        public static BlockingCollection<FileItem> itemlist = new BlockingCollection<FileItem>();
        public static BlockingCollection<int> tasklist = new BlockingCollection<int>(AppSettings.taskCount);
        public static Task<IAsyncCursor<BsonDocument>> cursor = null;
        public Processor()
        {
            for (var i = 0; i < AppSettings.taskCount; i++) tasklist.Add(1);
            cursor = queue.GetMonitorCursor(AppSettings.handlerId);
        }
        public async void StartMonitor()
        {
            while (await cursor.Result.MoveNextAsync())
            {
                var batch = cursor.Result.Current;
                foreach (var doc in batch)
                {
                    ObjectId queueId = doc["_id"].AsObjectId;
                    string collectionName = doc["collectionName"].AsString;
                    ObjectId collectionId = doc["collectionId"].AsObjectId;
                    BsonDocument taskItem = new MongoBase(collectionName).FindOne(collectionId);
                    if (taskItem == null) continue;
                    if (taskItem["State"].AsInt32 == -100) continue;
                    if (taskItem.Contains("Delete") && taskItem["Delete"].AsBoolean == true) continue;
                    itemlist.Add(new FileItem()
                    {
                        QueueId = queueId,
                        Message = taskItem,
                    });
                }
            }
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
                FileItem item = itemlist.Take();
                var p = tasklist.Take();
                System.Threading.Tasks.Task.Factory
                    .StartNew(Worker, item)
                    .ContinueWith(t =>
                {
                    tasklist.Add(1);
                });
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
                    case "office":
                        result = new OfficeConverter().Convert(item);
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
                    queue.MessageProcessed(item.QueueId);
                    task.Compeleted(messageId);
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
            finally
            {
                converter.AddCount(item.Message["HandlerId"].AsString, -1);
            }
        }

    }
}
