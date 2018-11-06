using System;
using System.IO;
using System.Net.Http;
using System.Net;
using System.Collections.Specialized;
using System.Text;
using System.Drawing;

namespace ui
{
    class Program
    {
        static void Main(string[] args)
        {
            string base64String = null;
            Console.WriteLine("Hello World!");

            // Load file meta data with FileInfo
            FileInfo fileInfo = new FileInfo("IMG.jpg");

            // The byte[] to save the data in
            byte[] data = new byte[fileInfo.Length];

            // Load a filestream and put its content into the byte[]
            using (FileStream fs = fileInfo.OpenRead())
            {
                fs.Read(data, 0, data.Length);
            }
            base64String = Convert.ToBase64String(data);  
              
            using (WebClient wc = new WebClient())
            {
                NameValueCollection myNameValueCollection = new NameValueCollection();
                myNameValueCollection.Add("base64string",base64String);
                byte[] responseArray  = wc.UploadValues("http://localhost:8080/postreq", myNameValueCollection);
            }
        }
    }
}
