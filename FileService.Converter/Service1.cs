﻿using FileService.Business;
using FileService.Model;
using FileService.Util;
using System;
using System.ServiceProcess;

namespace FileService.Converter
{
    public partial class Service1 : ServiceBase
    {
        protected Business.Converter converter;
        protected Processor processor = new Processor();
        public static System.Threading.Tasks.Task workTask = null;
        public Service1()
        {
            InitializeComponent();
            converter = new Business.Converter()
            {
                HandlerId = AppSettings.handlerId,
                MachineName = Environment.MachineName,
                Total = 0,
                SaveFileType = AppSettings.saveFileType,
                SaveFileApi = AppSettings.saveFileApi,
                SaveFilePath = AppSettings.saveFilePath,
                State = ConverterStateEnum.running,
                StartTime = DateTime.Now,
                CreateTime = DateTime.Now
            };
        }

        protected override void OnStart(string[] args)
        {
            Log4Net.InfoLog("start...");
            converter.UpdateByHanderId();
            processor.StartMonitor(AppSettings.handlerId);
            workTask = System.Threading.Tasks.Task.Factory.StartNew(processor.StartWork);
            base.OnStart(args);
        }

        protected override void OnStop()
        {
            Log4Net.InfoLog("end...");
            converter.Offline();
            base.OnStop();
        }
        protected override void OnShutdown()
        {
            Log4Net.InfoLog("Shutdown...");
            converter.Offline();
            base.OnShutdown();
        }
    }
}
