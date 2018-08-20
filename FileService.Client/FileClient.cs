using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Client
{
    /// <summary>
    /// 文件服务的客户端
    /// </summary>
    public class FileClient
    {
        /// <summary>
        /// 标明上传的文件来自于哪个应用程序（文件服务器统计数据时候使用，不同的application使用不同的 AuthCode）
        /// </summary>
        public string AuthCode { get; set; }
        /// <summary>
        /// 文件服务器的url
        /// </summary>
        public string RemoteUrl { get; set; }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="authCode">标明上传的文件来自于哪个应用程序（文件服务器统计数据时候使用，不同的application使用不同的 AuthCode）</param>
        /// <param name="remoteUrl">文件服务器的url</param>
        public FileClient(string authCode, string remoteUrl) { AuthCode = authCode; RemoteUrl = remoteUrl; }
        /// <summary>
        /// 上传单张图片
        /// </summary>
        /// <param name="fileName">文件名</param>
        /// <param name="stream">文件流</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<ImageFileResult>> UploadImage(string fileName, Stream stream)
        {
            return UploadImage(fileName, stream, null, null, null);
        }
        /// <summary>
        /// 上传单张图片
        /// </summary>
        /// <param name="fileName">文件名称</param>
        /// <param name="stream">文件流</param>
        /// <param name="userData">用户信息</param>
        /// <param name="userAccesses">访问权限信息</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<ImageFileResult>> UploadImage(string fileName, Stream stream, UserData userData, IEnumerable<UserAccess> userAccesses)
        {
            return UploadImage(fileName, stream, null, userData, userAccesses);
        }
        /// <summary>
        /// 上传单张图片，单个转换任务
        /// </summary>
        /// <param name="fileName">文件名</param>
        /// <param name="stream">文件流</param>
        /// <param name="convert">转换规则</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<ImageFileResult>> UploadImage(string fileName, Stream stream, ImageConvert convert)
        {
            return UploadImage(fileName, stream, convert, null, null);
        }
        /// <summary>
        /// 上传单张图片，单个转换任务
        /// </summary>
        /// <param name="fileName">文件名称</param>
        /// <param name="stream">文件流</param>
        /// <param name="convert">转换规则</param>
        /// <param name="userData">用户信息</param>
        /// <param name="userAccesses">访问权限信息</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<ImageFileResult>> UploadImage(string fileName, Stream stream, ImageConvert convert, UserData userData, IEnumerable<UserAccess> userAccesses)
        {
            IEnumerable<FileItem> fileCollection = new List<FileItem>()
            {
                new FileItem() { FileName = fileName, FileStream = stream }
            };
            return UploadImage(fileCollection, convert, userData, userAccesses);
        }
        /// <summary>
        /// 上传多张图片，单个转换任务
        /// </summary>
        /// <param name="images">图片列表</param>
        /// <param name="convert">转换规则</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<ImageFileResult>> UploadImage(IEnumerable<FileItem> images, ImageConvert convert)
        {
            return UploadImage(images, convert, null, null);
        }
        /// <summary>
        /// 上传多张图片，单个转换任务
        /// </summary>
        /// <param name="images">图片列表</param>
        /// <param name="convert">转换规则</param>
        /// <param name="userData">用户信息</param>
        /// <param name="userAccesses">访问权限信息</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<ImageFileResult>> UploadImage(IEnumerable<FileItem> images, ImageConvert convert, UserData userData, IEnumerable<UserAccess> userAccesses)
        {
            IEnumerable<ImageConvert> converts = convert == null ? null : new List<ImageConvert>() { convert };
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers.Add("AuthCode", AuthCode);
            headers.Add("FromApi", "true");
            if (userData != null)
            {
                if (!string.IsNullOrEmpty(userData.UserName)) headers.Add("UserName", userData.UserName);
                if (!string.IsNullOrEmpty(userData.UserAgent)) headers.Add("UserAgent", userData.UserAgent);
                if (!string.IsNullOrEmpty(userData.UserIp)) headers.Add("UserIp", userData.UserIp);
            }
            return UploadImage(images, converts, userAccesses, headers);
        }
        /// <summary>
        /// 上传多张图片，多个转换任务
        /// </summary>
        /// <param name="images">文件集合</param>
        /// <param name="converts">转换任务集合</param>
        /// <param name="headers">头信息</param>
        /// <param name="userAccesses">访问权限信息</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<ImageFileResult>> UploadImage(IEnumerable<FileItem> images, IEnumerable<ImageConvert> converts, IEnumerable<UserAccess> userAccesses, Dictionary<string, string> headers)
        {
            Task<string> result = new HttpRequestHelper().PostFileImage(RemoteUrl + "/upload/image", images, converts, userAccesses, headers);
            return JsonConvert.DeserializeObject<ResultBase<IEnumerable<ImageFileResult>>>(result.Result);
        }

        /// <summary>
        /// 上传单个视频
        /// </summary>
        /// <param name="fileName">文件名</param>
        /// <param name="stream">文件流</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<VideoFileResult>> UploadVideo(string fileName, Stream stream)
        {
            return UploadVideo(fileName, stream, null, null, null);
        }
        /// <summary>
        /// 上传单个视频
        /// </summary>
        /// <param name="fileName">文件名</param>
        /// <param name="stream">文件流</param>
        /// <param name="userData">用户信息</param>
        /// <param name="userAccesses">访问权限信息</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<VideoFileResult>> UploadVideo(string fileName, Stream stream, UserData userData, IEnumerable<UserAccess> userAccesses)
        {
            return UploadVideo(fileName, stream, null, userData, userAccesses);
        }
        /// <summary>
        /// 上传单个视频，单个转换任务
        /// </summary>
        /// <param name="fileName">文件名</param>
        /// <param name="stream">文件流</param>
        /// <param name="convert">转换任务</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<VideoFileResult>> UploadVideo(string fileName, Stream stream, VideoConvert convert)
        {
            return UploadVideo(fileName, stream, convert, null, null);
        }
        /// <summary>
        /// 上传单个视频，单个转换任务
        /// </summary>
        /// <param name="fileName">文件名</param>
        /// <param name="stream">文件流</param>
        /// <param name="convert">转换任务</param>
        /// <param name="userData">用户信息</param>
        /// <param name="userAccesses">访问权限信息</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<VideoFileResult>> UploadVideo(string fileName, Stream stream, VideoConvert convert, UserData userData, IEnumerable<UserAccess> userAccesses)
        {
            IEnumerable<FileItem> videos = new List<FileItem>()
            {
                new FileItem() { FileName = fileName, FileStream = stream }
            };
            return UploadVideo(videos, convert, userData, userAccesses);
        }
        /// <summary>
        /// 上传多个视频，单个转换任务
        /// </summary>
        /// <param name="videos"></param>
        /// <param name="convert"></param>
        /// <returns></returns>
        public ResultBase<IEnumerable<VideoFileResult>> UploadVideo(IEnumerable<FileItem> videos, VideoConvert convert)
        {
            return UploadVideo(videos, convert, null, null);
        }
        /// <summary>
        /// 上传多个视频，单个转换任务
        /// </summary>
        /// <param name="videos">文件列表</param>
        /// <param name="convert">转换任务</param>
        /// <param name="userData">用户信息</param>
        /// <param name="userAccesses">访问权限信息</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<VideoFileResult>> UploadVideo(IEnumerable<FileItem> videos, VideoConvert convert, UserData userData, IEnumerable<UserAccess> userAccesses)
        {
            IEnumerable<VideoConvert> converts = convert == null ? null : new List<VideoConvert>() { convert };
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers.Add("AuthCode", AuthCode);
            headers.Add("FromApi", "true");
            if (userData != null)
            {
                if (!string.IsNullOrEmpty(userData.UserName)) headers.Add("UserName", userData.UserName);
                if (!string.IsNullOrEmpty(userData.UserAgent)) headers.Add("UserAgent", userData.UserAgent);
                if (!string.IsNullOrEmpty(userData.UserIp)) headers.Add("UserIp", userData.UserIp);
            }
            return UploadVideo(videos, converts, userAccesses, headers);
        }
        /// <summary>
        /// 上传多个视频，多个转换任务
        /// </summary>
        /// <param name="videos">视频列表</param>
        /// <param name="converts">转换列表</param>
        /// <param name="headers">头信息</param>
        /// <param name="userAccesses">访问权限信息</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<VideoFileResult>> UploadVideo(IEnumerable<FileItem> videos, IEnumerable<VideoConvert> converts, IEnumerable<UserAccess> userAccesses, Dictionary<string, string> headers)
        {
            Task<string> result = new HttpRequestHelper().PostFileVideo(RemoteUrl + "/upload/video", videos, converts, userAccesses, headers);
            return JsonConvert.DeserializeObject<ResultBase<IEnumerable<VideoFileResult>>>(result.Result);
        }

        /// <summary>
        /// 上传单个附件
        /// </summary>
        /// <param name="fileName">文件名</param>
        /// <param name="stream">文件流</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<AttachmentFileResult>> UploadAttachment(string fileName, Stream stream)
        {
            return UploadAttachment(fileName, stream, null, null);
        }
        /// <summary>
        /// 上传单个附件
        /// </summary>
        /// <param name="fileName">文件名</param>
        /// <param name="stream">文件流</param>
        /// <param name="userData">用户信息</param>
        /// <param name="userAccesses">访问权限信息</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<AttachmentFileResult>> UploadAttachment(string fileName, Stream stream, UserData userData, IEnumerable<UserAccess> userAccesses)
        {
            IEnumerable<FileItem> attachments = new List<FileItem>()
            {
                new FileItem() { FileName = fileName, FileStream = stream }
            };
            return UploadAttachment(attachments, userData, userAccesses);
        }
        /// <summary>
        /// 上传多个附件
        /// </summary>
        /// <param name="attachments">附件列表</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<AttachmentFileResult>> UploadAttachment(IEnumerable<FileItem> attachments)
        {
            return UploadAttachment(attachments, null,new Dictionary<string, string>());
        }
        /// <summary>
        /// 上传多个附件
        /// </summary>
        /// <param name="attachments">附件列表</param>
        /// <param name="userData">用户信息</param>
        /// <param name="userAccesses">访问权限信息</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<AttachmentFileResult>> UploadAttachment(IEnumerable<FileItem> attachments, UserData userData, IEnumerable<UserAccess> userAccesses)
        {
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers.Add("AuthCode", AuthCode);
            headers.Add("FromApi", "true");
            if (userData != null)
            {
                if (!string.IsNullOrEmpty(userData.UserName)) headers.Add("UserName", userData.UserName);
                if (!string.IsNullOrEmpty(userData.UserAgent)) headers.Add("UserAgent", userData.UserAgent);
                if (!string.IsNullOrEmpty(userData.UserIp)) headers.Add("UserIp", userData.UserIp);
            }
            return UploadAttachment(attachments, userAccesses, headers);
        }
        /// <summary>
        /// 上传多个附件
        /// </summary>
        /// <param name="attachments">附件列表</param>
        /// <param name="headers">头信息</param>
        /// <param name="userAccesses">访问权限信息</param>
        public ResultBase<IEnumerable<AttachmentFileResult>> UploadAttachment(IEnumerable<FileItem> attachments, IEnumerable<UserAccess> userAccesses, Dictionary<string, string> headers)
        {
            Task<string> result = new HttpRequestHelper().PostFileAttachment(RemoteUrl + "/upload/attachment", attachments, userAccesses, headers);
            return JsonConvert.DeserializeObject<ResultBase<IEnumerable<AttachmentFileResult>>>(result.Result);
        }

        /// <summary>
        /// 上传视频截图（在前端截图好了，传到服务器）
        /// </summary>
        /// <param name="fileId">源文件id</param>
        /// /// <param name="fileBase64">图片的base64内容</param>
        /// <returns></returns>
        public ResultBase<string> UploadVideoCapture(string fileId, string fileBase64)
        {
            return UploadVideoCapture(fileId, fileBase64, null);
        }
        /// <summary>
        /// 上传视频截图（在前端截图好了，传到服务器）
        /// </summary>
        /// <param name="fileId">源文件id</param>
        /// <param name="fileBase64">图片的base64内容</param>
        /// <param name="userData">用户信息</param>
        /// <returns></returns>
        public ResultBase<string> UploadVideoCapture(string fileId, string fileBase64, UserData userData)
        {
            string[] imageBase64 = fileBase64.Split(',');
            string image = Base64SecureURL.Encode(imageBase64.Length >= 2 ? imageBase64[1] : imageBase64[0]);
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers.Add("AuthCode", AuthCode);
            headers.Add("FromApi", "true");
            if (userData != null)
            {
                if (!string.IsNullOrEmpty(userData.UserName)) headers.Add("UserName", userData.UserName);
                if (!string.IsNullOrEmpty(userData.UserAgent)) headers.Add("UserAgent", userData.UserAgent);
                if (!string.IsNullOrEmpty(userData.UserIp)) headers.Add("UserIp", userData.UserIp);
            }
            Task<string> result = new HttpRequestHelper().Post(RemoteUrl + "/upload/videocapture", "fileId=" + fileId + "&fileBase64=" + image, headers);
            return JsonConvert.DeserializeObject<ResultBase<string>>(result.Result);
        }
        /// <summary>
        /// 上传视频截图(本地文件可作为视频截图上传)
        /// </summary>
        /// <param name="fileId">视频源文件id（该缩略图属于哪个视频的）</param>
        /// <param name="fileName">文件名</param>
        /// <param name="stream">文件流</param>
        /// <param name="userData">用户信息</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<string>> UploadVideoCapture(string fileId, string fileName, Stream stream, UserData userData)
        {
            List<FileItem> files = new List<FileItem>() { new FileItem() { FileName = fileName, FileStream = stream } };
            return UploadVideoCapture(fileId, files, userData);
        }
        /// <summary>
        /// 上传视频截图(本地文件可作为视频截图上传)
        /// </summary>
        /// <param name="fileId">视频源文件id（该缩略图属于哪个视频的）</param>
        /// <param name="videoCps">文件列表</param>
        /// <param name="userData">用户信息</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<string>> UploadVideoCapture(string fileId, IEnumerable<FileItem> videoCps, UserData userData)
        {
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers.Add("AuthCode", AuthCode);
            headers.Add("FromApi", "true");
            if (userData != null)
            {
                if (!string.IsNullOrEmpty(userData.UserName)) headers.Add("UserName", userData.UserName);
                if (!string.IsNullOrEmpty(userData.UserAgent)) headers.Add("UserAgent", userData.UserAgent);
                if (!string.IsNullOrEmpty(userData.UserIp)) headers.Add("UserIp", userData.UserIp);
            }
            Task<string> result = new HttpRequestHelper().PostFileVideoCapture(fileId, RemoteUrl + "/upload/videocapturestream", videoCps, headers);
            return JsonConvert.DeserializeObject<ResultBase<IEnumerable<string>>>(result.Result);
        }

        /// <summary>
        /// 删除视频截图
        /// </summary>
        /// <param name="captureFileId">视频截图的文件id</param>
        /// <returns>用户信息</returns>
        public ResultBase<string> DeleteVideoCapture(string captureFileId)
        {
            return DeleteVideoCapture(captureFileId, null);
        }
        /// <summary>
        /// 删除视频截图
        /// </summary>
        /// <param name="captureFileId">视频截图的文件id</param>
        /// <param name="userData"></param>
        /// <returns></returns>
        public ResultBase<string> DeleteVideoCapture(string captureFileId, UserData userData)
        {
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers.Add("AuthCode", AuthCode);
            headers.Add("FromApi", "true");
            if (userData != null)
            {
                if (!string.IsNullOrEmpty(userData.UserName)) headers.Add("UserName", userData.UserName);
                if (!string.IsNullOrEmpty(userData.UserAgent)) headers.Add("UserAgent", userData.UserAgent);
                if (!string.IsNullOrEmpty(userData.UserIp)) headers.Add("UserIp", userData.UserIp);
            }
            Task<string> result = new HttpRequestHelper().Get(RemoteUrl + "/data/deletevideocapture", "id=" + captureFileId, headers);
            return JsonConvert.DeserializeObject<ResultBase<string>>(result.Result);
        }
        /// <summary>
        /// 获取视频截图文件id列表
        /// </summary>
        /// <param name="fileId">视频源文件id</param>
        /// <returns></returns>
        public ResultBase<IEnumerable<string>> GetVideoCaptureIds(string fileId)
        {
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers.Add("AuthCode", AuthCode);
            headers.Add("FromApi", "true");
            Task<string> result = new HttpRequestHelper().Get(RemoteUrl + "/data/getvideocaptureids", "id=" + fileId, headers);
            return JsonConvert.DeserializeObject<ResultBase<IEnumerable<string>>>(result.Result);
        }
        /// <summary>
        /// 获取正在转换文件的进度信息
        /// </summary>
        /// <param name="fileId">源文件id</param>
        /// <returns></returns>
        public ResultBase<FileConvertState> GetFileState(string fileId)
        {
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers.Add("AuthCode", AuthCode);
            headers.Add("FromApi", "true");
            Task<string> result = new HttpRequestHelper().Get(RemoteUrl + "/data/filestate", "id=" + fileId, headers);
            return JsonConvert.DeserializeObject<ResultBase<FileConvertState>>(result.Result);
        }

        /// <summary>
        /// 下载文件，只能下载上传的源文件（缩略图、转换之后的视频、视频截图文件 无法通过该方法获取）
        /// </summary>
        /// <param name="fileId">文件id</param>
        /// <returns></returns>
        public DownloadFileItem DownloadFile(string fileId)
        {
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers.Add("AuthCode", AuthCode);
            headers.Add("FromApi", "true");
            return new HttpRequestHelper().GetFile(RemoteUrl + "/download/get/" + fileId, headers);
        }
        /// <summary>
        /// 下载缩略图
        /// </summary>
        /// <param name="fileId">缩略图id</param>
        /// <returns></returns>
        public DownloadFileItem DownloadThumbnail(string fileId)
        {
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers.Add("AuthCode", AuthCode);
            headers.Add("FromApi", "true");
            return new HttpRequestHelper().GetFile(RemoteUrl + "/download/thumbnail/" + fileId, headers);
        }
        /// <summary>
        /// 下载m3u8视频切片列表
        /// </summary>
        /// <param name="fileId">m3u8文件id</param>
        /// <returns></returns>
        public DownloadFileItem DownloadM3u8(string fileId)
        {
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers.Add("AuthCode", AuthCode);
            headers.Add("FromApi", "true");
            return new HttpRequestHelper().GetFile(RemoteUrl + "/download/m3u8pure/" + fileId, headers);
        }
        /// <summary>
        /// 下载视频切片
        /// </summary>
        /// <param name="fileId">视频切片id</param>
        /// <returns></returns>
        public DownloadFileItem DownloadTs(string fileId)
        {
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers.Add("AuthCode", AuthCode);
            headers.Add("FromApi", "true");
            return new HttpRequestHelper().GetFile(RemoteUrl + "/download/ts/" + fileId, headers);
        }
        /// <summary>
        /// 下载视频截图文件
        /// </summary>
        /// <param name="fileId">视频截图文件id</param>
        /// <returns></returns>
        public DownloadFileItem DownloadVideoCapture(string fileId)
        {
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers.Add("AuthCode", AuthCode);
            headers.Add("FromApi", "true");
            return new HttpRequestHelper().GetFile(RemoteUrl + "/download/videocapture/" + fileId, headers);
        }
    }
}
