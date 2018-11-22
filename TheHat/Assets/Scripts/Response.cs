using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Response : MonoBehaviour {

    public class Skills
    {
        public int required;
        public int matching;
        public string[][] missing;
    }

    public class Experience
    {
        public int required;
        public int current;
    }

    public class Metrics
    {
        public Skills skills;
        public Experience experience;
        public int score;
    }

    public class EducationDetails
    {
        public string degree;
        public string university;
        public string duration;
    }

    public class ExperienceDetails
    {
        public string position;
        public string company;
        public string duration;
        public string description;
    }
    public string firstName;
    public string id;
    public string industry;
    public string lastName;
    public UnityEngine.Object positions;
    public string[][] courses;
    public string[][] skills;
    public EducationDetails[] education;
    public ExperienceDetails[] experience;
    public Metrics metrics;

    // Use this for initialization
    void Start () {
		
	}
	
	
}
