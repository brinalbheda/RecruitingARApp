using HoloToolkit.Unity.InputModule;
using UnityEngine;
using UnityEngine.SceneManagement;

public class gazeAnimation : MonoBehaviour, IFocusable
{
    [SerializeField]
    GameObject extendedObject;

    private int switching = 0;
    private string mmscene2;
    private float timer = 1;
    private Animator fadeout;
    private Animator UIfadeout;
    public GameObject mmenufadeout;
    public GameObject mmfadeUI;

    [SerializeField]
    public PhotoManager photoManager;

    // Use this for initialization
    void Start () {
		
	}

    // Update is called once per frame
    /*void Update()
    {
        if(switching == 1)
        {
            //fadeout.Play("Menu_FadeOut");
            UIfadeout.Play("MenuUIFadeOut");
            timer = timer - Time.deltaTime;
            if (timer <= 0)
            {
                switching = 0;
            }
        }
    }*/

    public void OnFocusEnter()
    {
        extendedObject.SetActive(true);

        
    }

    public void OnFocusExit()
    {
        //if(photoManager)
        //    photoManager.startCapturing();

        //extendedObject.SetActive(false);
        //mmscene2 = mmbscene;
        //switching = 1;
        //mmenufadeout = extendedObject;
        //fadeout = mmenufadeout.GetComponent<Animator>();
        //UIfadeout = mmenufadeout.GetComponent<Animator>();
    }

   
    void Update()
    {
        /*if (switching == 1)
        {
            //fadeout.Play("Menu_FadeOut");
            UIfadeout.Play("MenuUIFadeOut");
            timer = timer - Time.deltaTime;
            if (timer <= 0)
                switching = 0;
            
        }*/
    }

}
