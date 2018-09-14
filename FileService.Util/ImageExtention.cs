using FileService.Model;
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

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
        public static ImageFormat GetFormat(ImageOutPutFormat format, string fileName, out string ext)
        {
            switch (format)
            {
                case ImageOutPutFormat.Default:
                    ext = Path.GetExtension(fileName);
                    return GetImageFormat(ext);
                case ImageOutPutFormat.Jpeg:
                    ext = ".jpg";
                    return ImageFormat.Jpeg;
                case ImageOutPutFormat.Png:
                    ext = ".png";
                    return ImageFormat.Png;
                case ImageOutPutFormat.Gif:
                    ext = ".gif";
                    return ImageFormat.Gif;
                case ImageOutPutFormat.Bmp:
                    ext = ".bmp";
                    return ImageFormat.Bmp;
            }
            ext = ".jpg";
            return ImageFormat.Jpeg;
        }
        public static Stream GenerateThumbnail(string fileName, Stream stream, ImageModelEnum model, ImageFormat outputFormat, int x, int y, int width, int height)
        {
            bool isGif = Path.GetExtension(fileName).ToLower() == ".gif" ? true : false;
            bool cut = false;
            using (Image image = Image.FromStream(stream))
            {
                switch (model)
                {
                    case ImageModelEnum.scale:
                        break;
                    case ImageModelEnum.height:
                        width = image.Width * height / image.Height;
                        break;
                    case ImageModelEnum.width:
                        height = image.Height * width / image.Width;
                        break;
                    case ImageModelEnum.cut:
                        cut = true;
                        break;
                }
                //if (width > image.Width) width = image.Width;
                //if (height > image.Height) height = image.Height;
                return isGif ? ConvertImageGif(image, x, y, width, height, cut) : ConvertImage(image, outputFormat, x, y, width, height, cut);
            }
        }
        public static Stream GenerateFilePreview(string fileName, Stream stream, ImageModelEnum model, ImageFormat outputFormat)
        {
            bool isGif = Path.GetExtension(fileName).ToLower() == ".gif" ? true : false;
            int width = 0, height = 0;
            using (Image image = Image.FromStream(stream))
            {
                if (image.Width >= image.Height)
                {
                    width = 80;
                    height = image.Height * 80 / image.Width;
                }
                if (image.Width < image.Height)
                {
                    height = 80;
                    width = image.Width * 80 / image.Height;
                }
                return isGif ? ConvertImageGif(image, 0, 0, width, height, false) : ConvertImage(image, outputFormat, 0, 0, width, height, false);
            }
        }
        private static Stream ConvertImage(Image image, ImageFormat outputFormat, int x, int y, int width, int height, bool cut)
        {
            Stream stream = new MemoryStream();
            using (Bitmap bmp = new Bitmap(width, height))  //新建一个图片
            {
                using (Graphics g = Graphics.FromImage(bmp)) //画板
                {
                    g.InterpolationMode = InterpolationMode.High;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.Clear(Color.Transparent);
                    if (cut)
                    {
                        g.DrawImage(image, new Rectangle(0, 0, width, height), new Rectangle(x, y, width, height), GraphicsUnit.Pixel);
                    }
                    else
                    {
                        g.DrawImage(image, new Rectangle(0, 0, width, height), new Rectangle(0, 0, image.Width, image.Height), GraphicsUnit.Pixel);
                    }
                }
                bmp.Save(stream, outputFormat);
            }
            stream.Position = 0;
            return stream;
        }
        private static Stream ConvertImageGif(Image image, int x, int y, int width, int height, bool cut)
        {
            Stream stream = new MemoryStream();
            Image gif = new Bitmap(width, height);
            Image frame = new Bitmap(width, height);
            Graphics g = Graphics.FromImage(gif);
            Graphics gFrame = Graphics.FromImage(frame);
            foreach (Guid gd in image.FrameDimensionsList)
            {
                FrameDimension fd = new FrameDimension(gd);
                FrameDimension f = FrameDimension.Time;
                int count = image.GetFrameCount(fd);
                ImageCodecInfo codecInfo = GetEncoder(ImageFormat.Gif);
                EncoderParameters eps = null;
                for (int i = 0; i < count; i++)
                {
                    image.SelectActiveFrame(f, i);
                    if (0 == i)
                    {
                        if (cut)
                        {
                            g.DrawImage(image, new Rectangle(0, 0, width, height), new Rectangle(x, y, width, height), GraphicsUnit.Pixel);
                        }
                        else
                        {
                            g.DrawImage(image, new Rectangle(0, 0, width, height), new Rectangle(0, 0, image.Width, image.Height), GraphicsUnit.Pixel);
                        }
                        eps = new EncoderParameters(1);
                        eps.Param[0] = new EncoderParameter(Encoder.SaveFlag, (long)EncoderValue.MultiFrame);
                        bindProperty(image, gif);
                        gif.Save(stream, codecInfo, eps);
                    }
                    else
                    {
                        if (cut)
                        {
                            gFrame.DrawImage(image, new Rectangle(0, 0, width, height), new Rectangle(x, y, width, height), GraphicsUnit.Pixel);
                        }
                        else
                        {
                            gFrame.DrawImage(image, new Rectangle(0, 0, width, height), new Rectangle(0, 0, image.Width, image.Height), GraphicsUnit.Pixel);
                        }
                        eps = new EncoderParameters(1);
                        eps.Param[0] = new EncoderParameter(Encoder.SaveFlag, (long)EncoderValue.FrameDimensionTime);
                        bindProperty(image, frame);
                        gif.SaveAdd(frame, eps);
                    }
                }
                eps = new EncoderParameters(1);
                eps.Param[0] = new EncoderParameter(Encoder.SaveFlag, (long)EncoderValue.Flush);
                gif.SaveAdd(eps);
            }
            stream.Position = 0;

            return stream;
        }
        private static ImageCodecInfo GetEncoder(ImageFormat format)
        {
            ImageCodecInfo[] codecs = ImageCodecInfo.GetImageDecoders();
            foreach (ImageCodecInfo codec in codecs)
            {
                if (codec.FormatID == format.Guid)
                {
                    return codec;
                }
            }
            return null;
        }
        private static void bindProperty(Image a, Image b)
        {
            for (int i = 0; i < a.PropertyItems.Length; i++)
            {
                b.SetPropertyItem(a.PropertyItems[i]);
            }
        }
    }
}
