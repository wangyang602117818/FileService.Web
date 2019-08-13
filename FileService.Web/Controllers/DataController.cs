using FileService.Util;
using FileService.Web.Filters;
using FileService.Web.Models;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    [AllowAnonymous]
    [AppAuthorize]
    public class DataController : BaseController
    {
        public ActionResult GetFileAccess(string id)
        {
            BsonDocument document = filesWrap.FindOne(ObjectId.Parse(id));
            return new ResponseModel<BsonArray>(ErrorCode.success, document["Access"].AsBsonArray);
        }
        [HttpPost]
        public ActionResult UpdateFileAccess(UpdateAccess updateAccess)
        {
            if (updateAccess.Access == null) updateAccess.Access = new List<Model.AccessModel>();
            //只有发布人才有权限修改
            IEnumerable<ObjectId> fileIds = updateAccess.FileIds.Select(s => ObjectId.Parse(s));
            //检查是否有无权限修改的document
            foreach (ObjectId fileId in fileIds)
            {
                BsonDocument document = filesWrap.FindOne(fileId);
                string documentOwner = document["Owner"].AsString;
                if (!string.IsNullOrEmpty(documentOwner))
                {
                    string userName = Request.Headers["UserCode"] ?? User.Identity.Name;
                    if (userName != documentOwner)
                    {
                        return new ResponseModel<string>(ErrorCode.owner_not_match, "");
                    }
                }
            }
            //填充默认值
            for (var i = 0; i < updateAccess.Access.Count; i++)
            {
                if (updateAccess.Access[i].DepartmentCodes == null) updateAccess.Access[i].DepartmentCodes = new string[] { };
                if (updateAccess.Access[i].DepartmentDisplay == null) updateAccess.Access[i].DepartmentDisplay = new string[] { };
                if (updateAccess.Access[i].AccessCodes == null) updateAccess.Access[i].AccessCodes = new string[] { };
                if (updateAccess.Access[i].AccessUsers == null) updateAccess.Access[i].AccessUsers = new string[] { };
            }
            BsonArray access = new BsonArray(updateAccess.Access.Select(s => s.ToBsonDocument()));
            foreach (ObjectId fileId in fileIds)
            {
                Log(fileId.ToString(), "UpdateFileAccess");
            }
            if (filesWrap.UpdateAccess(fileIds, access) && task.UpdateAccess(fileIds, access))
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
            return new ResponseModel<IEnumerable<string>>(ErrorCode.success, document["VideoCpIds"].AsBsonArray.Select(s => s["FileId"].ToString()));
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
                foreach (BsonDocument value in document["VideoCpIds"].AsBsonArray)
                {
                    videoCps.Add(value["FileId"].ToString());
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
        public ActionResult GetThumbnailMetadata(string id)
        {
            BsonDocument fileWrap = filesWrap.FindOne(ObjectId.Parse(id));
            IEnumerable<ObjectId> thumbnailIds = fileWrap["Thumbnail"].AsBsonArray.Select(s => s["FileId"].AsObjectId);
            List<BsonDocument> thumbs = thumbnail.FindByIds(fileWrap["From"].ToString(), thumbnailIds).ToList();
            foreach (BsonDocument bson in thumbs)
            {
                ObjectId fileId = bson["_id"].AsObjectId;
                var thumb = fileWrap["Thumbnail"].AsBsonArray.Where(w => w["FileId"].AsObjectId == fileId).FirstOrDefault();
                bson["_id"] = thumb["_id"];
                bson["Flag"] = thumb["Flag"];
            }
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, thumbs);
        }
        public ActionResult DeleteVideoCapture(string fileId, string id)
        {
            ObjectId cpId = ObjectId.Parse(id);
            ObjectId fId = ObjectId.Parse(fileId);
            int count = 0;
            string from = filesWrap.GetCpFileIdFrom(fId, cpId, ref count);
            if (!string.IsNullOrEmpty(from)) videoCapture.DeleteByIds(from, fId, new List<ObjectId>() { cpId });
            filesWrap.DeleteVideoCapture(fId, cpId);
            Log(id, "DeleteVideoCapture");
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        public ActionResult FileState(string id)
        {
            IEnumerable<BsonDocument> list = task.Find(new BsonDocument("FileId", ObjectId.Parse(id)));
            if (list == null || list.Count() == 0) return new ResponseModel<string>(ErrorCode.record_not_exist, "");
            BsonDocument result = GetState(list);
            return new ResponseModel<BsonDocument>(ErrorCode.success, result);
        }
        public ActionResult SubFileState(string id)
        {
            IEnumerable<BsonDocument> list = task.Find(new BsonDocument("Output._id", ObjectId.Parse(id)));
            if (list == null || list.Count() == 0) return new ResponseModel<string>(ErrorCode.record_not_exist, "");
            BsonDocument result = GetState(list);
            return new ResponseModel<BsonDocument>(ErrorCode.success, result);
        }
        [HttpPost]
        public ActionResult AddApplication(ApplicationThird addApplication)
        {
            BsonDocument appBson = application.FindByAppName(addApplication.ApplicationName);
            if (appBson != null) return new ResponseModel<string>(ErrorCode.success, appBson["AuthCode"].AsString);
            addApplication.AuthCode = new Random().RandomCodeHex(12);
            addApplication.Action = "allow";
            application.AddApplication(addApplication.ToBsonDocument());
            Log("-", "AddApplication");
            return new ResponseModel<string>(ErrorCode.success, addApplication.AuthCode);
        }
        public ActionResult GetApplication()
        {
            IEnumerable<string> result = application.FindApplications().Select(s => s["ApplicationName"].AsString);
            return new ResponseModel<IEnumerable<string>>(ErrorCode.success, result, result.Count());
        }
        public ActionResult GetFileList(string from = "", string fileType = "", string filter = "", int pageIndex = 1, int pageSize = 15)
        {
            BsonDocument eqs = new BsonDocument("Delete", false);
            if (!string.IsNullOrEmpty(fileType)) eqs.Add("FileType", fileType);
            if (!string.IsNullOrEmpty(from)) eqs.Add("From", from);
            var userName = Request.Headers["UserCode"] ?? "";
            long count = 0;
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "CreateTime", "desc" } };
            List<BsonDocument> result = filesWrap.GetPageList(pageIndex, pageSize, eqs, null, null, sorts, filter, new List<string>() { "FileName" }, new List<string>() { }, out count, userName, false).ToList();
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult Remove(string id)
        {
            if (Request.Headers["UserCode"] == null) return new ResponseModel<string>(ErrorCode.usercode_required, "");
            RemoveFile(id);
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        [HttpPost]
        public ActionResult Removes(IEnumerable<string> ids)
        {
            if (Request.Headers["UserCode"] == null) return new ResponseModel<string>(ErrorCode.usercode_required, "");
            foreach (string id in ids)
            {
                RemoveFile(id);
            }
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        private BsonDocument GetState(IEnumerable<BsonDocument> list)
        {
            BsonDocument result = new BsonDocument()
            {
                {"FileId",list.First()["FileId"].ToString() },
                {"FileName",list.First()["FileName"] }
            };
            BsonArray stateList = new BsonArray();
            int percent = 0;
            foreach (BsonDocument item in list)
            {
                BsonDocument output = item["Output"].AsBsonDocument;
                stateList.Add(new BsonDocument()
                {
                    {"FileId",output.Contains("_id")? output["_id"].ToString():ObjectId.Empty.ToString() },
                    {"Server",item["HandlerId"] },
                    {"TotalCount",converter.TaskCount(item["HandlerId"].AsString) },
                    {"Flag", output.Contains("Flag")?output["Flag"]:""},
                    {"State", item["StateDesc"]},
                    {"Percent", item["Percent"]},
                });
                percent = percent + item["Percent"].AsInt32;
            }
            result.Add("Percent", percent / list.Count());
            result.Add("StateList", stateList);
            return result;
        }
        public ActionResult GetObjectId()
        {
            return new ResponseModel<string>(ErrorCode.success, ObjectId.GenerateNewId().ToString());
        }

    }
}