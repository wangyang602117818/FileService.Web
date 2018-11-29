using FileService.Business;
using FileService.Model;
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
        string tempFileDirectory = AppDomain.CurrentDomain.BaseDirectory + AppSettings.tempFileDir + DateTime.Now.ToString("yyyyMMdd") + "\\";
        Extension extension = new Extension();
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
            if (!Directory.Exists(tempFileDirectory))
                Directory.CreateDirectory(tempFileDirectory);
            foreach (HttpPostedFileBase file in uploadImgModel.Images)
            {
                //过滤不正确的格式
                if (!extension.CheckFileExtensionImage(Path.GetExtension(file.FileName).ToLower()))
                {
                    response.Add(new FileResponse()
                    {
                        FileId = ObjectId.Empty.ToString(),
                        FileName = file.FileName,
                        SubFiles = new List<SubFileItem>()
                    });
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
                //上传到TempFiles
                file.SaveAs(tempFileDirectory + file.FileName);
                ObjectId fileId = ObjectId.GenerateNewId();

                filesWrap.InsertImage(fileId, ObjectId.Empty, file.FileName, file.InputStream.Length, Request.Headers["AppName"], 0, ImageExtention.GetContentType(file.FileName), thumbnail, access, Request.Headers["UserName"] ?? User.Identity.Name);

                string handlerId = converter.GetHandlerId();
                if (output.Count == 0)
                {
                    InsertTask(handlerId, fileId, file.FileName, "image", Request.Headers["AppName"], new BsonDocument(), access, Request.Headers["UserName"] ?? User.Identity.Name);
                }
                else
                {
                    foreach (ImageOutPut o in output)
                    {
                        InsertTask(handlerId, fileId, file.FileName, "image", Request.Headers["AppName"], o.ToBsonDocument(), access, Request.Headers["UserName"] ?? User.Identity.Name);
                    }
                }
                //日志
                Log(fileId.ToString(), "UploadImage");
                response.Add(new FileResponse()
                {
                    FileId = fileId.ToString(),
                    FileName = file.FileName,
                    FileSize = file.InputStream.Length,
                    SubFiles = thumbnail.Select(sel => new SubFileItem() { FileId = sel["_id"].ToString(), Flag = sel["Flag"].ToString() })
                });
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
            if (!Directory.Exists(tempFileDirectory))
                Directory.CreateDirectory(tempFileDirectory);
            foreach (HttpPostedFileBase file in uploadVideo.Videos)
            {
                //过滤不正确的格式
                if (!extension.CheckFileExtensionVideo(Path.GetExtension(file.FileName).ToLower()))
                {
                    response.Add(new FileResponse()
                    {
                        FileId = ObjectId.Empty.ToString(),
                        FileName = file.FileName,
                        SubFiles = new List<SubFileItem>()
                    });
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
                //上传到TempFiles
                file.SaveAs(tempFileDirectory + file.FileName);

                ObjectId fileId = ObjectId.GenerateNewId();

                filesWrap.InsertVideo(fileId, ObjectId.Empty, file.FileName, file.InputStream.Length, Request.Headers["AppName"], 0, file.ContentType, videos, access, Request.Headers["UserName"] ?? User.Identity.Name);

                string handlerId = converter.GetHandlerId();
                if (outputs.Count == 0)
                {
                    InsertTask(handlerId, fileId, file.FileName, "video", Request.Headers["AppName"], new BsonDocument(), access, Request.Headers["UserName"] ?? User.Identity.Name);
                }
                else
                {
                    foreach (VideoOutPut o in outputs)
                    {
                        InsertTask(handlerId, fileId, file.FileName, "video", Request.Headers["AppName"], o.ToBsonDocument(), access, Request.Headers["UserName"] ?? User.Identity.Name);
                    }
                }
                //日志
                Log(fileId.ToString(), "UploadVideo");

                response.Add(new FileResponse()
                {
                    FileId = fileId.ToString(),
                    FileName = file.FileName,
                    FileSize = file.InputStream.Length,
                    SubFiles = videos.Select(sel => new SubFileItem() { FileId = sel["_id"].ToString(), Flag = sel["Flag"].AsString })
                });
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
            if (!Directory.Exists(tempFileDirectory))
                Directory.CreateDirectory(tempFileDirectory);
            foreach (HttpPostedFileBase file in uploadAttachmentModel.Attachments)
            {
                string fileExt = Path.GetExtension(file.FileName).ToLower();
                //过滤不正确的格式
                if (!extension.CheckFileExtension(fileExt))
                {
                    response.Add(new FileResponse()
                    {
                        FileId = ObjectId.Empty.ToString(),
                        FileName = file.FileName
                    });
                    continue;
                }
                BsonArray files = new BsonArray();
                string fileType = extension.GetTypeByExtension(fileExt);
                //office
                if (fileType.ToLower() == "office")
                {
                    files.Add(new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Format",AttachmentOutput.pdf },
                        {"Flag","preview" }
                    });
                }
                //上传
                BsonArray access = new BsonArray(accessList.Select(a => a.ToBsonDocument()));
                //上传到TempFiles
                file.SaveAs(tempFileDirectory + file.FileName);

                ObjectId fileId = ObjectId.GenerateNewId();

                filesWrap.InsertAttachment(fileId,
                    ObjectId.Empty,
                    file.FileName,
                    fileType,
                    file.InputStream.Length,
                    Request.Headers["AppName"],
                    0,
                    file.ContentType,
                    files,
                    access,
                    Request.Headers["UserName"] ?? User.Identity.Name);

                string handlerId = converter.GetHandlerId();
                //office转换任务
                if (fileType == "office")
                {
                    InsertTask(handlerId, fileId, file.FileName, "attachment", Request.Headers["AppName"], new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Format",AttachmentOutput.pdf },
                        {"Flag","preview" } },
                        access,
                        Request.Headers["UserName"] ?? User.Identity.Name
                    );
                }
                //zip转换任务
                else if (fileExt == ".zip" || fileExt == ".rar")
                {
                    InsertTask(handlerId, fileId, file.FileName, "attachment", Request.Headers["AppName"], new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Flag","zip" }
                    },
                    access,
                    Request.Headers["UserName"] ?? User.Identity.Name);
                }
                else
                {
                    InsertTask(handlerId, fileId, file.FileName, "attachment", Request.Headers["AppName"], new BsonDocument(), access, Request.Headers["UserName"] ?? User.Identity.Name);
                }
                //日志
                Log(fileId.ToString(), "UploadAttachment");
                response.Add(new FileResponse()
                {
                    FileId = fileId.ToString(),
                    FileName = file.FileName,
                    FileSize = file.InputStream.Length,
                });
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
                if (!extension.CheckFileExtension(Path.GetExtension(file.FileName)))
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
                file.InputStream.Dispose();
            }
            return new ResponseModel<List<string>>(ErrorCode.success, response, response.Count);
        }
        [HttpPost]
        public ActionResult ReplaceFile(ReplaceFileModel replaceFileModel)
        {
            Log(replaceFileModel.FileId, "ReplaceFile");
            if (!Directory.Exists(tempFileDirectory))
                Directory.CreateDirectory(tempFileDirectory);
            ObjectId fileId = ObjectId.Parse(replaceFileModel.FileId);
            string fileExt = Path.GetExtension(replaceFileModel.File.FileName).ToLower();
            //过滤不正确的格式
            if (!extension.CheckFileExtension(fileExt)) return new ResponseModel<string>(ErrorCode.file_type_blocked, "");
            BsonDocument fileWrap = filesWrap.FindOne(fileId);
            string handlerId = converter.GetHandlerId();
            if (fileWrap["FileType"].AsString == replaceFileModel.FileType)
            {
                //删除文件的附加信息
                DeleteSubFiles(fileWrap);
                //保存上传的文件到共享目录
                replaceFileModel.File.SaveAs(tempFileDirectory + replaceFileModel.File.FileName);

                if(filesWrap.Update(fileWrap["_id"].AsObjectId, new BsonDocument() {
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
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            else
            {
                return new ResponseModel<string>(ErrorCode.file_type_not_match, "");
            }
        }
    }
}