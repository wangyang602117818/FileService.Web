using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FileService.Web.Models
{
    public class TsTimeModel
    {
        private int month = 1;
        public IEnumerable<string> Ids { get; set; }
        public int Month { get => this.month; set => this.month = value; }
    }
}