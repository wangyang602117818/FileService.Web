﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Client
{
    internal class HttpRequestHelper
    {
        internal Task<string> PostFileImage(string appName, string url, IEnumerable<FileItem> images, IEnumerable<ImageConvert> converts, Dictionary<string, string> headers)
        {
            Dictionary<string, string> paras = new Dictionary<string, string>();
            paras.Add("appName", appName);
            string output = null;
            if (converts != null && converts.Count() > 0)
            {
                output = JsonConvert.SerializeObject(converts);
                paras.Add("output", output);
            }
            return PostFile(url, "images", images, paras, headers);
        }
        internal Task<string> PostFileVideo(string appName, string url, IEnumerable<FileItem> videos, IEnumerable<VideoConvert> converts, Dictionary<string, string> headers)
        {
            Dictionary<string, string> paras = new Dictionary<string, string>();
            paras.Add("appName", appName);
            string output = null;
            if (converts != null && converts.Count() > 0)
            {
                output = JsonConvert.SerializeObject(converts);
                paras.Add("output", output);
            }
            return PostFile(url, "videos", videos, paras, headers);
        }
        internal Task<string> PostFileAttachment(string appName, string url, IEnumerable<FileItem> attachments, Dictionary<string, string> headers)
        {
            Dictionary<string, string> paras = new Dictionary<string, string>();
            paras.Add("appName", appName);
            return PostFile(url, "attachments", attachments, paras, headers);
        }
        internal Task<string> PostFileVideoCapture(string appName, string fileId, string url, IEnumerable<FileItem> videoCaptures, Dictionary<string, string> headers)
        {
            Dictionary<string, string> paras = new Dictionary<string, string>();
            paras.Add("appName", appName);
            paras.Add("fileId", fileId);
            return PostFile(url, "videocps", videoCaptures, paras, headers);
        }
        internal Task<string> PostFile(string url, string type, IEnumerable<FileItem> files, Dictionary<string, string> paras, Dictionary<string, string> headers)
        {
            string boundary = "----" + new Random().RandomCode(30);
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "post";
            if (headers != null)
            {
                foreach (var kv in headers)
                {
                    request.Headers.Add(kv.Key, kv.Value);
                }
            }
            request.ContentType = "multipart/form-data; boundary=" + boundary;
            Stream stream = request.GetRequestStream();  //请求流
            foreach (var item in files)
            {
                //文件开始标记
                string fileBegin = "--" + boundary + "\r\nContent-Disposition: form-data;name=\"" + type + "\";filename=\"" + item.FileName + "\"\r\nContent-Type: application/octet-stream; charset=utf-8\r\n\r\n";
                byte[] bytes = Encoding.UTF8.GetBytes(fileBegin);
                stream.Write(bytes, 0, bytes.Length);
                ////传文件数据
                item.FileStream.Position = 0;
                item.FileStream.CopyTo(stream);
                //传换行数据
                byte[] LFBytes = Encoding.UTF8.GetBytes("\r\n");
                stream.Write(LFBytes, 0, LFBytes.Length);
            }
            StringBuilder sb_params = new StringBuilder();
            foreach (string key in paras.Keys)
            {
                sb_params.Append("--" + boundary + "\r\n");
                sb_params.Append("Content-Disposition: form-data; name=\"" + key + "\"\r\n\r\n");
                sb_params.Append(paras[key] + "\r\n");
            }
            byte[] paramsBytes = Encoding.UTF8.GetBytes(sb_params.ToString());
            stream.Write(paramsBytes, 0, paramsBytes.Length);
            //结束标记
            byte[] byte1 = Encoding.UTF8.GetBytes("--" + boundary + "--");  //文件结束标志prefix很重要
            stream.Write(byte1, 0, byte1.Length);
            using (WebResponse response = request.GetResponse())
            {
                using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                {
                    return reader.ReadToEndAsync();
                }
            }
        }
        internal Task<string> Post(string appName, string url, string paras, Dictionary<string, string> headers)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "post";
            request.ContentType = "application/x-www-form-urlencoded";
            if (headers != null)
            {
                foreach (var kv in headers)
                {
                    request.Headers.Add(kv.Key, kv.Value);
                }
            }
            byte[] bs = Encoding.UTF8.GetBytes("appName=" + appName + "&" + paras);
            using (Stream requestStream = request.GetRequestStream())
            {
                requestStream.Write(bs, 0, bs.Length);
            }
            using (WebResponse response = request.GetResponse())
            {
                using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                {
                    return reader.ReadToEndAsync();
                }
            }
        }
        internal Task<string> Get(string appName, string url, string paras, Dictionary<string, string> headers)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url + "?appName=" + appName + "&" + paras);
            request.Method = "get";
            if (headers != null)
            {
                foreach (var kv in headers)
                {
                    request.Headers.Add(kv.Key, kv.Value);
                }
            }
            WebResponse response = request.GetResponse();
            StreamReader reader = new StreamReader(response.GetResponseStream());
            return reader.ReadToEndAsync();
        }
        internal DownloadFileItem GetFile(string url)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "get";
            WebResponse response = request.GetResponse();
            if (response.Headers["Content-Disposition"] == null) return new DownloadFileItem() { };
            string name = response.Headers["Content-Disposition"].Split('=')[1];
            return new DownloadFileItem() { FileName = name, ContentType = response.ContentType, ContentLength = response.ContentLength, FileStream = response.GetResponseStream() };
        }
    }
}
