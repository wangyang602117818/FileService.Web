﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Util
{
    /// <summary>
    /// 非对称加密算法
    /// </summary>
    public static class AsymmetricEncryptHelper
    {
        /// <summary>
        /// RSA加密
        /// </summary>
        /// <param name="sourceString">需要加密的字符串</param>
        /// <param name="key">base64形式的key</param>
        /// <returns></returns>
        public static string RSAEncode(string sourceString, string pubKey)
        {
            byte[] sourceBytes = Encoding.UTF8.GetBytes(sourceString);
            RSAParameters rsaParameters = ParseFromPemPublicKey(pubKey);
            RSACryptoServiceProvider rsa = new RSACryptoServiceProvider();
            rsa.ImportParameters(rsaParameters);
            byte[] result = rsa.Encrypt(sourceBytes, false);
            return Convert.ToBase64String(result);
        }
        /// <summary>
        /// RSA解密，私钥分成2种格式 pkcs1 pkcs8 ，.net只支持pkcs1,java是pkcs8格式
        /// </summary>
        /// <param name="secretString">加密以后的字符串</param>
        /// <param name="priKey"></param>
        /// <returns></returns>
        public static string RSADecode(string secretString, string priKey)
        {
            byte[] dataInput = Convert.FromBase64String(secretString);  //待解密的字符串
            RSAParameters rsaParameters = ParseFromPemPrivateKey(priKey);
            RSACryptoServiceProvider rsa = new RSACryptoServiceProvider();
            rsa.ImportParameters(rsaParameters);
            byte[] result = rsa.Decrypt(dataInput, false);
            return Encoding.UTF8.GetString(result);
        }
        /// <summary>          
        /// 将pem格式公钥转换为RSAParameters         
        /// </summary> <param name="pemFileConent">pem公钥内容</param>         
        /// <returns>转换得到的RSAParamenters</returns>          
        private static RSAParameters ParseFromPemPublicKey(string pemPubKey)
        {
            byte[] keyData = Convert.FromBase64String(pemPubKey);
            if (keyData.Length < 162) { throw new ArgumentException("pem file content is incorrect."); }
            byte[] pemModulus = new byte[128];
            byte[] pemPublicExponent = new byte[3];
            Array.Copy(keyData, 29, pemModulus, 0, 128);
            Array.Copy(keyData, 159, pemPublicExponent, 0, 3);
            RSAParameters para = new RSAParameters();
            para.Modulus = pemModulus;
            para.Exponent = pemPublicExponent;
            return para;
        }
        /// <summary>          
        /// 将pem格式私钥转换为RSAParameters,仅支持pkcs1        
        /// </summary>          
        /// <param name="pemFileConent">pem私钥内容</param>        
        /// <returns>转换得到的RSAParamenters</returns>         
        private static RSAParameters ParseFromPemPrivateKey(string pemPriKey)
        {
            byte[] MODULUS, E, D, P, Q, DP, DQ, IQ;
            byte[] privkey = Convert.FromBase64String(pemPriKey);
            // ---------  Set up stream to decode the asn.1 encoded RSA private key  ------
            MemoryStream mem = new MemoryStream(privkey);
            BinaryReader binr = new BinaryReader(mem);    //wrap Memory Stream with BinaryReader for easy reading
            byte bt = 0;
            ushort twobytes = 0;
            int elems = 0;
            try
            {
                twobytes = binr.ReadUInt16();
                if (twobytes == 0x8130)	//data read as little endian order (actual data order for Sequence is 30 81)
                    binr.ReadByte();	//advance 1 byte
                else if (twobytes == 0x8230)
                    binr.ReadInt16();	//advance 2 bytes
                else
                    throw new ArgumentException("pemPriKey 参数异常");

                twobytes = binr.ReadUInt16();
                if (twobytes != 0x0102)	//version number
                    throw new ArgumentException("pemPriKey 参数异常");
                bt = binr.ReadByte();
                if (bt != 0x00)
                    throw new ArgumentException("pemPriKey 参数异常");


                //------  all private key components are Integer sequences ----
                elems = GetIntegerSize(binr);
                MODULUS = binr.ReadBytes(elems);

                elems = GetIntegerSize(binr);
                E = binr.ReadBytes(elems);

                elems = GetIntegerSize(binr);
                D = binr.ReadBytes(elems);

                elems = GetIntegerSize(binr);
                P = binr.ReadBytes(elems);

                elems = GetIntegerSize(binr);
                Q = binr.ReadBytes(elems);

                elems = GetIntegerSize(binr);
                DP = binr.ReadBytes(elems);

                elems = GetIntegerSize(binr);
                DQ = binr.ReadBytes(elems);

                elems = GetIntegerSize(binr);
                IQ = binr.ReadBytes(elems);

                // ------- create RSACryptoServiceProvider instance and initialize with public key -----
                RSAParameters RSAparams = new RSAParameters();
                RSAparams.Modulus = MODULUS;
                RSAparams.Exponent = E;
                RSAparams.D = D;
                RSAparams.P = P;
                RSAparams.Q = Q;
                RSAparams.DP = DP;
                RSAparams.DQ = DQ;
                RSAparams.InverseQ = IQ;
                return RSAparams;
            }
            catch (Exception)
            {
                throw new ArgumentException("pemPriKey 参数异常");
            }
            finally { binr.Close(); }
        }
        private static int GetIntegerSize(BinaryReader binr)
        {
            byte bt = 0;
            byte lowbyte = 0x00;
            byte highbyte = 0x00;
            int count = 0;
            bt = binr.ReadByte();
            if (bt != 0x02)		//expect integer
                return 0;
            bt = binr.ReadByte();

            if (bt == 0x81)
                count = binr.ReadByte();	// data size in next byte
            else
                if (bt == 0x82)
                {
                    highbyte = binr.ReadByte();	// data size in next 2 bytes
                    lowbyte = binr.ReadByte();
                    byte[] modint = { lowbyte, highbyte, 0x00, 0x00 };
                    count = BitConverter.ToInt32(modint, 0);
                }
                else
                {
                    count = bt;		// we already have the data size
                }
            while (binr.ReadByte() == 0x00)
            {	//remove high order zeros in data
                count -= 1;
            }
            binr.BaseStream.Seek(-1, SeekOrigin.Current);		//last ReadByte wasn't a removed zero, so back up a byte
            return count;
        }

        /// <summary>
        /// pkcs8转pkcs1
        /// </summary>
        /// <param name="pkcs8"></param>
        /// <returns></returns>
        public static string ConverToPkcs1(string pkcs8str)
        {
            byte[] pkcs8 = Convert.FromBase64String(pkcs8str);
            byte[] SeqOID = { 0x30, 0x0D, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x01, 0x05, 0x00 };
            byte[] seq = new byte[15];

            MemoryStream mem = new MemoryStream(pkcs8);
            int lenstream = (int)mem.Length;
            BinaryReader binr = new BinaryReader(mem); //wrap Memory Stream with BinaryReader for easy reading
            byte bt = 0;
            ushort twobytes = 0;
            twobytes = binr.ReadUInt16();
            if (twobytes == 0x8130) //data read as little endian order (actual data order for Sequence is 30 81)
                binr.ReadByte(); //advance 1 byte
            else if (twobytes == 0x8230)
                binr.ReadInt16(); //advance 2 bytes
            else
                return null;
            bt = binr.ReadByte();
            if (bt != 0x02)
                return null;
            twobytes = binr.ReadUInt16();

            if (twobytes != 0x0001)
                return null;

            seq = binr.ReadBytes(15); //read the Sequence OID
            if (!CompareBytearrays(seq, SeqOID)) //make sure Sequence for OID is correct
                return null;

            bt = binr.ReadByte();
            if (bt != 0x04) //expect an Octet string 
                return null;

            bt = binr.ReadByte(); //read next byte, or next 2 bytes is  0x81 or 0x82; otherwise bt is the byte count
            if (bt == 0x81)
                binr.ReadByte();
            else if (bt == 0x82)
                binr.ReadUInt16();
            //------ at this stage, the remaining sequence should be the RSA private key
            byte[] rsaprivkey = binr.ReadBytes((int)(lenstream - mem.Position));
            return Convert.ToBase64String(rsaprivkey);
        }

        private static bool CompareBytearrays(byte[] a, byte[] b)
        {
            if (a.Length != b.Length)
                return false;
            int i = 0;
            foreach (byte c in a)
            {
                if (c != b[i])
                    return false;
                i++;
            }
            return true;
        }

        private static RSAParameters ConvertFromPrivateKey(string pemFileConent)
        {
            byte[] keyData = Convert.FromBase64String(pemFileConent);
            if (keyData.Length < 609)
            {
                throw new ArgumentException("pem file content is incorrect.");
            }

            int index = 11;
            byte[] pemModulus = new byte[128];
            Array.Copy(keyData, index, pemModulus, 0, 128);

            index += 128;
            index += 2;//141
            byte[] pemPublicExponent = new byte[3];
            Array.Copy(keyData, index, pemPublicExponent, 0, 3);

            index += 3;
            index += 4;//148
            byte[] pemPrivateExponent = new byte[128];
            Array.Copy(keyData, index, pemPrivateExponent, 0, 128);

            index += 128;
            index += ((int)keyData[index + 1] == 64 ? 2 : 3);//279
            byte[] pemPrime1 = new byte[64];
            Array.Copy(keyData, index, pemPrime1, 0, 64);

            index += 64;
            index += ((int)keyData[index + 1] == 64 ? 2 : 3);//346
            byte[] pemPrime2 = new byte[64];
            Array.Copy(keyData, index, pemPrime2, 0, 64);

            index += 64;
            index += ((int)keyData[index + 1] == 64 ? 2 : 3);//412/413
            byte[] pemExponent1 = new byte[64];
            Array.Copy(keyData, index, pemExponent1, 0, 64);

            index += 64;
            index += ((int)keyData[index + 1] == 64 ? 2 : 3);//479/480
            byte[] pemExponent2 = new byte[64];
            Array.Copy(keyData, index, pemExponent2, 0, 64);

            index += 64;
            index += ((int)keyData[index + 1] == 64 ? 2 : 3);//545/546
            byte[] pemCoefficient = new byte[64];
            Array.Copy(keyData, index, pemCoefficient, 0, 64);

            RSAParameters para = new RSAParameters();
            para.Modulus = pemModulus;
            para.Exponent = pemPublicExponent;
            para.D = pemPrivateExponent;
            para.P = pemPrime1;
            para.Q = pemPrime2;
            para.DP = pemExponent1;
            para.DQ = pemExponent2;
            para.InverseQ = pemCoefficient;
            return para;
        }
    }

}
