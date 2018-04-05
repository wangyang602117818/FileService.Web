using FileService.Util;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web.Models
{
    public class ResponseModel<T> : ContentResult
    {
        public ResponseModel(ErrorCode code, T t, long count = 0)
        {
            switch (code)
            {
                case ErrorCode.success:
                    Content = "{\"code\":" + (int)code + ",\"message\":\"" + code.ToString() + "\",\"result\":" + t.ToJson(new JsonWriterSettings() { OutputMode = JsonOutputMode.Strict }) + ",\"count\":" + count + "}";
                    break;
                case ErrorCode.redirect:
                    Content = "{\"code\":" + (int)code + ",\"message\":\"" + code.ToString() + "\",\"result\":\"" + t.ToString() + "\",\"count\":" + count + "}";
                    break;
                default:
                    Content = "{\"code\":" + (int)code + ",\"message\":\"" + code.ToString() + "\"}";
                    break;
            }
            ContentEncoding = Encoding.UTF8;
            ContentType = "application/json";
        }

    }
    public class ResponseItem<T>
    {
        public Enum code { get; set; }
        public string message { get; set; }
        public T result { get; set; }
    }
}