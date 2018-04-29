using FileService.Web.Models;
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

namespace FileService.Web.Controllers
{
    [AllowAnonymous]
    public class UploadController : BaseController
    {
        Application application = new Application();
        MongoFile mongoFile = new MongoFile();
        Files files = new Files();
        Converter converter = new Converter();
        Business.Task task = new Business.Task();
        VideoCapture videoCapture = new VideoCapture();
        Queue queue = new Queue();
        Config config = new Config();
        [HttpPost]
        public ActionResult Video(UploadVideoModel uploadVideo)
        {
            if (!application.FindByApplicationName(uploadVideo.AppName)) return new ResponseModel<string>(ErrorCode.appname_not_exist, "");
            List<VideoItemResponse> response = new List<VideoItemResponse>();
            List<VideoOutPut> outputs = new List<VideoOutPut>();
            if (!string.IsNullOrEmpty(uploadVideo.OutPut))
            {
                outputs = JsonConvert.DeserializeObject<List<VideoOutPut>>(uploadVideo.OutPut);
            }
            foreach (HttpPostedFileBase file in uploadVideo.Videos)
            {
                //过滤不正确的格式
                if (!config.CheckFileExtensionVideo(Path.GetExtension(file.FileName)))
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
                Task<ObjectId> oId = mongoFile.UploadAsync(file.FileName, file.InputStream, new BsonDocument()
                    {
                        {"From", uploadVideo.AppName},
                        {"FileType","video"},
                        {"ContentType",file.ContentType},
                        {"Videos",videos },
                        {"VideoCpIds",new BsonArray() }
                    });
                //日志
                Log(uploadVideo.AppName, oId.Result.ToString(), "UploadVideo");
                foreach (VideoOutPut v in outputs)
                {
                    string handlerId = converter.GetHandlerId();
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
        public ActionResult Image(UploadImgModel uploadImgModel)
        {
            if (!application.FindByApplicationName(uploadImgModel.AppName)) return new ResponseModel<string>(ErrorCode.appname_not_exist, "");
            List<ImageItemResponse> response = new List<ImageItemResponse>();
            List<ImageOutPut> output = new List<ImageOutPut>();
            if (!string.IsNullOrEmpty(uploadImgModel.OutPut))
            {
                output = JsonConvert.DeserializeObject<List<ImageOutPut>>(uploadImgModel.OutPut);
            }
            //预先组织好缩略图对象
            foreach (HttpPostedFileBase file in uploadImgModel.Images)
            {
                //过滤不正确的格式
                if (!config.CheckFileExtensionImage(Path.GetExtension(file.FileName)))
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
                //上传
                Task<ObjectId> oId = mongoFile.UploadAsync(file.FileName, file.InputStream, new BsonDocument()
                    {
                        {"From", uploadImgModel.AppName},
                        {"FileType","image"},
                        {"ContentType",ImageExtention.GetContentType(file.FileName)},
                        {"Thumbnail",thumbnail }
                    });
                foreach (ImageOutPut o in output)
                {
                    //添加转换消息
                    string handlerId = converter.GetHandlerId();
                    converter.AddCount(handlerId, 1);
                    ObjectId taskId = ObjectId.GenerateNewId();
                    task.Insert(taskId, oId.Result, file.FileName, "image", o.ToBsonDocument(), handlerId, TaskStateEnum.wait, 0);
                    //添加队列
                    queue.Insert(handlerId, "image", "Task", taskId, false, new BsonDocument());
                }
                //日志
                Log(uploadImgModel.AppName, oId.Result.ToString(), "UploadImage");
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
        public ActionResult Attachment(UploadAttachmentModel uploadAttachmentModel)
        {
            if (!application.FindByApplicationName(uploadAttachmentModel.AppName)) return new ResponseModel<string>(ErrorCode.appname_not_exist, "");
            List<AttachmentResponse> response = new List<AttachmentResponse>();
            foreach (HttpPostedFileBase file in uploadAttachmentModel.Attachments)
            {
                //过滤不正确的格式
                if (!config.CheckFileExtension(Path.GetExtension(file.FileName)))
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
                if (OfficeFormatList.offices.Contains(Path.GetExtension(file.FileName).ToLower()))
                {
                    files.Add(new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Format",AttachmentOutput.pdf },
                        {"Flag","preview" }
                    });
                }
                //zip转换任务
                if (Path.GetExtension(file.FileName).ToLower() == ".zip")
                {
                    files = file.InputStream.GetDeCompressionZipFiles();
                }
                //上传
                Task<ObjectId> oId = mongoFile.UploadAsync(file.FileName, file.InputStream, new BsonDocument()
                    {
                        {"From", uploadAttachmentModel.AppName},
                        {"FileType","attachment"},
                        {"ContentType",file.ContentType},
                        {"Files",files }
                    });
                //office转换任务
                if (OfficeFormatList.offices.Contains(Path.GetExtension(file.FileName)))
                {
                    string handlerId = converter.GetHandlerId();
                    converter.AddCount(handlerId, 1);
                    ObjectId taskId = ObjectId.GenerateNewId();
                    task.Insert(taskId, oId.Result, file.FileName, "attachment", new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Format",AttachmentOutput.pdf },
                        {"Flag","office_pdf_version" }
                    }, handlerId, TaskStateEnum.wait, 0);
                    //添加队列
                    queue.Insert(handlerId, "attachment", "Task", taskId, false, new BsonDocument());
                }
                //日志
                Log(uploadAttachmentModel.AppName, oId.Result.ToString(), "UploadAttachment");
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
            if (!application.FindByApplicationName(uploadVideoCPModel.AppName)) return new ResponseModel<string>(ErrorCode.appname_not_exist, "");
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
            files.AddVideoCapture(ObjectId.Parse(uploadVideoCPModel.FileId), id);
            //日志
            Log(uploadVideoCPModel.AppName, uploadVideoCPModel.FileId, "UploadVideoCapture");
            return new ResponseModel<string>(ErrorCode.success, id.ToString());
        }
        [HttpPost]
        public ActionResult VideoCaptureStream(UploadVideoCPStreamModel uploadVideoCPStreamModel)
        {
            if (!application.FindByApplicationName(uploadVideoCPStreamModel.AppName)) return new ResponseModel<string>(ErrorCode.appname_not_exist, "");
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
                files.AddVideoCapture(ObjectId.Parse(uploadVideoCPStreamModel.FileId), id);
                //日志
                Log(uploadVideoCPStreamModel.AppName, id.ToString(), "UploadVideoCaptureStream");
                response.Add(id.ToString());
            }
            return new ResponseModel<List<string>>(ErrorCode.success, response, response.Count);
        }
    }
}