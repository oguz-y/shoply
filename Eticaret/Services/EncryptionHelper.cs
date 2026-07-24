using System.Security.Cryptography;
using System.Text;

namespace Eticaret.Services
{
    public static class EncryptionHelper
    {
        private static readonly string Key = "nDzaUPe8J3iM9Pvsj/V6Cgnliq8ydliLPrGF4I9TAWo=";
        private static readonly string IV = "HuL3AVA5St+EyCpwaJF6PQ==";

        public static string Encrypt(string plainText)
        {
            using Aes aes = Aes.Create();
            aes.Key = Convert.FromBase64String(Key);
            aes.IV = Convert.FromBase64String(IV);

            using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream();
            using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
            using (var sw = new StreamWriter(cs))
            {
                sw.Write(plainText);
            }
            return Convert.ToBase64String(ms.ToArray());
        }

        public static string Decrypt(string cipherText)
        {
            using Aes aes = Aes.Create();
            aes.Key = Convert.FromBase64String(Key);
            aes.IV = Convert.FromBase64String(IV);

            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream(Convert.FromBase64String(cipherText));
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);
            return sr.ReadToEnd();
        }
    }
}
