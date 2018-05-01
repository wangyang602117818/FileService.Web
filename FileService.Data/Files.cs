using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class Files : FilesBase
    {
        public Files() : base("fs.files") { }
    }
    public class FilesConvert : FilesBase
    {
        public FilesConvert() : base("convert.files") { }
    }
}
