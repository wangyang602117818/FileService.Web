using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using System.Drawing.Imaging;
using System.IO;

namespace FileService.Converter
{
    public class DefaultConverter : Converter
    {
        MongoFile mongoFile = new MongoFile();
        FilesWrap filesWrap = new FilesWrap();
        VideoCapture videoCapture = new VideoCapture();
        Config config = new Config();
        FilePreview filePreview = new FilePreview();
        public override bool Convert(FileItem taskItem)
        {
            ObjectId fileWrapId = taskItem.Message["FileId"].AsObjectId;
            //BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            string fileName = taskItem.Message["FileName"].AsString;
            string fileType = config.GetTypeByExtension(Path.GetExtension(fileName).ToLower()).ToLower();
            int processCount = System.Convert.ToInt32(taskItem.Message["ProcessCount"]);
            string fullPath = taskItem.Message["TempFolder"].AsString + fileName;
            //第一次转换，文件肯定在共享文件夹
            if (processCount == 0)
            {
                if (File.Exists(fullPath)) SaveFileFromSharedFolder(fileWrapId, fullPath);
            }
            //生成图片文件缩略图
            if (fileType == "image")
            {
                GenerateImageFilePreview(fullPath, fileName, fileWrapId);
            }
            //生成视频文件缩略图
            if (fileType == "video")
            {
                if (!File.Exists(fullPath))
                {
                    string newPath = MongoFileBase.AppDataDir + fileName;
                    if (!File.Exists(newPath))
                    {
                        BsonDocument filesWrap = new FilesWrap().FindOne(fileWrapId);
                        mongoFile.SaveTo(filesWrap["FileId"].AsObjectId);
                    }
                    fullPath = newPath;
                }
                videoCapture.DeleteBySourceId(fileWrapId);
                filesWrap.DeleteVideoCapture(fileWrapId);
                new VideoConverter().ConvertVideoCp(fileWrapId, fullPath);
            }
            if (File.Exists(fullPath)) File.Delete(fullPath);
            return true;
        }
        public void GenerateImageFilePreview(string fullPath, string fileName, ObjectId fileWrapId)
        {
            string outputExt = "";
            ImageFormat format = ImageExtention.GetFormat(ImageOutPutFormat.Default, fileName, out outputExt);
            Stream fileStream = null;
            if (File.Exists(fullPath))
            {
                fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
            }
            else
            {
                BsonDocument filesWrap = new FilesWrap().FindOne(fileWrapId);
                ObjectId fileId = filesWrap["FileId"].AsObjectId;
                fileStream = mongoFile.DownLoadSeekable(fileId);
            }
            using (Stream stream = ImageExtention.GenerateFilePreview(fileName, fileStream, ImageModelEnum.scale, format))
            {
                filePreview.Replace(fileWrapId, stream.Length, fileName, stream.ToBytes());
            }
            fileStream.Close();
            fileStream.Dispose();
        }
    }
}
