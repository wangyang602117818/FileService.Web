using FileService.Data;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using MongoDB.Driver.GridFS;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public partial class Queue : ModelBase<Data.Queue>
    {
        public static BlockingCollection<FileItem> itemlist = null;
        public static BlockingCollection<int> tasklist = null;
        MongoFile mongoFile = new MongoFile();
        static Queue()
        {
            if (AppSettings.taskCount > 0)
            {
                itemlist = new BlockingCollection<FileItem>(AppSettings.taskCount);
                tasklist = new BlockingCollection<int>(AppSettings.taskCount);
            }
            for (var i = 0; i < AppSettings.taskCount; i++) tasklist.Add(1);
        }
        public Queue() : base(new Data.Queue()) { }
        public void Insert(string handlerId, string type, string collectionName, ObjectId collectionId, bool processed, BsonDocument data)
        {
            BsonDocument queue = new BsonDocument()
            {
                {"handlerId",handlerId },
                {"type",type },
                {"collectionName",collectionName },
                {"collectionId",collectionId },
                {"op","insert" },
                {"data",data },
                {"processed",processed },
                {"createTime",DateTime.Now },
            };
            mongoData.InsertOneAsync(queue);
        }
        public bool MessageProcessed(ObjectId id)
        {
            return mongoData.MessageProcessed(id);
        }
        public async void MonitorMessage(string handlerId)
        {
            var cursor = await mongoData.MonitorMessage(handlerId);
            while (await cursor.MoveNextAsync())
            {
                var batch = cursor.Current;
                foreach (var doc in batch)
                {
                    ObjectId queueId = doc["_id"].AsObjectId;
                    string collectionName = doc["collectionName"].AsString;
                    ObjectId collectionId = doc["collectionId"].AsObjectId;
                    BsonDocument taskItem = new MongoBase(collectionName).FindOne(collectionId);
                    if (taskItem == null) continue;
                    //if (taskItem["Type"].AsString == "video" || taskItem["Type"].AsString == "attachment")
                    //{
                    //    if (!File.Exists(MongoFile.AppDataDir + taskItem["FileName"])) mongoFile.SaveTo(taskItem["FileId"].AsObjectId);
                    //}
                    itemlist.Add(new FileItem()
                    {
                        QueueId = queueId,
                        Message = taskItem,
                    });
                }
            }
        }
    }
    public class FileItem
    {
        public ObjectId QueueId { get; set; }
        public BsonDocument Message { get; set; }
    }
}
