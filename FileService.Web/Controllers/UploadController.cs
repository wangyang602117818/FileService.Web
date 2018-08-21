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
using FileService.Web.Filters;
using System.Text.RegularExpressions;

namespace FileService.Web.Controllers
{
    [AllowAnonymous]
    [AppAuthorize]
    public class UploadController : BaseController
    {
        string tempFileDirectory = AppDomain.CurrentDomain.BaseDirectory + AppSettings.tempFileDir + DateTime.Now.ToString("yyyyMMdd") + "\\";
        Application application = new Application();
        MongoFile mongoFile = new MongoFile();
        FilesWrap filesWrap = new FilesWrap();
        VideoCapture videoCapture = new VideoCapture();
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
                if (Request.Headers["FromApi"] == "true") ConvertAccess(accessList);
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
                    InserTask(handlerId, fileId, file.FileName, "image", Request.Headers["AppName"], new BsonDocument(), access);
                }
                else
                {
                    foreach (ImageOutPut o in output)
                    {
                        InserTask(handlerId, fileId, file.FileName, "image", Request.Headers["AppName"], o.ToBsonDocument(), access);
                    }
                }
                //日志
                Log(fileId.ToString(), "UploadImage");
                response.Add(new ImageItemResponse()
                {
                    FileId = fileId.ToString(),
                    FileName = file.FileName,
                    FileSize = file.InputStream.Length,
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
                if (Request.Headers["FromApi"] == "true") ConvertAccess(accessList);
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
                    InserTask(handlerId, fileId, file.FileName, "video", Request.Headers["AppName"], new BsonDocument(), access);
                }
                else
                {
                    foreach (VideoOutPut o in outputs)
                    {
                        InserTask(handlerId, fileId, file.FileName, "video", Request.Headers["AppName"], o.ToBsonDocument(), access);
                    }
                }
                //日志
                Log(fileId.ToString(), "UploadVideo");

                response.Add(new VideoItemResponse()
                {
                    FileId = fileId.ToString(),
                    FileName = file.FileName,
                    FileSize = file.InputStream.Length,
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
                if (Request.Headers["FromApi"] == "true") ConvertAccess(accessList);
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
                if (config.GetTypeByExtension(fileExt) == "office")
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
                if (config.GetTypeByExtension(fileExt) == "office")
                {
                    InserTask(handlerId, fileId, file.FileName, "attachment", Request.Headers["AppName"], new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Format",AttachmentOutput.pdf },
                        {"Flag","preview" } },
                        access
                    );
                }
                //zip转换任务
                else if (fileExt == ".zip" || fileExt == ".rar")
                {
                    InserTask(handlerId, fileId, file.FileName, "attachment", Request.Headers["AppName"], new BsonDocument() {
                        {"_id",ObjectId.Empty },
                        {"Flag","zip" }
                    }, access);
                }
                else
                {
                    InserTask(handlerId, fileId, file.FileName, "attachment", Request.Headers["AppName"], new BsonDocument(), access);
                }
                //日志
                Log(fileId.ToString(), "UploadAttachment");
                response.Add(new AttachmentResponse()
                {
                    FileId = fileId.ToString(),
                    FileName = file.FileName,
                    FileSize = file.InputStream.Length,
                });
            }
            return new ResponseModel<IEnumerable<AttachmentResponse>>(ErrorCode.success, response);
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

    }
}