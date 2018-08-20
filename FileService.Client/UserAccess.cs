using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Client
{
    /// <summary>
    /// 访问权限类
    /// </summary>
    public class UserAccess
    {
        /// <summary>
        /// 属于该公司编号的人 可访问
        /// </summary>
        public string Company { get; set; }
        /// <summary>
        /// 属于该部门编号的人 可访问
        /// </summary>
        public string[] DepartmentCodes { get; set; }
        /// <summary>
        /// 可访问的人员列表
        /// </summary>
        public string[] AccessUsers { get; set; }
    }

}
