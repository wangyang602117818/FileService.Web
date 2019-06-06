using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using System;
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
        static object o = new object();
        public override bool Convert(FileItem taskItem)
        {
            BsonDocument outputDocument = taskItem.Message["Output"].AsBsonDocument;
            string from = taskItem.Message["From"].AsString;
            string fileName = taskItem.Message["FileName"].AsString;
            string fileType = taskItem.Message["Type"].AsString;
            ObjectId fileWrapId = taskItem.Message["FileId"].AsObjectId;
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);

            ImageOutPut output = BsonSerializer.Deserialize<ImageOutPut>(outputDocument);
            string outputExt = "";
            ImageFormat format = ImageFormat.Jpeg;
            if (Path.GetExtension(fileName).ToLower() == ".svg")
            {
                outputExt = ".svg";
            }
            else
            {
                format = ImageExtention.GetFormat(output.Format, fileName, out outputExt);
            }
            Stream fileStream = null;
            string fullPath = AppSettings.GetFullPath(taskItem.Message);
            lock (o)
            {
                if (File.Exists(fullPath))
                {
                    SaveFileFromSharedFolder(from, fileType, fileWrapId, fullPath, fileName, format);
                    fileStream= new FileStream(fullPath, FileMode.Open, FileAccess.Read);
                }
                //任务肯定是后加的
                else
                {
                    ObjectId fileId = fileWrap["FileId"].AsObjectId;
                    fileStream = mongoFile.DownLoadSeekable(fileId);
                }
            }
            if (fileStream != null && output.Id != ObjectId.Empty)
            {
                int twidth = output.Width, theight = output.Height;
                using (Stream stream = ImageExtention.GenerateThumbnail(fileName, fullPath, fileStream, output.Model, format, output.ImageQuality, output.X, output.Y, ref twidth, ref theight))
                {
                    thumbnail.Replace(output.Id,
                        from,
                        taskItem.Message["FileId"].AsObjectId,
                        stream.Length,
                        twidth,
                        theight,
                        Path.GetFileNameWithoutExtension(fileName) + outputExt,
                        output.Flag, stream.ToBytes(),
                        fileWrap.Contains("ExpiredTime") ? fileWrap["ExpiredTime"].ToUniversalTime() : DateTime.MaxValue.ToUniversalTime());
                }
                fileStream.Close();
                fileStream.Dispose();
            }
            return true;
        }
    }
}
