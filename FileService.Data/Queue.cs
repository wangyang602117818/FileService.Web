using MongoDB.Bson;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class Queue : MongoBase
    {
        public Queue() : base("queue")
        {
        }
        public async Task<IAsyncCursor<BsonDocument>> GetMonitorCursor(string handlerId, string collection = "Task")
        {
            var filter = FilterBuilder.Eq("handlerId", handlerId) & FilterBuilder.Eq("collectionName", collection) & FilterBuilder.Eq("processed", false);
            return await MongoCollection.FindAsync(filter, new FindOptions<BsonDocument> { CursorType = CursorType.Tailable, BatchSize = 100 });
        }
        public bool MessageProcessed(ObjectId id)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Set("processed", true)).IsAcknowledged;
        }
    }
}
