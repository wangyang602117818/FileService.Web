using MongoDB.Bson;
using SharpCompress.Archives.Rar;
using SharpCompress.Archives.Zip;
using SharpCompress.Readers;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Util
{
    public static class StreamExtention
    {
        /// <summary>
        /// 获取文件的MD5码
        /// </summary>
        /// <returns></returns>
        public static string GetMD5(this Stream fileStream)
        {
            MD5 md5 = new MD5CryptoServiceProvider();
            byte[] retVal = md5.ComputeHash(fileStream);
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < retVal.Length; i++)
            {
                sb.Append(retVal[i].ToString("x2"));
            }
            fileStream.Position = 0;
            return sb.ToString();
        }
        public static string GetMD5(this byte[] bytes)
        {
            MD5 md5 = new MD5CryptoServiceProvider();
            byte[] retVal = md5.ComputeHash(bytes);
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < retVal.Length; i++)
            {
                sb.Append(retVal[i].ToString("x2"));
            }
            return sb.ToString();
        }
        public static string GetSha256(this Stream fileStream)
        {
            SHA256Managed Sha256 = new SHA256Managed();
            byte[] by = Sha256.ComputeHash(fileStream);
            return BitConverter.ToString(by).Replace("-", "").ToLower();
        }
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
    }
}
