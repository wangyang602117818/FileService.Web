using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;

namespace FileService.Converter
{
    public class ImageConverter : Converter
    {
        MongoFile mongoFile = new MongoFile();
        Files files = new Files();
        FilesWrap filesWrap = new FilesWrap();
        Thumbnail thumbnail = new Thumbnail();
        FilePreview filePreview = new FilePreview();
        FilePreviewBig filePreviewBig = new FilePreviewBig();
        static object o = new object();
        public override bool Convert(FileItem taskItem)
        {
            BsonDocument outputDocument = taskItem.Message["Output"].AsBsonDocument;
            string from = taskItem.Message["From"].AsString;
            string fileName = taskItem.Message["FileName"].AsString;
            ObjectId fileWrapId = taskItem.Message["FileId"].AsObjectId;

            ImageOutPut output = BsonSerializer.Deserialize<ImageOutPut>(outputDocument);
            string outputExt = "";
            ImageFormat format = ImageExtention.GetFormat(output.Format, fileName, out outputExt);

            int processCount = System.Convert.ToInt32(taskItem.Message["ProcessCount"]);
            Stream fileStream = null;
            string fullPath = AppSettings.GetFullPath(taskItem.Message);
            //第一次转换，文件肯定在共享文件夹
            if (processCount == 0)
            {
                lock (o)
                {
                    if (File.Exists(fullPath))
                    {
                        fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
                        SaveFileFromSharedFolder(fileWrapId, fileName, fileStream);
                        //生成文件缩略图
                        GenerateFilePreview(fileWrapId, from, fileName, fileStream, format);
                        fileStream.Position = 0;
                    }
                    else
                    {
                        BsonDocument filesWrap = new FilesWrap().FindOne(fileWrapId);
                        ObjectId fileId = filesWrap["FileId"].AsObjectId;
                        fileStream = mongoFile.DownLoadSeekable(fileId);
                    }
                }
            }
            else
            {
                BsonDocument filesWrap = new FilesWrap().FindOne(fileWrapId);
                ObjectId fileId = filesWrap["FileId"].AsObjectId;
                fileStream = mongoFile.DownLoadSeekable(fileId);
            }
            if (fileStream != null)
            {
                if (output.Id != ObjectId.Empty)
                {
                    int twidth = output.Width, theight = output.Height;
                    using (Stream stream = ImageExtention.GenerateThumbnail(fileName, fileStream, output.Model, format, output.X, output.Y, ref twidth, ref theight))
                    {
                        thumbnail.Replace(output.Id, from, taskItem.Message["FileId"].AsObjectId, stream.Length, twidth, theight, Path.GetFileNameWithoutExtension(fileName) + outputExt, output.Flag, stream.ToBytes());
                    }
                }
            }
            fileStream.Close();
            fileStream.Dispose();
            return true;
        }
        public void GenerateFilePreview(ObjectId fileWrapId, string from, string fileName, Stream fileStream, ImageFormat format)
        {
            fileStream.Position = 0;
            int width = 0, height = 0;
            using (Stream stream = ImageExtention.GenerateFilePreview(fileName, 80, fileStream, ImageModelEnum.scale, format, ref width, ref height))
            {
                filePreview.Replace(fileWrapId, from, stream.Length, width, height, fileName, stream.ToBytes());
            }
            fileStream.Position = 0;
            using (Stream stream = ImageExtention.GenerateFilePreview(fileName, 300, fileStream, ImageModelEnum.scale, format, ref width, ref height))
            {
                filePreviewBig.Replace(fileWrapId, from, stream.Length, width, height, fileName, stream.ToBytes());
            }
        }
    }
}
