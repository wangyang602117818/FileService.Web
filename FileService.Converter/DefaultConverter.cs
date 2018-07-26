using FileService.Business;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Converter
{
    public class DefaultConverter : Converter
    {
        FilesWrap filesWrap = new FilesWrap();
        public override void Convert(FileItem taskItem)
        {
            ObjectId fileWrapId = taskItem.Message["FileId"].AsObjectId;
            //BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            string fileName = taskItem.Message["FileName"].AsString;
            int processCount = taskItem.Message["ProcessCount"].AsInt32;
            string fullPath = taskItem.Message["TempFolder"].AsString + fileName;
            if (processCount == 0)
            {
                if (File.Exists(fullPath))
                {
                    SaveFileFromSharedFolder(fileWrapId, fullPath);
                }
            }
        }
    }
}
