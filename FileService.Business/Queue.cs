using FileService.Util;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace FileService.Business
{
    public partial class Queue : ModelBase<Data.Queue>
    {
        public Queue() : base(new Data.Queue())
        {
        }
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
        public async Task<IAsyncCursor<BsonDocument>> GetMonitorCursor(string handlerId)
        {
            return await mongoData.MonitorMessage(handlerId);
        }
    }
    public class FileItem
    {
        public ObjectId QueueId { get; set; }
        public BsonDocument Message { get; set; }
    }
}
