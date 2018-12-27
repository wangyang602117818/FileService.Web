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
        Extension extension = new Extension();
        FilePreview filePreview = new FilePreview();
        FilePreviewMobile filePreviewMobile = new FilePreviewMobile();
        public override bool Convert(FileItem taskItem)
        {
            ObjectId fileWrapId = taskItem.Message["FileId"].AsObjectId;
            string from = taskItem.Message["From"].AsString;
            string fileName = taskItem.Message["FileName"].AsString;
            string fileType = extension.GetTypeByExtension(Path.GetExtension(fileName).ToLower()).ToLower();
            int processCount = System.Convert.ToInt32(taskItem.Message["ProcessCount"]);
            string fullPath = AppSettings.GetFullPath(taskItem.Message);
            //第一次转换，文件肯定在共享文件夹
            if (processCount == 0)
            {
                if (File.Exists(fullPath)) SaveFileFromSharedFolder(from, fileType, fileWrapId, fullPath, ImageFormat.Jpeg);
            }
            if (File.Exists(fullPath)) File.Delete(fullPath);
            return true;
        }
        //public void GenerateImageFilePreview(string from, string fullPath, string fileName, ObjectId fileWrapId)
        //{
        //    string outputExt = "";
        //    ImageFormat format = ImageFormat.Jpeg;
        //    if (Path.GetExtension(fileName).ToLower() == ".svg")
        //    {
        //        outputExt = ".svg";
        //    }
        //    else
        //    {
        //        format = ImageExtention.GetFormat(ImageOutPutFormat.Default, fileName, out outputExt);
        //    }
        //    Stream fileStream = null;
        //    if (File.Exists(fullPath))
        //    {
        //        fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        //    }
        //    else
        //    {
        //        BsonDocument filesWrap = new FilesWrap().FindOne(fileWrapId);
        //        ObjectId fileId = filesWrap["FileId"].AsObjectId;
        //        fileStream = mongoFile.DownLoadSeekable(fileId);
        //    }
        //    fileStream.Position = 0;
        //    int width = 0, height = 0;
        //    string contentType = Extension.GetContentType(outputExt);
        //    using (Stream stream = ImageExtention.GenerateFilePreview(fileName, 80, fileStream, ImageModelEnum.scale, format, ref width, ref height))
        //    {
        //        filePreview.Replace(fileWrapId, from, stream.Length, width, height, contentType, fileName, stream.ToBytes());
        //    }
        //    fileStream.Position = 0;
        //    using (Stream stream = ImageExtention.GenerateFilePreview(fileName, 300, fileStream, ImageModelEnum.scale, format, ref width, ref height))
        //    {
        //        filePreviewMobile.Replace(fileWrapId, from, stream.Length, width, height, contentType, fileName, stream.ToBytes());
        //    }
        //    fileStream.Close();
        //    fileStream.Dispose();
        //}
    }
}
