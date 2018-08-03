using FileService.Web.Models;
using FileService.Business;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using FileService.Util;

namespace FileService.Web.Controllers
{
    [AllowAnonymous]
    public class DataController : BaseController
    {
        FilesWrap filesWrap = new FilesWrap();
        FilesConvert filesConvert = new FilesConvert();
        VideoCapture videoCapture = new VideoCapture();
        Task task = new Task();
        Converter converter = new Converter();
        public ActionResult GetFileAccess(string id)
        {
            BsonDocument document = filesWrap.FindOne(ObjectId.Parse(id));
            return new ResponseModel<BsonArray>(ErrorCode.success, document["Access"].AsBsonArray);
        }
        [HttpPost]
        public ActionResult UpdateFileAccess(UpdateAccess updateAccess)
        {
            //只有发布人才有权限修改
            BsonDocument document = filesWrap.FindOne(ObjectId.Parse(updateAccess.FileId));
            string documentOwner = document["Owner"].AsString;
            if (!string.IsNullOrEmpty(documentOwner))
            {
                string userName = Request.Headers["UserName"] ?? User.Identity.Name;
                if(userName!= documentOwner)
                {
                    return new ResponseModel<string>(ErrorCode.owner_not_match, "");
                }
            }
            for (var i = 0; i < updateAccess.Access.Count; i++)
            {
                if (updateAccess.Access[i].DepartmentCodes == null) updateAccess.Access[i].DepartmentCodes = new string[] { };
                if (updateAccess.Access[i].DepartmentDisplay == null) updateAccess.Access[i].DepartmentDisplay = new string[] { };
                if (updateAccess.Access[i].AccessCodes == null) updateAccess.Access[i].AccessCodes = new string[] { };
                if (updateAccess.Access[i].AccessUsers == null) updateAccess.Access[i].AccessUsers = new string[] { };
            }
            BsonArray access = new BsonArray(updateAccess.Access.Select(s => s.ToBsonDocument()));
            Log(updateAccess.FileId.ToString(), "UpdateFileAccess");
            if (filesWrap.UpdateAccess(ObjectId.Parse(updateAccess.FileId), access) && task.UpdateAccess(ObjectId.Parse(updateAccess.FileId), access))
            {
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            else
            {
                return new ResponseModel<string>(ErrorCode.server_exception, "");
            }
        }
        public ActionResult GetVideoCaptureIds(string id)
        {
            BsonDocument document = filesWrap.FindOne(ObjectId.Parse(id));
            return new ResponseModel<IEnumerable<string>>(ErrorCode.success, document["VideoCpIds"].AsBsonArray.Select(s => s.ToString()));
        }
        public ActionResult GetVideoList(string id)
        {
            BsonDocument document = filesWrap.FindOne(ObjectId.Parse(id));
            if (document == null) document = filesConvert.FindOne(ObjectId.Parse(id));
            List<dynamic> videoList = new List<dynamic>();
            videoList.Add(new { _id = id, tag = "origin", current = false });
            if (document.AsBsonDocument.Contains("Videos"))
            {
                foreach (BsonDocument doc in document["Videos"].AsBsonArray)
                {
                    videoList.Add(new { _id = doc["_id"].ToString(), tag = doc["Flag"].ToString(), current = false });
                }
            }
            List<string> videoCps = new List<string>();
            if (document.AsBsonDocument.Contains("VideoCpIds"))
            {
                foreach (BsonValue value in document["VideoCpIds"].AsBsonArray)
                {
                    videoCps.Add(value.ToString());
                }
            }
            return new ResponseModel<dynamic>(ErrorCode.success, new { videolist = videoList, videocps = videoCps });
        }
        public ActionResult GetImageList(string id)
        {
            BsonDocument document = filesWrap.FindOne(ObjectId.Parse(id));
            if (document == null) document = filesConvert.FindOne(ObjectId.Parse(id));
            List<dynamic> list = new List<dynamic>();
            list.Add(new { _id = id, tag = "origin", current = false });
            if (document.AsBsonDocument.Contains("Thumbnail"))
            {
                foreach (BsonDocument doc in document["Thumbnail"].AsBsonArray)
                {
                    list.Add(new { _id = doc["_id"].ToString(), tag = doc["Flag"].ToString(), current = false });
                }
            }
            return new ResponseModel<List<dynamic>>(ErrorCode.success, list);
        }
        public ActionResult DeleteVideoCapture(string id)
        {
            BsonDocument document = videoCapture.FindOne(ObjectId.Parse(id));
            if (videoCapture.DeleteOne(ObjectId.Parse(id)) && document != null)
            {
                filesWrap.DeleteVideoCapture(document["SourceId"].AsObjectId, ObjectId.Parse(id));
                Log(id, "DeleteVideoCapture");
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