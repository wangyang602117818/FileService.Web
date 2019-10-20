using FileService.Business;
using FileService.Data;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace FileService.Converter
{
    public class Processor
    {
        Business.Task task = new Business.Task();
        Business.Converter converter = new Business.Converter();
        Business.Extension extension = new Business.Extension();
        public List<System.Threading.Tasks.Task> tasks = new List<System.Threading.Tasks.Task>();
        public Processor(){}
        public void StartWork()
        {
            for (var i = 0; i < AppSettings.taskCount; i++)
            {
                System.Threading.Tasks.Task task = System.Threading.Tasks.Task.Factory.StartNew(() =>
                {
                    MsQueue<TaskMessage> msQueue = new MsQueue<TaskMessage>(AppSettings.msqueue);
                    msQueue.ReceiveMessage(Worker);
                });
                tasks.Add(task);
            }
        }
        public void Worker(TaskMessage taskMessage)
        {
            string collectionName = taskMessage.CollectionName;
            ObjectId collectionId = ObjectId.Parse(taskMessage.CollectionId);
            BsonDocument taskItem = new MongoBase(collectionName).FindOne(collectionId);
            if (taskItem == null) return;
            if (taskItem["State"].AsInt32 == -100) return;
            if (taskItem.Contains("Delete") && taskItem["Delete"].AsBoolean == true) return;
            ObjectId messageId = taskItem["_id"].AsObjectId;
            try
            {
                task.UpdateState(messageId, TaskStateEnum.processing, 0);
                bool hasOutput = taskItem["Output"].AsBsonDocument.Contains("_id");
                bool result = false;
                switch (taskItem["Type"].AsString)
                {
                    case "image":
                        result = new ImageConverter().Convert(taskItem);
                        break;
                    case "video":
                        result = new VideoConverter().Convert(taskItem);
                        break;
                    case "office":
                        result = new OfficeConverter().Convert(taskItem);
                        break;
                    case "attachment":
                        string fileExt = Path.GetExtension(taskItem["FileName"].AsString).ToLower();
                        if (fileExt == ".zip")
                        {
                            result = new ZipConverter().Convert(taskItem);
                        }
                        else if (fileExt == ".rar")
                        {
                            result = new RarConverter().Convert(taskItem);
                        }
                        else
                        {
                            result = new DefaultConverter().Convert(taskItem);
                        }
                        break;
                    default:
                        result = new DefaultConverter().Convert(taskItem);
                        break;
                }
                if (result)
                {
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
                converter.AddCount(taskItem["HandlerId"].AsString, -1);
            }
        }

    }
}
