using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Client
{
    /// <summary>
    /// 返回对象的父类
    /// </summary>
    public class ResultBase<T>
    {
        /// <summary>
        /// 0：成功，其他失败
        /// </summary>
        public int Code { get; set; }
        /// <summary>
        /// 返回码的状态描述
        /// </summary>
        public string Message { get; set; }
        /// <summary>
        /// 返回结果
        /// </summary>
        public T Result { get; set; }
    }
}
