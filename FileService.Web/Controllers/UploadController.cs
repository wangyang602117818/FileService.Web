﻿using FileService.Model;
using FileService.Util;
using FileService.Web.Filters;
using FileService.Web.Models;
using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    [AllowAnonymous]
    [AppAuthorize]
    public class UploadController : BaseController
    {
        [HttpPost]
        public ActionResult Image(UploadImgModel uploadImgModel)
        {
            List<FileResponse> response = new List<FileResponse>();
            List<ImageOutPut> output = new List<ImageOutPut>();
            List<AccessModel> accessList = new List<AccessModel>();
            if (Request.Headers["DefaultConvert"] == "true")
            {
                output = JsonConvert.DeserializeObject<List<ImageOutPut>>(Request.Headers["Thumbnails"]);
            }
            else
            {
                if (!string.IsNullOrEmpty(uploadImgModel.OutPut))
                {
                    output = JsonConvert.DeserializeObject<List<ImageOutPut>>(uploadImgModel.OutPut);
                }
            }
            if (!string.IsNullOrEmpty(uploadImgModel.Access))
            {
                accessList = JsonConvert.DeserializeObject<List<AccessModel>>(uploadImgModel.Access);
                if (Request.Headers["FromApi"] == "true") ConvertAccess(accessList);
            }
            foreach (HttpPostedFileBase file in uploadImgModel.Images)
            {
                //初始化参数
                string contentType = "", fileType = "", handlerId = "", saveFileType = "", saveFilePath = "", saveFileName = "";
                ObjectId saveFileId = ObjectId.Empty;
                //检测文件
                if (!CheckFileAndHandler("image", file.FileName, ref contentType, ref fileType, ref handlerId, ref saveFileType, ref saveFilePath, ref saveFileId, ref saveFileName, ref response))
                {
                    continue;
                }
                //要存到表中的数据
                BsonArray thumbnail = new BsonArray();
                foreach (ImageOutPut thumb in output)
                {
                    thumb.Id = ObjectId.GenerateNewId();
                    thumbnail.Add(new BsonDocument()
                        {
                            {"_id",thumb.Id },
                            {"Format",thumb.Format },
                            {"Flag", thumb.Flag}
                        });
                }
                BsonArray access = new BsonArray(accessList.Select(a => a.ToBsonDocument()));
                //上传文件
                if (!SaveFile(saveFileType, saveFilePath, saveFileName, file, ref response)) continue;
                filesWrap.InsertImage(saveFileId,
                    ObjectId.Empty,
                    file.FileName,
                    file.InputStream.Length,
                    Request.Headers["AppName"],
                    0,
                    fileType,
                    contentType,
                    thumbnail,
                    access,
                    uploadImgModel.ExpiredDay,
                    Request.Headers["UserCode"] ?? User.Identity.Name);

                if (output.Count == 0)
                {
                    InsertTask(handlerId, saveFileId, file.FileName, fileType, Request.Headers["AppName"], new BsonDocument(), access, Request.Headers["UserCode"] ?? User.Identity.Name);
                }
                else
                {
                    foreach (ImageOutPut o in output)
                    {
                        InsertTask(handlerId, saveFileId, file.FileName, fileType, Request.Headers["AppName"], o.ToBsonDocument(), access, Request.Headers["UserCode"] ?? User.Identity.Name);
                    }
                }
                //日志
                Log(saveFileId.ToString(), "UploadImage");
                response.Add(new FileResponse()
                {
                    FileId = saveFileId.ToString(),
                    FileName = file.FileName,
                    FileSize = file.InputStream.Length,
                    SubFiles = thumbnail.Select(sel => new SubFileItem() { FileId = sel["_id"].ToString(), Flag = sel["Flag"].ToString() })
                });
                file.InputStream.Close();
                file.InputStream.Dispose();
            }
            return new ResponseModel<IEnumerable<FileResponse>>(ErrorCode.success, response);
        }
        [HttpPost]
        public ActionResult Video(UploadVideoModel uploadVideo)
        {
            List<FileResponse> response = new List<FileResponse>();
            List<VideoOutPut> outputs = new List<VideoOutPut>();
            List<AccessModel> accessList = new List<AccessModel>();
            if (Request.Headers["DefaultConvert"] == "true")
            {
                outputs = JsonConvert.DeserializeObject<List<VideoOutPut>>(Request.Headers["Videos"]);
            }
            else
            {
                if (!string.IsNullOrEmpty(uploadVideo.OutPut))
                {
                    outputs = JsonConvert.DeserializeObject<List<VideoOutPut>>(uploadVideo.OutPut);
                }
            }
            if (!string.IsNullOrEmpty(uploadVideo.Access))
            {
                accessList = JsonConvert.DeserializeObject<List<AccessModel>>(uploadVideo.Access);
                if (Request.Headers["FromApi"] == "true") ConvertAccess(accessList);
            }
            foreach (HttpPostedFileBase file in uploadVideo.Videos)
            {
                //初始化参数
                string contentType = "", fileType = "", handlerId = "", saveFileType = "", saveFilePath = "", saveFileName = "";
                ObjectId saveFileId = ObjectId.Empty;
                if (!CheckFileAndHandler("video", file.FileName, ref contentType, ref fileType, ref handlerId, ref saveFileType, ref saveFilePath, ref saveFileId, ref saveFileName, ref response))
                {
                    continue;
                }
                //要存到表中的数据
                BsonArray videos = new BsonArray();
                foreach (VideoOutPut output in outputs)
                {
                    output.Id = ObjectId.GenerateNewId();
                    videos.Add(new BsonDocument()
                    {
                        {"_id",output.Id },
                        {"Format",output.Format },
                        {"Flag",output.Flag }
                    });
                }
                BsonArray access = new BsonArray(accessList.Select(a => a.ToBsonDocument()));
                //上传到文件
                if (!SaveFile(saveFileType, saveFilePath, saveFileName, file, ref response)) continue;
                filesWrap.InsertVideo(saveFileId,
                    ObjectId.Empty,
                    file.FileName,
                    file.InputStream.Length,
                    Request.Headers["AppName"],
                    0,
                    fileType,
                    contentType,
                    videos,
                    access,
                    uploadVideo.ExpiredDay,
                    Request.Headers["UserCode"] ?? User.Identity.Name);
                if (outputs.Count == 0)
                {
                    InsertTask(handlerId, saveFileId, file.FileName, "video", Request.Headers["AppName"], new BsonDocument(), access, Request.Headers["UserCode"] ?? User.Identity.Name);
                }
                else
                {
                    foreach (VideoOutPut o in outputs)
                    {
                        InsertTask(handlerId, saveFileId, file.FileName, "video", Request.Headers["AppName"], o.ToBsonDocument(), access, Request.Headers["UserCode"] ?? User.Identity.Name);
                    }
                }
                //日志
                Log(saveFileId.ToString(), "UploadVideo");
                response.Add(new FileResponse()
                {
                    FileId = saveFileId.ToString(),
                    FileName = file.FileName,
                    FileSize = file.InputStream.Length,
                    SubFiles = videos.Select(sel => new SubFileItem() { FileId = sel["_id"].ToString(), Flag = sel["Flag"].AsString })
                });
                file.InputStream.Close();
                file.InputStream.Dispose();
            }
            return new ResponseModel<IEnumerable<FileResponse>>(ErrorCode.success, response);
        }
        [HttpPost]
        public ActionResult Attachment(UploadAttachmentModel uploadAttachmentModel)
        {
            List<FileResponse> response = new List<FileResponse>();
            List<AccessModel> accessList = new List<AccessModel>();
            if (!string.IsNullOrEmpty(uploadAttachmentModel.Access))
            {
                accessList = JsonConvert.DeserializeObject<List<AccessModel>>(uploadAttachmentModel.Access);
                if (Request.Headers["FromApi"] == "true") ConvertAccess(accessList);
            }
            foreach (HttpPostedFileBase file in uploadAttachmentModel.Attachments)
            {
                //初始化参数
                string contentType = "", fileType = "", handlerId = "", saveFileType = "", saveFilePath = "", saveFileName = "";
                ObjectId saveFileId = ObjectId.Empty;
                if (!CheckFileAndHandler("attachment", file.FileName, ref contentType, ref fileType, ref handlerId, ref saveFileType, ref saveFilePath, ref saveFileId, ref saveFileName, ref response))
                {
                    continue;
                }
                BsonArray files = new BsonArray();
                //office
                if (fileType.ToLower() == "office")
                {
                    files.Add(new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Format",AttachmentOutput.pdf },
                        {"Flag","preview" }
                    });
                }
                BsonArray access = new BsonArray(accessList.Select(a => a.ToBsonDocument()));
                //上传到文件
                if (!SaveFile(saveFileType, saveFilePath, saveFileName, file, ref response)) continue;
                filesWrap.InsertAttachment(saveFileId,
                    ObjectId.Empty,
                    file.FileName,
                    fileType,
                    file.InputStream.Length,
                    Request.Headers["AppName"],
                    0,
                    contentType,
                    files,
                    access,
                    uploadAttachmentModel.ExpiredDay,
                    Request.Headers["UserCode"] ?? User.Identity.Name);
                //office转换任务
                if (fileType == "office")
                {
                    InsertTask(handlerId, saveFileId, file.FileName, fileType, Request.Headers["AppName"], new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Format",AttachmentOutput.pdf },
                        {"Flag","preview" } },
                        access,
                        Request.Headers["UserCode"] ?? User.Identity.Name
                    );
                }
                //zip转换任务
                else if (saveFileName.GetFileExt() == ".zip" || saveFileName.GetFileExt() == ".rar")
                {
                    InsertTask(handlerId, saveFileId, file.FileName, fileType, Request.Headers["AppName"], new BsonDocument(){
                        {"_id",ObjectId.Empty },
                        {"Flag","zip" }
                    },
                    access,
                    Request.Headers["UserCode"] ?? User.Identity.Name);
                }
                else
                {
                    InsertTask(handlerId, saveFileId, file.FileName, fileType, Request.Headers["AppName"], new BsonDocument(), access, Request.Headers["UserCode"] ?? User.Identity.Name);
                }
                //日志
                Log(saveFileId.ToString(), "UploadAttachment");
                response.Add(new FileResponse()
                {
                    FileId = saveFileId.ToString(),
                    FileName = file.FileName,
                    FileSize = file.InputStream.Length,
                });
                file.InputStream.Close();
                file.InputStream.Dispose();
            }
            return new ResponseModel<IEnumerable<FileResponse>>(ErrorCode.success, response);
        }
        [HttpPost]
        public ActionResult VideoCapture(UploadVideoCPModel uploadVideoCPModel)
        {
            BsonDocument fileWrap = filesWrap.FindOne(ObjectId.Parse(uploadVideoCPModel.FileId));
            if (fileWrap == null) return new ResponseModel<string>(ErrorCode.record_not_exist, "");
            string[] imageBase64 = uploadVideoCPModel.FileBase64.Split(',');
            byte[] image = Convert.FromBase64String(Base64SecureURL.Decode(imageBase64.Length >= 2 ? imageBase64[1] : imageBase64[0]));
            ObjectId id = ObjectId.GenerateNewId();
            BsonDocument document = new BsonDocument()
            {
                {"_id",id },
                {"From",Request.Headers["AppName"] },
                {"SourceId",ObjectId.Parse(uploadVideoCPModel.FileId) },
                {"Length",image.Length },
                {"FileName",Path.GetFileNameWithoutExtension(fileWrap["FileName"].AsString)+".png" },
                {"File",image },
                {"CreateTime",DateTime.Now }
            };
            videoCapture.Insert(document);
            filesWrap.AddVideoCapture(ObjectId.Parse(uploadVideoCPModel.FileId), id);
            //日志
            Log(uploadVideoCPModel.FileId, "UploadVideoCapture");
            return new ResponseModel<string>(ErrorCode.success, id.ToString());
        }
        [HttpPost]
        public ActionResult VideoCaptureStream(UploadVideoCPStreamModel uploadVideoCPStreamModel)
        {
            List<string> response = new List<string>();
            foreach (HttpPostedFileBase file in uploadVideoCPStreamModel.VideoCPs)
            {
                //过滤不正确的格式
                string contentType = "";
                string fileType = "";
                if (!extension.CheckFileExtension(Path.GetExtension(file.FileName), ref contentType, ref fileType))
                {
                    response.Add(ObjectId.Empty.ToString());
                    continue;
                }
                ObjectId id = ObjectId.GenerateNewId();
                BsonDocument document = new BsonDocument()
                {
                    {"_id",id },
                    {"From",Request.Headers["AppName"] },
                    {"SourceId",ObjectId.Parse(uploadVideoCPStreamModel.FileId) },
                    {"Length",file.InputStream.Length },
                    {"FileName",file.FileName },
                    {"File",file.InputStream.ToBytes() },
                    {"CreateTime",DateTime.Now }
                };
                videoCapture.InsertOneAsync(document);
                filesWrap.AddVideoCapture(ObjectId.Parse(uploadVideoCPStreamModel.FileId), id);
                //日志
                Log(id.ToString(), "UploadVideoCaptureStream");
                response.Add(id.ToString());
                file.InputStream.Close();
                file.InputStream.Dispose();
            }
            return new ResponseModel<List<string>>(ErrorCode.success, response, response.Count);
        }
        [HttpPost]
        public ActionResult ReplaceFile(ReplaceFileModel replaceFileModel)
        {
            ObjectId fileId = ObjectId.Parse(replaceFileModel.FileId);
            string contentType = "",
                fileType = "",
                handlerId = "",
                saveFileType = "",
                saveFilePath = "",
                saveFileName = fileId.ToString()+ replaceFileModel.File.FileName.GetFileExt();
            List<FileResponse> response = new List<FileResponse>();
            if (!CheckFileAndHandler("attachment", replaceFileModel.File.FileName, ref contentType, ref fileType, ref handlerId, ref saveFileType, ref saveFilePath, ref fileId, ref saveFileName, ref response))
            {
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            BsonDocument fileWrap = filesWrap.FindOne(fileId);
            if (fileWrap["FileType"].AsString == replaceFileModel.FileType)
            {
                //删除文件的附加信息
                DeleteSubFiles(fileWrap);
                //上传文件
                if (!SaveFile(saveFileType, saveFilePath, saveFileName, replaceFileModel.File, ref response))
                {
                    return new ResponseModel<string>(ErrorCode.api_not_available, "");
                }
                if (filesWrap.Update(fileWrap["_id"].AsObjectId, new BsonDocument() {
                        {"FileName", replaceFileModel.File.FileName },
                        {"Length",replaceFileModel.File.InputStream.Length },
                        {"Download",0 }
                     }))
                {
                    filesWrap.AddHistory(fileWrap["_id"].AsObjectId, fileWrap["FileId"].AsObjectId);
                }
                IEnumerable<BsonDocument> list = task.Find(new BsonDocument("FileId", fileId));
                foreach (BsonDocument item in list)
                {
                    UpdateTask(item["_id"].AsObjectId, handlerId, replaceFileModel.File.FileName, item["Type"].AsString, 0, TaskStateEnum.wait);
                }
                Log(replaceFileModel.FileId, "ReplaceFile");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            else
            {
                return new ResponseModel<string>(ErrorCode.file_type_not_match, "");
            }
        }
    }
}