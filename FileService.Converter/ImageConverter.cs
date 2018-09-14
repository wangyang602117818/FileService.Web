using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using System.Drawing.Imaging;
using System.IO;

namespace FileService.Converter
{
    public class ImageConverter : Converter
    {
        MongoFile mongoFile = new MongoFile();
        Files files = new Files();
        FilesWrap filesWrap = new FilesWrap();
        Thumbnail thumbnail = new Thumbnail();
        FilePreview filePreview = new FilePreview();
        static object o = new object();
        public override bool Convert(FileItem taskItem)
        {
            BsonDocument outputDocument = taskItem.Message["Output"].AsBsonDocument;
            string fileName = taskItem.Message["FileName"].AsString;
            ObjectId filesWrapId = taskItem.Message["FileId"].AsObjectId;

            ImageOutPut output = BsonSerializer.Deserialize<ImageOutPut>(outputDocument);
            string outputExt = "";
            ImageFormat format = ImageExtention.GetFormat(output.Format, fileName, out outputExt);

            int processCount = System.Convert.ToInt32(taskItem.Message["ProcessCount"]);
            Stream fileStream = null;
            string fullPath = taskItem.Message["TempFolder"].AsString + fileName;
            //第一次转换，文件肯定在共享文件夹
            if (processCount == 0)
            {
                lock (o)
                {
                    if (File.Exists(fullPath))
                    {
                        fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
                        SaveFileFromSharedFolder(filesWrapId, fileName, fileStream);
                    }
                    else
                    {
                        BsonDocument filesWrap = new FilesWrap().FindOne(filesWrapId);
                        ObjectId fileId = filesWrap["FileId"].AsObjectId;
                        fileStream = mongoFile.DownLoadSeekable(fileId);
                    }
                }
            }
            else
            {
                BsonDocument filesWrap = new FilesWrap().FindOne(filesWrapId);
                ObjectId fileId = filesWrap["FileId"].AsObjectId;
                fileStream = mongoFile.DownLoadSeekable(fileId);
            }
            if (fileStream != null)
            {
                if (output.Id != ObjectId.Empty)
                {
                    using (Stream stream = ImageExtention.GenerateThumbnail(fileName, fileStream, output.Model, format, output.X, output.Y, output.Width, output.Height))
                    {
                        thumbnail.Replace(output.Id, taskItem.Message["FileId"].AsObjectId, stream.Length, Path.GetFileNameWithoutExtension(fileName) + outputExt, output.Flag, stream.ToBytes());
                    }
                }
                fileStream.Position = 0;
                using (Stream stream = ImageExtention.GenerateFilePreview(fileName, fileStream, ImageModelEnum.scale, format))
                {
                    filePreview.Replace(filesWrapId, stream.Length, fileName, stream.ToBytes());
                }
            }
            fileStream.Close();
            fileStream.Dispose();
            return true;
        }

    }
}
