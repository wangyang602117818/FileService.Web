using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    public class BaseController : Controller
    {
        public Log log = new Log();
        public Regex regex = new Regex(@"\\(\w+)\\$");
        public Converter converter = new Converter();
        public Task task = new Task();
        public Queue queue = new Queue();
        Department department = new Department();
        public void Log(string fileId, string content)
        {
            var authCode = Request.Headers["AuthCode"];
            var appName = Request.Headers["AppName"];
            if (string.IsNullOrEmpty(appName) && !string.IsNullOrEmpty(authCode))
            {
                appName = new Application().FindByAuthCode(authCode)["ApplicationName"].AsString;
            }

            log.Insert(appName,
                fileId,
                content,
                Request.Headers["UserName"] ?? User.Identity.Name,
                Request.Headers["UserIp"] ?? Request.UserHostAddress,
                Request.Headers["UserAgent"] ?? Request.UserAgent);
        }
        public void LogInRecord(string content, string userName)
        {
            var authCode = Request.Headers["AuthCode"];
            var appName = Request.Headers["AppName"];
            if (string.IsNullOrEmpty(appName) && !string.IsNullOrEmpty(authCode))
            {
                appName = new Application().FindByAuthCode(authCode)["ApplicationName"].AsString;
            }
            log.Insert(appName,
                "-",
                content,
                userName,
                Request.Headers["UserIp"] ?? Request.UserHostAddress,
                Request.Headers["UserAgent"] ?? Request.UserAgent);
        }
        public void InserTask(string handlerId, ObjectId fileId, string fileName, string type, BsonDocument outPut, BsonArray access)
        {
            converter.AddCount(handlerId, 1);
            ObjectId taskId = ObjectId.GenerateNewId();
            task.Insert(taskId, fileId,
                @"\\" + Environment.MachineName + "\\" + regex.Match(AppSettings.tempFileDir).Groups[1].Value + "\\" + DateTime.Now.ToString("yyyyMMdd") + "\\", fileName,
                type, outPut, access, handlerId, 0, TaskStateEnum.wait, 0);
            //添加队列
            queue.Insert(handlerId, type, "Task", taskId, false, new BsonDocument());
        }
        public void ConvertAccess(List<AccessModel> accessList)
        {
            foreach (AccessModel accessModel in accessList)
            {
                string companyName = "";
                List<string> departmentDisplay = new List<string>() { };
                accessModel.Authority = "0";
                accessModel.AccessCodes = accessModel.DepartmentCodes;
                department.GetNamesByCodes(accessModel.Company, accessModel.DepartmentCodes, out companyName, out departmentDisplay);
                accessModel.CompanyDisplay = companyName;
                accessModel.DepartmentDisplay = departmentDisplay.ToArray();
            }
        }
    }
}