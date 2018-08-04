using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Client
{
    /// <summary>
    /// 附件内容
    /// </summary>
    public class AttachmentFileResult
    {
        /// <summary>
        /// 文件id
        /// </summary>
        public string FileId { get; set; }
        /// <summary>
        /// 文件名
        /// </summary>
        public string FileName { get; set; }
        /// <summary>
        /// 文件字节数(大小)
        /// </summary>
        public long FileSize { get; set; }
    }
}
