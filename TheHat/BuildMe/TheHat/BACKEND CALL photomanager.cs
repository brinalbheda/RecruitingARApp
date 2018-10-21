using System;
using System.Linq;
using UnityEngine;
using UnityEngine.Assertions;
using UnityEngine.XR.WSA.WebCam;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.Networking;
using System.IO;
/// <summary>
/// Manages taking and saving photos.
/// </summary>
public class PhotoManager : MonoBehaviour
{
    /// <summary>
    /// Displays status information of the camera.
    /// </summary>
    public TextMesh Info;

    /// <summary>
    /// Whether or not to show holograms in the photo.
    /// </summary>
    public bool ShowHolograms = true;

    /// <summary>
    /// Whether or not to start the camera immediatly.
    /// </summary>
    public bool AutoStart = true;

    /// <summary>
    /// Actual camera instance.
    /// </summary>
    private PhotoCapture capture;

    /// <summary>
    /// True, if the camera is ready to take photos.
    /// </summary>
    private bool isReady = false;

    /// <summary>
    /// The path to the image in the applications local folder.
    /// </summary>
    private string currentImagePath;

    /// <summary>
    /// The path to the users picture folder.
    /// </summary>
    private string pictureFolderPath;

    private void Start()
    {
        Assert.IsNotNull(Info, "The PhotoManager requires a text mesh.");

        Info.text = "Camera off";

        if (AutoStart)
            StartCamera();

#if NETFX_CORE
        GetPicturesFolderAsync();
#endif

    }

    /// <summary>
    /// Starts the photo mode.
    /// </summary>
    public void StartCamera()
    {
        if (isReady)
        {
            Debug.Log("Camera is already running.");
            return;
        }

        PhotoCapture.CreateAsync(ShowHolograms, OnPhotoCaptureCreated);
    }

    /// <summary>
    /// Take a photo and save it to a temporary application folder.
    /// </summary>
    public void TakePhoto()
    {
        if (isReady)
        {
            string file = string.Format(@"Image_{0:yyyy-MM-dd_hh-mm-ss-tt}.jpg", DateTime.Now);
            currentImagePath = System.IO.Path.Combine(Application.persistentDataPath, file);
            capture.TakePhotoAsync(currentImagePath, PhotoCaptureFileOutputFormat.JPG, OnCapturedPhotoToDisk);
        }
        else
        {
            Debug.LogWarning("The camera is not yet ready.");
        }
    }

    /// <summary>
    /// Stop the photo mode.
    /// </summary>
    public void StopCamera()
    {
        if (isReady)
        {
            capture.StopPhotoModeAsync(OnPhotoModeStopped);
        }
    }

#if NETFX_CORE

    private async void GetPicturesFolderAsync() 
    {
        Windows.Storage.StorageLibrary picturesStorage = await Windows.Storage.StorageLibrary.GetLibraryAsync(Windows.Storage.KnownLibraryId.Pictures);
        pictureFolderPath = picturesStorage.SaveFolder.Path;
    }

#endif

    private void OnPhotoCaptureCreated(PhotoCapture captureObject)
    {
        capture = captureObject;

        Resolution resolution = PhotoCapture.SupportedResolutions.OrderByDescending(res => res.width * res.height).First();

        CameraParameters c = new CameraParameters(WebCamMode.PhotoMode);
        c.hologramOpacity = 1.0f;
        c.cameraResolutionWidth = resolution.width;
        c.cameraResolutionHeight = resolution.height;
        c.pixelFormat = CapturePixelFormat.BGRA32;

        capture.StartPhotoModeAsync(c, OnPhotoModeStarted);
    }

    private void OnPhotoModeStarted(PhotoCapture.PhotoCaptureResult result)
    {
        isReady = result.success;
        Info.text = isReady ? "Camera ready" : "Camera failed to start";
    }


    private void FillResultsUI()
    {
        /*GameObject skillsObject = GameObject.Find("Skills");
        GameObject parentObj = GameObject.Find("ResultObj");*/
    }

    private void OnCapturedPhotoToDisk(PhotoCapture.PhotoCaptureResult result)

