using FileService.Business;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FileService.Util;
using System.Diagnostics;

namespace FileService.Converter
{
    public class OfficeConverter : IConverter
    {
        Files files = new Files();
        FilesConvert filesConvert = new FilesConvert();
        Business.Task task = new Business.Task();
        MongoFile mongoFile = new MongoFile();
        MongoFileConvert mongoFileConvert = new MongoFileConvert();
        static object o = new object();
        public void Convert(FileItem fileItem)
        {
            ObjectId oldFileId = fileItem.Message["Output"]["_id"].AsObjectId;
            if (oldFileId != ObjectId.Empty && filesConvert.FindOne(oldFileId) != null) mongoFileConvert.Delete(oldFileId);
            string fileName = fileItem.Message["FileName"].AsString;
            string sourceFullPath = MongoFile.AppDataDir + fileName;
            string destinationFullPath = MongoFile.AppDataDir + Path.GetFileNameWithoutExtension(fileName) + ".pdf";
            //转换office方法
            ObjectId outputId = ConvertOffice(sourceFullPath, destinationFullPath, fileItem.Message["FileId"].AsObjectId);
            //更新 fs.files表
            files.UpdateSubFileId(fileItem.Message["FileId"].AsObjectId, oldFileId, outputId);
            //更新 task 表
            task.UpdateOutPutId(fileItem.Message["_id"].AsObjectId, outputId);
            if (File.Exists(destinationFullPath)) File.Delete(destinationFullPath);
            if (File.Exists(sourceFullPath)) File.Delete(sourceFullPath);
        }
        private ObjectId ConvertOffice(string sourcePath, string destinationPath, ObjectId sourceFileId)
        {
            if (!File.Exists(AppSettings.libreOffice))
            {
                Log4Net.InfoLog("LibreOffice not installed");
                return ObjectId.Empty;
            }
            lock (o)
            {
                Process process = new Process()
                {
                    StartInfo = new ProcessStartInfo()
                    {
                        FileName = AppSettings.libreOffice,
                        Arguments = "-norestore -nofirststartwizard -headless -convert-to pdf  \"" + sourcePath + "\"",
                        WorkingDirectory = Path.GetDirectoryName(destinationPath)
                    }
                };
                process.Start();
                process.WaitForExit();
            }
            if (File.Exists(destinationPath))
            {
                using (FileStream stream = new FileStream(destinationPath, FileMode.Open))
                {
                    return mongoFileConvert.Upload(Path.GetFileName(destinationPath), stream, new BsonDocument()
                        {
                            {"From", "fs.files"},
                            {"SourceId",sourceFileId },
                            {"FileType","attachment"},
                            {"ContentType","application/pdf"}
                        });
                }
            }
            else
            {
                return ObjectId.Empty;
            }
        }
    }
}
