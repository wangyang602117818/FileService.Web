using FileService.Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Converter
{
    interface IConverter
    {
        void Convert(FileItem fileItem);
    }
}
