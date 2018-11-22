using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TotalScoreNeedleRotation : MonoBehaviour {
    static float minAngle = 180;
    static float maxAngle = 0;
    static TotalScoreNeedleRotation thisMeter;

    void Start () {
        thisMeter = this;

    }
	
	public static void ShowScore(float score)
    {
        float angle = Mathf.Lerp(minAngle, maxAngle, Mathf.InverseLerp(0, 100, score));
        thisMeter.transform.eulerAngles = new Vector3(0, 0, angle);
    }
}
