using System;
using System.Collections.Generic;
using System.Text;

namespace FileService.Util
{
    public static class RandomExtention
    {
        /// <summary>
        /// 获取随机字符串，
        /// </summary>
        /// <param name="random"></param>
        /// <param name="numb">随机字符串个数</param>
        /// <returns></returns>
        public static string RandomCode(this Random random, int numb)
        {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < numb; i++)
            {
                int res = random.Next(0, 3);
                switch (res)
                {
                    case 0:
                        sb.Append(random.Next(0, 10));  //数字
                        break;
                    case 1:
                        sb.Append((char)random.Next(97, 123));  //小写字母
                        break;
                    case 2:
                        sb.Append((char)random.Next(65, 91));  //大写字母
                        break;
                }
            }
            return sb.ToString();
        }
        /// <summary>
        /// 获取[0,max]之间的len个不重复随机整数列表
        /// </summary>
        /// <param name="random"></param>
        /// <param name="max"></param>
        /// <param name="len"></param>
        /// <returns></returns>
        public static List<int> GetRandomCodes(this Random random, int max, int len)
        {
            List<int> result = new List<int>();
            if (max <= len)
            {
                for (var i = 0; i <= max; i++) result.Add(i);
            }
            else
            {
                while (result.Count < len)
                {
                    int l = random.Next(0, max + 1);
                    if (!result.Contains(l))
                    {
                        result.Add(l);
                    }
                }
            }
            return result;
        }
        /// <summary>
        /// 随机16精制字符串
        /// </summary>
        /// <param name="random"></param>
        /// <param name="numb">16精制字符串长度</param>
        /// <returns></returns>
        public static string RandomCodeHex(this Random random, int numb)
        {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < numb; i++)
            {
                int res = random.Next(0, 2);
                switch (res)
                {
                    case 0:
                        sb.Append(random.Next(0, 10));  //数字
                        break;
                    case 1:
                        sb.Append((char)random.Next(97, 103));  //小写字母
                        break;
                }
            }
            return sb.ToString();
        }
    }
}
