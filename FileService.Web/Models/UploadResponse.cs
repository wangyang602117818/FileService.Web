﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FileService.Web.Models
{
    public class FileResponse
    {
        private IEnumerable<SubFileItem> subFiles = new List<SubFileItem>();
        public string FileId { get; set; }
        public string FileName { get; set; }
        public long FileSize { get; set; }
        public string Message { get; set; }
        public IEnumerable<SubFileItem> SubFiles { get => subFiles; set => subFiles = value; }
    }
    public class SubFileItem
    {
        public string FileId { get; set; }
        public string Flag { get; set; }
    }
}