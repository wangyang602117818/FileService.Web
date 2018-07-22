using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver.GridFS;
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

namespace FileService.Converter
{
    public class ImageConverter : IConverter
    {
        MongoFile mongoFile = new MongoFile();
        Files files = new Files();
        FilesWrap filesWrap = new FilesWrap();
        Thumbnail thumbnail = new Thumbnail();

        public void Convert(FileItem taskItem)
        {
            BsonDocument outputDocument = taskItem.Message["Output"].AsBsonDocument;
            string fileName = taskItem.Message["FileName"].AsString;
            ObjectId filesWrapId = taskItem.Message["FileId"].AsObjectId;

            ImageOutPut output = BsonSerializer.Deserialize<ImageOutPut>(outputDocument);
            string outputExt = "";
            ImageFormat format = GetFormat(output.Format, fileName, out outputExt);

            int processCount = taskItem.Message["ProcessCount"].AsInt32;
            Stream fileStream = null;
            //第一次转换，文件肯定在共享文件夹
            if (processCount == 0)
            {
                string sharedFolder = taskItem.Message["TempFolder"].AsString;
                fileStream = new FileStream(sharedFolder + fileName, FileMode.Open, FileAccess.Read);
                if (fileStream != null)
                {
                    string md5 = fileStream.GetMD5();
                    BsonDocument file = files.GetFileByMd5(md5);
                    ObjectId id = ObjectId.Empty;
                    if (file == null)
                    {
                        id = mongoFile.Upload(fileName, fileStream, null);
                    }
                    else
                    {
                        id = file["_id"].AsObjectId;
                    }
                    filesWrap.UpdateFileId(filesWrapId, id);
                }
            }
            else
            {
                BsonDocument filesWrap = new FilesWrap().FindOne(filesWrapId);
                ObjectId fileId = filesWrap["FileId"].AsObjectId;
                fileStream = mongoFile.DownLoad(fileId);
            }
            if (fileStream != null)
            {
                if (output.Id != ObjectId.Empty)
                {
                    using (Stream stream = GenerateThumbnail(fileName, fileStream, output.Model, format, output.X, output.Y, output.Width, output.Height))
                    {
                        byte[] bytes = new byte[stream.Length];
                        stream.Read(bytes, 0, bytes.Length);
                        thumbnail.Replace(output.Id, taskItem.Message["FileId"].AsObjectId, stream.Length, Path.GetFileNameWithoutExtension(fileName) + outputExt, output.Flag, bytes);
                    }
                }
            }
            fileStream.Close();
            fileStream.Dispose();
        }
        public Stream GenerateThumbnail(string fileName, Stream stream, ImageModelEnum model, ImageFormat outputFormat, int x, int y, int width, int height)
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
        private ImageFormat GetFormat(ImageOutPutFormat format, string fileName, out string ext)
        {
            switch (format)
            {
                case ImageOutPutFormat.Default:
                    ext = Path.GetExtension(fileName);
                    return ImageExtention.GetImageFormat(ext);
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
        private Stream ConvertImage(Image image, ImageFormat outputFormat, int x, int y, int width, int height, bool cut)
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
        private Stream ConvertImageGif(Image image, int x, int y, int width, int height, bool cut)
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
        private ImageCodecInfo GetEncoder(ImageFormat format)
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
        private void bindProperty(Image a, Image b)
        {
            for (int i = 0; i < a.PropertyItems.Length; i++)
            {
                b.SetPropertyItem(a.PropertyItems[i]);
            }
        }
    }
}
