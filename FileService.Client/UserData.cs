using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Client
{
    /// <summary>
    /// 上传者的基本信息
    /// </summary>
    public class UserData
    {
        /// <summary>
        /// 用户名，是一个标记，表明该文件由该用户上传，文件服务器可查
        /// </summary>
        public string UserName { get; set; }
        /// <summary>
        /// 用户使用过的代理，文件服务器日志可查
        /// </summary>
        public string UserAgent { get; set; }
        /// <summary>
        /// 用户ip地址
        /// </summary>
        public string UserIp { get; set; }
    }
}
