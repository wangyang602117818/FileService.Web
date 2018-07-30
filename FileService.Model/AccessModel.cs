using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Model
{
    public class AccessModel
    {
        public string Company { get; set; }
        public string CompanyDisplay { get; set; }
        public string[] DepartmentCodes { get; set; }
        public string[] DepartmentDisplay { get; set; }
        public string Authority { get; set; }
        public string[] AccessCodes { get; set; }
        public string[] AccessUsers { get; set; }
    }
}
