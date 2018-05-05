using MongoDB.Bson;
using SharpCompress.Archives.Rar;
using SharpCompress.Readers;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Util
{
    public static class StreamExtention
    {
        public static BsonArray GetDeCompressionZipFiles(this Stream stream)
        {
            ZipArchive zipFile = new ZipArchive(stream, ZipArchiveMode.Read);
            BsonArray result = new BsonArray();
            foreach (var item in zipFile.Entries)
            {
                if (item.FullName.Substring(item.FullName.Length - 1, 1) == "/") continue;
                result.Add(new BsonDocument() {
                    {"Name",item.Name },
                    {"Length",item.Length }
                });
            }
            return result;
        }
        public static Stream GetFileInZip(this Stream stream, string file)
        {
            ZipArchive zipFile = new ZipArchive(stream, ZipArchiveMode.Read);
            ZipArchiveEntry zipArchiveEntry = zipFile.GetEntry(file);
            return zipArchiveEntry.Open();
        }
        public static BsonArray GetDeCompressionRarFiles(this Stream stream)
        {
            RarArchive rarArchive = RarArchive.Open(stream);
            IReader reader = rarArchive.ExtractAllEntries();
            BsonArray result = new BsonArray();
            while (reader.MoveToNextEntry())
            {
                result.Add(new BsonDocument() {
                    {"Name",reader.Entry.Key },
                    {"Length",reader.Entry.Size }
                });
            }
            return result;
        }
        public static Stream GetFileInRar(this Stream stream, string file)
        {
            RarArchive rarArchive = RarArchive.Open(stream);
            IReader reader = rarArchive.ExtractAllEntries();
            while (reader.MoveToNextEntry())
            {
                if (reader.Entry.Key.ToLower() == file.ToLower())
                {
                    return reader.OpenEntryStream();
                }
            }
            return null;
        }
    }
}
