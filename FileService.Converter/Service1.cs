using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Converter
{
    public partial class Service1 : ServiceBase
    {
        protected Business.Converter converter;
        protected Processor processor = new Processor();
        public Service1()
        {
            InitializeComponent();
            converter = new Business.Converter()
            {
                HandlerId = AppSettings.handlerId,
                MachineName = Environment.MachineName,
                Total = 0,
                State = ConverterStateEnum.running,
                StartTime = DateTime.Now
            };
            if (!Directory.Exists(MongoFile.AppDataDir)) Directory.CreateDirectory(MongoFile.AppDataDir);
        }

        protected override void OnStart(string[] args)
        {
            Log4Net.InfoLog("start...");
            converter.UpdateByHanderId();
            processor.StartMonitor(AppSettings.handlerId);
            System.Threading.Tasks.Task.Factory.StartNew(processor.StartWork);
        }

        protected override void OnStop()
        {
            Log4Net.InfoLog("end...");
            converter.Offline();
        }
    }
}
