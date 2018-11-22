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
    public class OfficeConverter : Converter
    {
        Files files = new Files();
        FilesWrap filesWrap = new FilesWrap();
        FilesConvert filesConvert = new FilesConvert();
        Business.Task task = new Business.Task();
        MongoFile mongoFile = new MongoFile();
        MongoFileConvert mongoFileConvert = new MongoFileConvert();
        static object o = new object();
        public override bool Convert(FileItem taskItem)
        {
            ObjectId fileWrapId = taskItem.Message["FileId"].AsObjectId;
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            string fileName = taskItem.Message["FileName"].AsString;
            int processCount =System.Convert.ToInt32(taskItem.Message["ProcessCount"]);
            string fullPath = GetFilePath(taskItem.Message);
            if (processCount == 0)
            {
                if (File.Exists(fullPath))
                {
                    SaveFileFromSharedFolder(fileWrapId, fullPath);
                }
            }
            else
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
            }
            ObjectId oldFileId = ObjectId.Empty;
            if (fileWrap != null)
            {
                oldFileId = taskItem.Message["Output"]["_id"].AsObjectId;
                if (oldFileId != ObjectId.Empty && filesConvert.FindOne(oldFileId) != null) mongoFileConvert.Delete(oldFileId);
            }
            
            string destinationFullPath = MongoFileBase.AppDataDir + Path.GetFileNameWithoutExtension(fileName) + ".pdf";
            //转换office方法
            ObjectId outputId = ConvertOffice(fullPath, destinationFullPath, fileWrapId);
            //更新 filesWrap 表
            filesWrap.UpdateSubFileId(fileWrapId, oldFileId, outputId);
            //更新 task 表
            task.UpdateOutPutId(taskItem.Message["_id"].AsObjectId, outputId);
            if (File.Exists(destinationFullPath)) File.Delete(destinationFullPath);
            if (File.Exists(fullPath)) File.Delete(fullPath);
            return true;
        }
        public ObjectId ConvertOffice(string sourcePath, string destinationPath, ObjectId fileWrapId)
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
                            {"From", "FilesWrap"},
                            {"Id",fileWrapId },
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
