using System;
using System.Collections.Generic;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Util
{
    public static class ImageExtention
    {
        public static ImageFormat GetImageFormat(string ext)
        {
            switch (ext.ToLower())
            {
                case ".jpg":
                    return ImageFormat.Jpeg;
                case ".png":
                    return ImageFormat.Png;
                case ".gif":
                    return ImageFormat.Gif;
                case ".bmp":
                    return ImageFormat.Bmp;
            }
            return ImageFormat.Jpeg;
        }
        public static string GetContentType(string fileName)
        {
            switch (Path.GetExtension(fileName).ToLower())
            {
                case ".jpg":
                    return "image/jpeg";
                case ".png":
                    return "image/png";
                case ".gif":
                    return "image/gif";
                case ".bmp":
                    return "application/x-bmp";
            }
            return "image/*";
        }
    }
}
