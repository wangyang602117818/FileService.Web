using FileService.Model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace FileService.Util
{
    public static class ImageExtention
    {
        private static object o = new object();
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
                case ".jpeg":
                    return ImageFormat.Jpeg;
                case ".ico":
                    return ImageFormat.Icon;
                case ".tif":
                    return ImageFormat.Tiff;
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
                case ".jpeg":
                    return "image/jpeg";
                case ".pic":
                    return "application/x-pic";
                case ".ico":
                    return "image/x-icon";
                case ".tif":
                    return "image/tiff";
                case ".svg":
                    return "image/svg+xml";
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
        public static Stream GenerateThumbnail(string fullPath, Stream stream, ImageModelEnum model, ImageFormat outputFormat, ImageQuality imageQuality, int x, int y, ref int width, ref int height)
        {
            string type = GetImageType2(stream);
            bool cut = false;
            if (type == "XML")
            {
                return GenerateSvg(stream, model, ref width, ref height);
            }
            else
            {
                using (Image image = Image.FromStream(stream))
                {
                    switch (model)
                    {
                        case ImageModelEnum.scale:
                            if (width == 0 && height == 0)
                            {
                                width = image.Width;
                                height = image.Height;
                            }
                            else if (width == 0 && height > 0)
                            {
                                width = image.Width * height / image.Height;
                            }
                            else if (width > 0 && height == 0)
                            {
                                height = image.Height * width / image.Width;
                            }
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
                    if (width > image.Width) width = image.Width;
                    if (height > image.Height) height = image.Height;
                    Stream imageStream = type == "GIF" ? ConvertImageGif(fullPath, image, x, y, width, height, cut) : ConvertImage(image, outputFormat, x, y, width, height, cut);
                    if (type != "GIF" && imageQuality != ImageQuality.None)
                    {
                        Image imageQ = Image.FromStream(imageStream);
                        return ConvertImageQuality(imageQ, imageQuality);
                    }
                    return type == "GIF" ? ConvertImageGif(fullPath, image, x, y, width, height, cut) : ConvertImage(image, outputFormat, x, y, width, height, cut);
                }
            }
        }
        public static Stream GenerateFilePreview(int fileHW, string fullPath, Stream stream, ImageModelEnum model, ImageFormat outputFormat, ref int width, ref int height)
        {
            string type = GetImageType2(stream);
            bool isGif = type == "GIF";
            if (type == "XML")
            {
                width = fileHW;
                height = fileHW;
                return GenerateSvg(stream, model, ref width, ref height);
            }
            else
            {
                using (Image image = Image.FromStream(stream))
                {
                    //原图比较宽
                    if (image.Width >= image.Height)
                    {
                        width = image.Width > fileHW ? fileHW : image.Width;  //原图比指定的宽度要宽，就是用指定的宽度，否则使用原图宽
                        height = image.Height * width / image.Width;
                    }
                    //原图比较高
                    if (image.Width < image.Height)
                    {
                        height = image.Height > fileHW ? fileHW : image.Height; //原图比指定的高度要高，就是用指定的高度，否则使用原图高
                        width = image.Width * height / image.Height;
                    }
                    return isGif ? ConvertImageGif(fullPath, image, 0, 0, width, height, false) : ConvertImage(image, outputFormat, 0, 0, width, height, false);
                }
            }
        }
        private static Stream GenerateSvg(Stream stream, ImageModelEnum model, ref int width, ref int height)
        {
            string text = stream.ToStr();
            string pattern = @"<svg\s*(.|\n)+?>";
            string widthPattern = @"width=""(\d+)(px)?""";
            string heightPattern = @"height=""(\d+)(px)?""";
            string svgTag = Regex.Match(text, pattern).Groups[0].Value;
            string newSvgTag = svgTag;
            var widthMath = Regex.Match(svgTag, widthPattern);
            int swidth = widthMath.Success ? int.Parse(widthMath.Groups[1].Value) : 1024;
            var heightMath = Regex.Match(svgTag, heightPattern);
            int sheight = heightMath.Success ? int.Parse(widthMath.Groups[1].Value) : 1024;
            switch (model)
            {
                case ImageModelEnum.scale:
                    if (width == 0 && height == 0)
                    {
                        width = swidth;
                        height = sheight;
                    }
                    else if (width == 0 && height > 0)
                    {
                        width = swidth * height / sheight;
                    }
                    else if (width > 0 && height == 0)
                    {
                        height = sheight * width / swidth;
                    }
                    break;
                case ImageModelEnum.height:
                    if (sheight != 0 && swidth != 0)
                    {
                        width = swidth * height / sheight;
                    }
                    else
                    {
                        width = height;
                    }
                    break;
                case ImageModelEnum.width:
                    if (sheight != 0 && swidth != 0)
                    {
                        height = sheight * width / swidth;
                    }
                    else
                    {
                        height = width;
                    }
                    break;
            }
            if (newSvgTag.Contains("width"))
            {
                newSvgTag = Regex.Replace(newSvgTag, widthPattern, "width=\"" + width + "\"");
            }
            else
            {
                newSvgTag = newSvgTag.TrimEnd('>') + " width=\"" + width + "\"" + ">";
            }
            if (newSvgTag.Contains("height"))
            {
                newSvgTag = Regex.Replace(newSvgTag, heightPattern, "height=\"" + height + "\"");
            }
            else
            {
                newSvgTag = newSvgTag.TrimEnd('>') + " height=\"" + height + "\"" + ">";
            }
            text = text.Replace(svgTag, newSvgTag);
            return text.ToStream();

        }
        private static Stream ConvertImage(Image image, ImageFormat outputFormat, int x, int y, int width, int height, bool cut)
        {
            Stream stream = new MemoryStream();
            using (Bitmap bmp = new Bitmap(width, height))  //新建一个图片
            {
                using (Graphics g = Graphics.FromImage(bmp)) //画板
                {
                    g.InterpolationMode = InterpolationMode.Low;
                    g.SmoothingMode = SmoothingMode.Default;
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
        private static Stream ConvertImageQuality(Image image, ImageQuality imageQuality)
        {
            Stream stream = new MemoryStream();
            ImageCodecInfo encoder = GetEncoder(ImageFormat.Jpeg);
            EncoderParameters ep = new EncoderParameters(1);
            ep.Param[0] = GetEncoderParameter(imageQuality);
            image.Save(stream, encoder, ep);
            stream.Position = 0;
            return stream;
        }
        private static Stream ConvertImageGif(Image image, int x, int y, int width, int height, bool cut)
        {
            Stream stream = new MemoryStream();
            Bitmap gif = new Bitmap(width, height);
            Image frame = new Bitmap(width, height);
            Graphics g = Graphics.FromImage(gif);
            g.Clear(Color.Transparent);
            Graphics gFrame = Graphics.FromImage(frame);
            gFrame.Clear(Color.Transparent);
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
                        eps.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.SaveFlag, (long)EncoderValue.MultiFrame);
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
                        eps.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.SaveFlag, (long)EncoderValue.FrameDimensionTime);
                        bindProperty(image, frame);
                        gif.SaveAdd(frame, eps);
                    }
                }
                eps = new EncoderParameters(1);
                eps.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.SaveFlag, (long)EncoderValue.Flush);
                gif.SaveAdd(eps);
            }
            stream.Position = 0;
            return stream;
        }
        private static Stream ConvertImageGif(string fullPath, Image image, int x, int y, int width, int height, bool cut)
        {
            if (!File.Exists(fullPath)) image.Save(fullPath);
            string exportPath = Path.GetDirectoryName(fullPath) + "\\" + Path.GetFileNameWithoutExtension(fullPath) + "." + width.ToString() + "_" + height.ToString() + Path.GetExtension(fullPath);
            string cmd = "";
            if (cut)
            {
                cmd = "\"" + AppSettings.ExePath + "\"" + " -hide_banner -v warning -i \"" + fullPath + "\" -filter_complex \"[0:v] crop=" + width + ":" + height + ":" + x + ":" + y + ",split[a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p] paletteuse\" \"" + exportPath + "\"";
            }
            else
            {
                cmd = "\"" + AppSettings.ExePath + "\"" + " -hide_banner -v warning -i \"" + fullPath + "\" -filter_complex \"[0:v] scale=" + width + ":" + height + ",split[a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p] paletteuse\" \"" + exportPath + "\"";
            }

            Process process = new Process()
            {
                StartInfo = new ProcessStartInfo(cmd)
                {
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardError = true
                }
            };
            process.Start();
            process.WaitForExit();
            process.Close();
            process.Dispose();
            MemoryStream memoryStream = new MemoryStream();
            if (File.Exists(exportPath))
            {
                using (FileStream fileStream = new FileStream(exportPath, FileMode.Open, FileAccess.Read))
                {
                    fileStream.CopyTo(memoryStream);
                }
                File.Delete(exportPath);
            }
            memoryStream.Position = 0;
            return memoryStream;
        }
        //private static Stream ConvertImageGif(Image image, int x, int y, int width, int height, bool cut)
        //{
        //    Stream stream = new MemoryStream();
        //    lock (o)
        //    {
        //        using (ImageFactory imageFactory = new ImageFactory(preserveExifData: true))
        //        {
        //            if (cut)
        //            {
        //                imageFactory.Load(image)
        //                    .Crop(new Rectangle(x, y, width, height))
        //                    .Save(stream);
        //            }
        //            else
        //            {
        //                imageFactory.Load(image)
        //                           .Resize(new Size(width, height))
        //                           .BackgroundColor(Color.Transparent)
        //                           .Save(stream);
        //            }
        //        }
        //        return stream;
        //    }
        //}
        private static EncoderParameter GetEncoderParameter(ImageQuality imageQuality)
        {
            switch (imageQuality)
            {
                case ImageQuality.High:
                    return new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 80L);
                case ImageQuality.Medium:
                    return new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 50L);
                case ImageQuality.Low:
                    return new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 20L);
            }
            return new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 80L);
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
        //private static string GetImageType(Stream stream)
        //{
        //    byte[] buffer = new byte[10];
        //    stream.Read(buffer, 0, 10);
        //    if (buffer[0] == 'G' && buffer[1] == 'I' && buffer[2] == 'F') return ".gif";
        //    if (buffer[1] == 'P' && buffer[2] == 'N' && buffer[3] == 'G') return ".png";
        //    if (buffer[6] == 'J' && buffer[7] == 'F' && buffer[8] == 'I' && buffer[9] == 'F') return ".jpg";
        //    if (buffer[0] == 'B' && buffer[1] == 'M') return ".bmp";
        //    return null;
        //}
        public static string GetImageType2(Stream stream)
        {
            string headerCode = GetHeaderInfo(stream).ToUpper();
            if (headerCode.StartsWith("FFD8FF"))
            {
                return "JPG";
            }
            else if (headerCode.StartsWith("49492A"))
            {
                return "TIFF";
            }
            else if (headerCode.StartsWith("424D"))
            {
                return "BMP";
            }
            else if (headerCode.StartsWith("474946"))
            {
                return "GIF";
            }
            else if (headerCode.StartsWith("89504E470D0A1A0A"))
            {
                return "PNG";
            }
            else if (headerCode.StartsWith("3C3F786D6C"))
            {
                return "XML";
            }
            else
            {
                return "";
            }
        }
        public static string GetHeaderInfo(Stream stream)
        {
            byte[] buffer = new byte[8];
            BinaryReader reader = new BinaryReader(stream, Encoding.UTF8, true);
            reader.Read(buffer, 0, buffer.Length);
            reader.Close();
            StringBuilder sb = new StringBuilder();
            foreach (byte b in buffer)
                sb.Append(b.ToString("X2"));
            return sb.ToString();
        }
        public static Size GetImageSize(this Stream stream)
        {
            Image image = Image.FromStream(stream);
            stream.Position = 0;
            return image.Size;
        } 
    }
}
