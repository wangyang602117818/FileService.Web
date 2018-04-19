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
        public static IEnumerable<string> GetDeCompressionZipFiles(this Stream stream)
        {
            ZipArchive zipFile = new ZipArchive(stream, ZipArchiveMode.Read);
            List<string> result = new List<string>();
            foreach (var item in zipFile.Entries)
            {
                if (item.FullName.Substring(item.FullName.Length - 1, 1) == "/") continue;
                result.Add(item.FullName);
            }
            stream.Position = 0;
            return result;
        }
        public static Stream GetFileInZip(this Stream stream, string file)
        {
            ZipArchive zipFile = new ZipArchive(stream, ZipArchiveMode.Read);
            ZipArchiveEntry zipArchiveEntry = zipFile.GetEntry(file);
            return zipArchiveEntry.Open();
        }
    }
}
