using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class VideoCapture : MongoBase
    {
        public VideoCapture() : base("VideoCapture") { }
        public bool DeleteBySourceId(ObjectId sourceId)
        {
            return MongoCollection.DeleteMany(FilterBuilder.Eq("SourceId", sourceId)).IsAcknowledged;
        }
        public long CountBySourceId(ObjectId sourceId)
        {
            return MongoCollection.CountDocuments(FilterBuilder.Eq("SourceId", sourceId));
        }
    }
}
