using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Model
{
    public class DepartmentSelect
    {
        public string Id { get; set; }
        public string DepartmentName { get; set; }
        public string DepartmentCode { get; set; }
        public int Order { get; set; }
        public int Layer { get; set; }
        public string ParentCode { get; set; }
        public List<DepartmentSelect> Departments { get; set; }
        public DateTime CreateTime { get; set; }
    }
}
