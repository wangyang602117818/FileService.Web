using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Client
{
    internal static class RandomExtention
    {
        internal static string RandomCode(this Random random, int numb)
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
        internal static string BuildParas(Dictionary<string, string> dict)
        {
            if (dict == null || dict.Count == 0) return "";
            StringBuilder sb = new StringBuilder();
            foreach (KeyValuePair<string, string> kv in dict)
            {
                sb.Append(kv.Key + "=" + kv.Value + "&");
            }
            return sb.ToString().TrimEnd('&');
        }
    }
}
