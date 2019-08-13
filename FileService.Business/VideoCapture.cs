using MongoDB.Bson;
using System;
using System.Collections.Generic;

namespace FileService.Business
{
    public class VideoCapture : ModelBase<Data.VideoCapture>
    {
        public VideoCapture() : base(new Data.VideoCapture()) { }
        //public bool DeleteByIds(string from, ObjectId sourceId, IEnumerable<ObjectId> ids)
        //{
        //    return mongoData.DeleteByIds(from, sourceId, ids);
        //}
        public void Insert(ObjectId id,string from, IEnumerable<ObjectId> sourceIds, long length, int width, int height, string md5, byte[] file)
        {
            BsonDocument document = new BsonDocument()
            {
                {"_id",id },
                {"From",from },
                {"Md5",md5 },
                {"Length",length},
                {"Width",width },
                {"Height",height },
                {"SourceIds",new BsonArray(sourceIds)},
                {"File",file },
                {"CreateTime",DateTime.Now }
            };
            mongoData.Insert(document);
        } 
        public BsonDocument GetIdByMd5(string from, string md5)
        {
            return mongoData.GetIdByMd5(from, md5);
        }
        public bool AddSourceId(string from, ObjectId id, ObjectId sourceId)
        {
            return mongoData.AddSourceId(from, id, sourceId);
        }
        public bool DeleteByIds(string from, ObjectId sourceId, IEnumerable<ObjectId> ids)
        {
            if (mongoData.DeleteSourceId(from, sourceId, ids))
            {
                return mongoData.DeleteByIds(from, sourceId, ids);
            }
            else
            {
                return false;
            }
        }
    }
}