    {
        if (result.success)
        {
            //StartCoroutine(Upload());
            /*GameObject obj = GameObject.Find("Screen").GetComponent<TextMesh>;
            obj = "jhsvc";
            if(obj)
                obj.SetActive(true);*/

            //Node call & check if success
            //stop camera + display of json
            //
            //FillResultsUI();
            StopCamera();
#if NETFX_CORE
            
            try 
            {
                if(pictureFolderPath != null)
                {
                    System.IO.File.Move(currentImagePath, System.IO.Path.Combine(pictureFolderPath, "Camera Roll", System.IO.Path.GetFileName(currentImagePath)));
                    Info.text = "Saved photo in camera roll";
                }
                else 
                {
                    Info.text = "Saved photo to temp";
                }
            } 
            catch(Exception e) 
            {
                Info.text = "Failed to move to camera roll";
                Debug.Log(e.Message);

            }
#else
            Info.text = "Saved photo";
            Debug.Log("Saved image at " + currentImagePath);
#endif

        }
        else
        {
            Info.text = "Failed to save photo";
            Debug.LogError(string.Format("Failed to save photo to disk ({0})", result.hResult));
        }
    }
    /*IEnumerator Upload()
    {
        string uri = "http://ar-divyata.us-west-1.elasticbeanstalk.com/testpost";
        List<IMultipartFormSection> formData = new List<IMultipartFormSection>();
        formData.Add(new MultipartFormDataSection("name=abc"));
        UnityWebRequest uwr = UnityWebRequest.Post(uri, formData);
        uwr.SetRequestHeader("Content-Type", "x-www-form-urlencoded");

        yield return uwr.SendWebRequest();

        if (uwr.isNetworkError || uwr.isHttpError)
        {
            Debug.Log("Error While Sending: " + uwr.error + uwr.responseCode);
        }
        else
        {
            Debug.Log("Received: " + uwr.downloadHandler.text);
        }
        /*List<IMultipartFormSection> formData = new List<IMultipartFormSection>();
        //formData.Add(new MultipartFormDataSection("field1=foo&field2=bar"));
        formData.Add(new MultipartFormFileSection("file", "Dhana.jpg"));

        UnityWebRequest www = UnityWebRequest.Post("http://ar-divyata.us-west-1.elasticbeanstalk.com/data", formData);
        www.chunkedTransfer = false;
        yield return www.SendWebRequest();

        if (www.isNetworkError || www.isHttpError)
        {
            Debug.Log(www.error);
            Debug.Log(www.responseCode);
        }
        else
        {
            Debug.Log("Form upload complete!");
        }*/
        /*byte[] img = File.ReadAllBytes(currentImagePath);

        //create multipart list
        List<IMultipartFormSection> requestData = new List<IMultipartFormSection>();

        requestData.Add(new MultipartFormFileSection("file", img, "Shivi.jpg", "image/jpg"));
        //url3 is a string url defined earlier
        UnityWebRequest request = UnityWebRequest.Post("http://ar-divyata.us-west-1.elasticbeanstalk.com/data", requestData);
        request.SetRequestHeader("Content-Type", "multipart/form-data");
        yield return request.SendWebRequest();
        print("request completed with code: " + request.responseCode);

        if (request.isHttpError || request.isNetworkError)
        {
            print("Error: " + request.error);
        }
        else
        {
            print("Request Response: " + request.downloadHandler.text);
        }*/

        /*WWWForm webForm = new WWWForm();
        // Change the image into a bytes array
        byte[] imageBytes = GetImageAsByteArray(currentImagePath);
        using (UnityWebRequest www =
            UnityWebRequest.Post("http://ar-divyata.us-west-1.elasticbeanstalk.com/data", webForm))
        {
            www.chunkedTransfer = false;
            www.SetRequestHeader("Content-Type", "multipart/form-data");
            www.uploadHandler.contentType = "multipart/form-data";
            www.uploadHandler = new UploadHandlerRaw(imageBytes);
            www.downloadHandler = new DownloadHandlerBuffer();

            yield return www.SendWebRequest();
            if (www.isHttpError || www.isNetworkError)
            {
                print("Error: " + www.error+www.responseCode);
            }
            else
            {
                print("Request Response: " + www.downloadHandler.text);
            }
            string jsonResponse = www.downloadHandler.text;
       
        }*/

    //}
    /// <summary>
    /// Returns the contents of the specified file as a byte array.
    /// </summary>
    static byte[] GetImageAsByteArray(string imageFilePath)
    {
        FileStream fileStream = new FileStream(imageFilePath, FileMode.Open, FileAccess.Read);
        BinaryReader binaryReader = new BinaryReader(fileStream);
        return binaryReader.ReadBytes((int)fileStream.Length);
    }

    private void OnPhotoModeStopped(PhotoCapture.PhotoCaptureResult result)
    {
        capture.Dispose();
        capture = null;
        isReady = false;

        Info.text = "Camera off";
    }

}