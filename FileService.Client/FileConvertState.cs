using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Client
{
    /// <summary>
    /// 文件转换进度model
    /// </summary>
    public class FileConvertState
    {
        /// <summary>
        /// 源文件id
        /// </summary>
        public string FileId { get; set; }
        /// <summary>
        /// 源文件名称
        /// </summary>
        public string FileName { get; set; }
        /// <summary>
        /// 转换文件的状态列表
        /// </summary>
        public IEnumerable<FileStateItem> StateList { get; set; }
    }
    /// <summary>
    /// 转换文件的状态
    /// </summary>
    public class FileStateItem
    {
        /// <summary>
        /// 转换文件的id
        /// </summary>
        public string FileId { get; set; }
        /// <summary>
        /// 转换任务使用那台服务器
        /// </summary>
        public string Server { get; set; }
        /// <summary>
        /// 该台服务器目前有多少任务
        /// </summary>
        public int TotalCount { get; set; }
        /// <summary>
        /// 标记
        /// </summary>
        public string Flag { get; set; }
        /// <summary>
        /// 转换状态
        /// </summary>
        public string State { get; set; }
        /// <summary>
        /// 转换百分比
        /// </summary>
        public int Percent { get; set; }
    }

}
