using FileService.Web.Models;
using FileService.Business;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    [AllowAnonymous]
    public class DataController : BaseController
    {
        Files files = new Files();
        VideoCapture videoCapture = new VideoCapture();
        Task task = new Task();
        Converter converter = new Converter();
        public ActionResult GetVideoCaptureIds(string id)
        {
            BsonDocument document = files.FindOne(ObjectId.Parse(id));
            return new ResponseModel<IEnumerable<string>>(ErrorCode.success, document["metadata"]["VideoCpIds"].AsBsonArray.Select(s => s.ToString()));
        }
        public ActionResult GetVideoList(string id)
        {
            BsonDocument document = files.FindOne(ObjectId.Parse(id));
            List<dynamic> videoList = new List<dynamic>();
            videoList.Add(new { _id = id, tag = "origin", current = false });
            if (document["metadata"].AsBsonDocument.Contains("Videos"))
            {
                foreach (BsonDocument doc in document["metadata"]["Videos"].AsBsonArray)
                {
                    videoList.Add(new { _id = doc["_id"].ToString(), tag = doc["Flag"].ToString(), current = false });
                }
            }
            List<string> videoCps = new List<string>();
            foreach (BsonValue value in document["metadata"]["VideoCpIds"].AsBsonArray)
            {
                videoCps.Add(value.ToString());
            }
            return new ResponseModel<dynamic>(ErrorCode.success, new { videolist = videoList, videocps = videoCps });
        }
        public ActionResult GetImageList(string id)
        {
            BsonDocument document = files.FindOne(ObjectId.Parse(id));
            List<dynamic> list = new List<dynamic>();
            list.Add(new { _id = id, tag = "origin", current = false });
            if (document["metadata"].AsBsonDocument.Contains("Thumbnail"))
            {
                foreach (BsonDocument doc in document["metadata"]["Thumbnail"].AsBsonArray)
                {
                    list.Add(new { _id = doc["_id"].ToString(), tag = doc["Flag"].ToString(), current = false });
                }
            }
            return new ResponseModel<List<dynamic>>(ErrorCode.success, list);
        }
        public ActionResult DeleteVideoCapture(string appName, string id)
        {
            BsonDocument document = videoCapture.FindOne(ObjectId.Parse(id));
            if (videoCapture.DeleteOne(ObjectId.Parse(id)) && document != null)
            {
                files.DeleteVideoCapture(document["SourceId"].AsObjectId, ObjectId.Parse(id));
                Log(appName, id, "DeleteVideoCapture");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            return new ResponseModel<string>(ErrorCode.record_not_exist, "");
        }
        public ActionResult FileState(string id)
        {
            IEnumerable<BsonDocument> list = task.Find(new BsonDocument("FileId", ObjectId.Parse(id)));
            BsonDocument result = new BsonDocument()
            {
                {"FileId",id },
                {"FileName",list.First()["FileName"] }
            };
            BsonArray stateList = new BsonArray();
            foreach (BsonDocument item in list)
            {
                stateList.Add(new BsonDocument()
                {
                    {"FileId",item["Output"]["_id"].ToString() },
                    {"Server",item["HandlerId"] },
                    {"TotalCount",converter.TaskCount(item["HandlerId"].AsString) },
                    {"Flag", item["Output"]["Flag"]},
                    {"State", item["StateDesc"]},
                    {"Percent", item["Percent"]},
                });
            }
            result.Add("StateList", stateList);
            return new ResponseModel<BsonDocument>(ErrorCode.success, result);
        }
    }
}