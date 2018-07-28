using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public class VideoCapture : ModelBase<Data.VideoCapture>
    {
        public VideoCapture() : base(new Data.VideoCapture()) { }
        public bool DeleteBySourceId(ObjectId sourceId)
        {
            return mongoData.DeleteBySourceId(sourceId);
        }
        public long CountBySourceId(ObjectId sourceId)
        {
            return mongoData.CountBySourceId(sourceId);
        }
    }
}
