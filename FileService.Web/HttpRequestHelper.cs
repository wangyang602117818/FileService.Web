using FileService.Util;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Web
{
    public class HttpRequestHelper
    {
        public Task<string> PostFile(string url, string type, string fileName, Stream fileStream, Dictionary<string, string> paras = null, Dictionary<string, string> headers = null)
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
            Stream requestStream = request.GetRequestStream();  //请求流
            //文件开始标记
            string fileBegin = "--" + boundary + "\r\nContent-Disposition: form-data;name=\"" + type + "\";filename=\"" + fileName.GetFileName() + "\"\r\nContent-Type: application/octet-stream; charset=utf-8\r\n\r\n";
            byte[] bytes = Encoding.UTF8.GetBytes(fileBegin);
            requestStream.Write(bytes, 0, bytes.Length);
            ////传文件数据
            fileStream.Position = 0;
            fileStream.CopyTo(requestStream);
            //传换行数据
            byte[] LFBytes = Encoding.UTF8.GetBytes("\r\n");
            requestStream.Write(LFBytes, 0, LFBytes.Length);
            StringBuilder sb_params = new StringBuilder();
            if (paras != null)
            {
                foreach (string key in paras.Keys)
                {
                    sb_params.Append("--" + boundary + "\r\n");
                    sb_params.Append("Content-Disposition: form-data; name=\"" + key + "\"\r\n\r\n");
                    sb_params.Append(paras[key] + "\r\n");
                }
            }
            byte[] paramsBytes = Encoding.UTF8.GetBytes(sb_params.ToString());
            requestStream.Write(paramsBytes, 0, paramsBytes.Length);
            //结束标记
            byte[] byte1 = Encoding.UTF8.GetBytes("--" + boundary + "--");  //文件结束标志prefix很重要
            requestStream.Write(byte1, 0, byte1.Length);
            using (WebResponse response = request.GetResponse())
            {
                using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                {
                    return reader.ReadToEndAsync();
                }
            }
        }
    }
}