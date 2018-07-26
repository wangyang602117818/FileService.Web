﻿using FileService.Web.Models;
using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using FileService.Web.Filters;

namespace FileService.Web.Controllers
{
    [AllowAnonymous]
    [AppAuthorize]
    public class UploadController : BaseController
    {
        string tempFileDirectory = AppDomain.CurrentDomain.BaseDirectory + AppSettings.tempFileDir + DateTime.Now.ToString("yyyyMMdd") + "\\";
        Application application = new Application();
        MongoFile mongoFile = new MongoFile();
        Files files = new Files();
        FilesWrap filesWrap = new FilesWrap();
        Converter converter = new Converter();
        Business.Task task = new Business.Task();
        VideoCapture videoCapture = new VideoCapture();
        Queue queue = new Queue();
        Config config = new Config();
        [HttpPost]
        public ActionResult Image(UploadImgModel uploadImgModel)
        {
            List<ImageItemResponse> response = new List<ImageItemResponse>();
            List<ImageOutPut> output = new List<ImageOutPut>();
            List<AccessModel> accessList = new List<AccessModel>();

            if (!string.IsNullOrEmpty(uploadImgModel.OutPut))
            {
                output = JsonConvert.DeserializeObject<List<ImageOutPut>>(uploadImgModel.OutPut);
            }
            if (!string.IsNullOrEmpty(uploadImgModel.Access))
            {
                accessList = JsonConvert.DeserializeObject<List<AccessModel>>(uploadImgModel.Access);
            }
            //预先组织好缩略图对象
            foreach (HttpPostedFileBase file in uploadImgModel.Images)
            {
                //过滤不正确的格式
                if (!config.CheckFileExtensionImage(Path.GetExtension(file.FileName).ToLower()))
                {
                    response.Add(new ImageItemResponse()
                    {
                        FileId = ObjectId.Empty.ToString(),
                        FileName = file.FileName,
                        Thumbnail = new List<ThumbnailItem>()
                    });
                    continue;
                }
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
                //上传
                Task<ObjectId> oId = mongoFile.UploadAsync(file.FileName, file.InputStream, new BsonDocument()
                    {
                        {"From", Request.Headers["AppName"]},
                        {"FileType","image"},
                        {"ContentType",ImageExtention.GetContentType(file.FileName)},
                        {"Thumbnail",thumbnail },
                        {"Access",access },
                        {"Owner",Request.Headers["UserName"] ?? User.Identity.Name }
                    });
                string handlerId = converter.GetHandlerId();
                foreach (ImageOutPut o in output)
                {
                    converter.AddCount(handlerId, 1);
                    ObjectId taskId = ObjectId.GenerateNewId();
                    task.Insert(taskId, oId.Result, file.FileName, "image", o.ToBsonDocument(), handlerId, TaskStateEnum.wait, 0);
                    //添加队列
                    queue.Insert(handlerId, "image", "Task", taskId, false, new BsonDocument());
                }
                //日志
                Log(oId.Result.ToString(), "UploadImage");
                response.Add(new ImageItemResponse()
                {
                    FileId = oId.Result.ToString(),
                    FileName = file.FileName,
                    Thumbnail = thumbnail.Select(sel => new ThumbnailItem() { FileId = sel["_id"].ToString(), Flag = sel["Flag"].ToString() })
                });
            }
            return new ResponseModel<IEnumerable<ImageItemResponse>>(ErrorCode.success, response);
        }
        [HttpPost]
        public ActionResult Video(UploadVideoModel uploadVideo)
        {
            List<VideoItemResponse> response = new List<VideoItemResponse>();
            List<VideoOutPut> outputs = new List<VideoOutPut>();
            List<AccessModel> accessList = new List<AccessModel>();
            if (!string.IsNullOrEmpty(uploadVideo.OutPut))
            {
                outputs = JsonConvert.DeserializeObject<List<VideoOutPut>>(uploadVideo.OutPut);
            }
            if (!string.IsNullOrEmpty(uploadVideo.Access))
            {
                accessList = JsonConvert.DeserializeObject<List<AccessModel>>(uploadVideo.Access);
            }
            foreach (HttpPostedFileBase file in uploadVideo.Videos)
            {
                //过滤不正确的格式
                if (!config.CheckFileExtensionVideo(Path.GetExtension(file.FileName).ToLower()))
                {
                    response.Add(new VideoItemResponse()
                    {
                        FileId = ObjectId.Empty.ToString(),
                        FileName = file.FileName,
                        Videos = new List<VideoItem>()
                    });
                    continue;
                }
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
                Task<ObjectId> oId = mongoFile.UploadAsync(file.FileName, file.InputStream, new BsonDocument()
                    {
                        {"From", Request.Headers["AppName"]},
                        {"FileType","video"},
                        {"ContentType",file.ContentType},
                        {"Videos",videos },
                        {"VideoCpIds",new BsonArray() },
                        {"Access",access },
                        {"Owner",Request.Headers["UserName"] ?? User.Identity.Name }
                    });
                //日志
                Log(oId.Result.ToString(), "UploadVideo");
                string handlerId = converter.GetHandlerId();
                foreach (VideoOutPut v in outputs)
                {
                    converter.AddCount(handlerId, 1);
                    ObjectId taskId = ObjectId.GenerateNewId();
                    //添加转换消息
                    task.Insert(taskId, oId.Result, file.FileName, "video", v.ToBsonDocument(), handlerId, TaskStateEnum.wait, 0);
                    //添加队列
                    queue.Insert(handlerId, "video", "Task", taskId, false, new BsonDocument());
                }
                response.Add(new VideoItemResponse()
                {
                    FileId = oId.Result.ToString(),
                    FileName = file.FileName,
                    Videos = videos.Select(sel => new VideoItem() { FileId = sel["_id"].ToString(), Flag = sel["Flag"].AsString })
                });
            }
            return new ResponseModel<IEnumerable<VideoItemResponse>>(ErrorCode.success, response);
        }
        [HttpPost]
        public ActionResult Attachment(UploadAttachmentModel uploadAttachmentModel)
        {
            List<AttachmentResponse> response = new List<AttachmentResponse>();
            List<AccessModel> accessList = new List<AccessModel>();
            if (!string.IsNullOrEmpty(uploadAttachmentModel.Access))
            {
                accessList = JsonConvert.DeserializeObject<List<AccessModel>>(uploadAttachmentModel.Access);
            }
            foreach (HttpPostedFileBase file in uploadAttachmentModel.Attachments)
            {
                string fileExt = Path.GetExtension(file.FileName).ToLower();
                //过滤不正确的格式
                if (!config.CheckFileExtension(fileExt))
                {
                    response.Add(new AttachmentResponse()
                    {
                        FileId = ObjectId.Empty.ToString(),
                        FileName = file.FileName
                    });
                    continue;
                }
                BsonArray files = new BsonArray();
                //office
                if (OfficeFormatList.offices.Contains(fileExt))
                {
                    files.Add(new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Format",AttachmentOutput.pdf },
                        {"Flag","preview" }
                    });
                }
                //上传
                BsonArray access = new BsonArray(accessList.Select(a => a.ToBsonDocument()));
                Task<ObjectId> oId = mongoFile.UploadAsync(file.FileName, file.InputStream, new BsonDocument()
                    {
                        {"From", Request.Headers["AppName"]},
                        {"FileType","attachment"},
                        {"ContentType",file.ContentType},
                        {"Files",files },
                        {"Access",access },
                        {"Owner",Request.Headers["UserName"] ?? User.Identity.Name }
                    });
                //office转换任务
                if (OfficeFormatList.offices.Contains(fileExt))
                {
                    string handlerId = converter.GetHandlerId();
                    converter.AddCount(handlerId, 1);
                    ObjectId taskId = ObjectId.GenerateNewId();
                    task.Insert(taskId, oId.Result, file.FileName, "attachment", new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Format",AttachmentOutput.pdf },
                        {"Flag","preview" }
                    }, handlerId, TaskStateEnum.wait, 0);
                    //添加队列
                    queue.Insert(handlerId, "attachment", "Task", taskId, false, new BsonDocument());
                }
                //zip转换任务
                if (fileExt == ".zip" || fileExt == ".rar")
                {
                    string handlerId = converter.GetHandlerId();
                    converter.AddCount(handlerId, 1);
                    ObjectId taskId = ObjectId.GenerateNewId();
                    task.Insert(taskId, oId.Result, file.FileName, "attachment", new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Flag","zip" }
                    }, handlerId, TaskStateEnum.wait, 0);
                    //添加队列
                    queue.Insert(handlerId, "attachment", "Task", taskId, false, new BsonDocument());
                }
                //日志
                Log(oId.Result.ToString(), "UploadAttachment");
                response.Add(new AttachmentResponse()
                {
                    FileId = oId.Result.ToString(),
                    FileName = file.FileName
                });
            }
            return new ResponseModel<IEnumerable<AttachmentResponse>>(ErrorCode.success, response);
        }
        [HttpPost]
        public ActionResult VideoCapture(UploadVideoCPModel uploadVideoCPModel)
        {
            BsonDocument file = files.FindOne(ObjectId.Parse(uploadVideoCPModel.FileId));
            if (file == null) return new ResponseModel<string>(ErrorCode.record_not_exist, "");
            string[] imageBase64 = uploadVideoCPModel.FileBase64.Split(',');
            byte[] image = Convert.FromBase64String(Base64SecureURL.Decode(imageBase64.Length >= 2 ? imageBase64[1] : imageBase64[0]));
            ObjectId id = ObjectId.GenerateNewId();
            BsonDocument document = new BsonDocument()
            {
                {"_id",id },
                {"SourceId",ObjectId.Parse(uploadVideoCPModel.FileId) },
                {"Length",image.Length },
                {"FileName",Path.GetFileNameWithoutExtension(file["filename"].AsString)+".png" },
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
                if (!config.CheckFileExtension(Path.GetExtension(file.FileName)))
                {
                    response.Add(ObjectId.Empty.ToString());
                    continue;
                }
                ObjectId id = ObjectId.GenerateNewId();
                BsonDocument document = new BsonDocument()
                {
                    {"_id",id },
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
            }
            return new ResponseModel<List<string>>(ErrorCode.success, response, response.Count);
        }

        [HttpPost]
        public ActionResult Image1(UploadImgModel uploadImgModel)
        {
            List<ImageItemResponse> response = new List<ImageItemResponse>();
            List<ImageOutPut> output = new List<ImageOutPut>();
            List<AccessModel> accessList = new List<AccessModel>();

            if (!string.IsNullOrEmpty(uploadImgModel.OutPut))
            {
                output = JsonConvert.DeserializeObject<List<ImageOutPut>>(uploadImgModel.OutPut);
            }
            if (!string.IsNullOrEmpty(uploadImgModel.Access))
            {
                accessList = JsonConvert.DeserializeObject<List<AccessModel>>(uploadImgModel.Access);
            }
            if (!Directory.Exists(tempFileDirectory))
                Directory.CreateDirectory(tempFileDirectory);
            foreach (HttpPostedFileBase file in uploadImgModel.Images)
            {
                //过滤不正确的格式
                if (!config.CheckFileExtensionImage(Path.GetExtension(file.FileName).ToLower()))
                {
                    response.Add(new ImageItemResponse()
                    {
                        FileId = ObjectId.Empty.ToString(),
                        FileName = file.FileName,
                        Thumbnail = new List<ThumbnailItem>()
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

                filesWrap.InsertImage(fileId, ObjectId.Empty, file.FileName, file.InputStream.Length, Request.Headers["AppName"], ImageExtention.GetContentType(file.FileName), thumbnail, access, Request.Headers["UserName"] ?? User.Identity.Name);

                string handlerId = converter.GetHandlerId();
                if (output.Count == 0)
                {
                    InserTask(handlerId, fileId, file.FileName, "image", new BsonDocument(), access);
                }
                else
                {
                    foreach (ImageOutPut o in output)
                    {
                        InserTask(handlerId, fileId, file.FileName, "image", o.ToBsonDocument(), access);
                    }
                }
                //日志
                Log(fileId.ToString(), "UploadImage");
                response.Add(new ImageItemResponse()
                {
                    FileId = fileId.ToString(),
                    FileName = file.FileName,
                    Thumbnail = thumbnail.Select(sel => new ThumbnailItem() { FileId = sel["_id"].ToString(), Flag = sel["Flag"].ToString() })
                });
            }
            return new ResponseModel<IEnumerable<ImageItemResponse>>(ErrorCode.success, response);
        }
        [HttpPost]
        public ActionResult Video1(UploadVideoModel uploadVideo)
        {
            List<VideoItemResponse> response = new List<VideoItemResponse>();
            List<VideoOutPut> outputs = new List<VideoOutPut>();
            List<AccessModel> accessList = new List<AccessModel>();
            if (!string.IsNullOrEmpty(uploadVideo.OutPut))
            {
                outputs = JsonConvert.DeserializeObject<List<VideoOutPut>>(uploadVideo.OutPut);
            }
            if (!string.IsNullOrEmpty(uploadVideo.Access))
            {
                accessList = JsonConvert.DeserializeObject<List<AccessModel>>(uploadVideo.Access);
            }
            if (!Directory.Exists(tempFileDirectory))
                Directory.CreateDirectory(tempFileDirectory);
            foreach (HttpPostedFileBase file in uploadVideo.Videos)
            {
                //过滤不正确的格式
                if (!config.CheckFileExtensionVideo(Path.GetExtension(file.FileName).ToLower()))
                {
                    response.Add(new VideoItemResponse()
                    {
                        FileId = ObjectId.Empty.ToString(),
                        FileName = file.FileName,
                        Videos = new List<VideoItem>()
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

                filesWrap.InsertVideo(fileId, ObjectId.Empty, file.FileName, file.InputStream.Length, Request.Headers["AppName"], file.ContentType, videos, new BsonArray(), access, Request.Headers["UserName"] ?? User.Identity.Name);

                string handlerId = converter.GetHandlerId();
                if (outputs.Count == 0)
                {
                    InserTask(handlerId, fileId, file.FileName, "video", new BsonDocument(), access);
                }
                else
                {
                    foreach (VideoOutPut o in outputs)
                    {
                        InserTask(handlerId, fileId, file.FileName, "video", o.ToBsonDocument(), access);
                    }
                }
                //日志
                Log(fileId.ToString(), "UploadVideo");

                response.Add(new VideoItemResponse()
                {
                    FileId = fileId.ToString(),
                    FileName = file.FileName,
                    Videos = videos.Select(sel => new VideoItem() { FileId = sel["_id"].ToString(), Flag = sel["Flag"].AsString })
                });
            }
            return new ResponseModel<IEnumerable<VideoItemResponse>>(ErrorCode.success, response);
        }
        [HttpPost]
        public ActionResult Attachment1(UploadAttachmentModel uploadAttachmentModel)
        {
            List<AttachmentResponse> response = new List<AttachmentResponse>();
            List<AccessModel> accessList = new List<AccessModel>();
            if (!string.IsNullOrEmpty(uploadAttachmentModel.Access))
            {
                accessList = JsonConvert.DeserializeObject<List<AccessModel>>(uploadAttachmentModel.Access);
            }
            if (!Directory.Exists(tempFileDirectory))
                Directory.CreateDirectory(tempFileDirectory);
            foreach (HttpPostedFileBase file in uploadAttachmentModel.Attachments)
            {
                string fileExt = Path.GetExtension(file.FileName).ToLower();
                //过滤不正确的格式
                if (!config.CheckFileExtension(fileExt))
                {
                    response.Add(new AttachmentResponse()
                    {
                        FileId = ObjectId.Empty.ToString(),
                        FileName = file.FileName
                    });
                    continue;
                }
                BsonArray files = new BsonArray();
                //office
                if (OfficeFormatList.offices.Contains(fileExt))
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
                    file.InputStream.Length, 
                    Request.Headers["AppName"], 
                    file.ContentType, 
                    files, 
                    access, 
                    Request.Headers["UserName"] ?? User.Identity.Name);

                string handlerId = converter.GetHandlerId();
                //office转换任务
                if (OfficeFormatList.offices.Contains(fileExt))
                {
                    InserTask(handlerId, fileId, file.FileName, "attachment", new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Format",AttachmentOutput.pdf },
                        {"Flag","preview" } },
                        access
                    );
                }
                //zip转换任务
                else if (fileExt == ".zip" || fileExt == ".rar")
                {
                    InserTask(handlerId, fileId, file.FileName, "attachment", new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Flag","zip" }
                    }, access);
                }
                else
                {
                    InserTask(handlerId, fileId, file.FileName, "attachment", new BsonDocument(), access);
                }
                //日志
                Log(fileId.ToString(), "UploadAttachment");
                response.Add(new AttachmentResponse()
                {
                    FileId = fileId.ToString(),
                    FileName = file.FileName
                });
            }
            return new ResponseModel<IEnumerable<AttachmentResponse>>(ErrorCode.success, response);
        }
        private void InserTask(string handlerId, ObjectId fileId, string fileName, string type, BsonDocument outPut, BsonArray access)
        {
            converter.AddCount(handlerId, 1);
            ObjectId taskId = ObjectId.GenerateNewId();
            task.Insert(taskId, fileId,
                @"\\" + Environment.MachineName + "\\TempFiles\\" + DateTime.Now.ToString("yyyyMMdd") + "\\", fileName,
                type, outPut, access, handlerId, 0, TaskStateEnum.wait, 0);
            //添加队列
            queue.Insert(handlerId, type, "Task", taskId, false, new BsonDocument());
        }
    }
}