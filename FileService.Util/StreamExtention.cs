using MongoDB.Bson;
using SharpCompress.Archives.Rar;
using SharpCompress.Archives.Zip;
using SharpCompress.Readers;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Util
{
    public static class StreamExtention
    {
        public static BsonArray GetDeCompressionZipFiles(this Stream stream)
        {
            using (ZipArchive rarArchive = ZipArchive.Open(stream))
            {
                using (IReader reader = rarArchive.ExtractAllEntries())
                {
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
            }
        }
        public static Stream GetFileInZip(this Stream stream, string file)
        {
            using (ZipArchive rarArchive = ZipArchive.Open(stream))
            {
                using (IReader reader = rarArchive.ExtractAllEntries())
                {
                    while (reader.MoveToNextEntry())
                    {
                        if (reader.Entry.Key.ToLower() == file.ToLower())
                        {
                            return reader.OpenEntryStream();
                        }
                    }
                }
            }
            return null;
        }
        public static BsonArray GetDeCompressionRarFiles(this Stream stream)
        {
            using (RarArchive rarArchive = RarArchive.Open(stream))
            {
                using (IReader reader = rarArchive.ExtractAllEntries())
                {
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
            }
        }
        public static Stream GetFileInRar(this Stream stream, string file)
        {
            using (RarArchive rarArchive = RarArchive.Open(stream))
            {
                using(IReader reader = rarArchive.ExtractAllEntries())
                {
                    while (reader.MoveToNextEntry())
                    {
                        if (reader.Entry.Key.ToLower() == file.ToLower())
                        {
                            return reader.OpenEntryStream();
                        }
                    }
                }
            }
            return null;
        }
    }
}
