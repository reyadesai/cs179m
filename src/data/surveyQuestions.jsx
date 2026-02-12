
export const surveyQuestions = [
    // sleep
    {
      id: "work",
      section: "Sleep Screening",
      type: "yesno",
      question: "Do you work?",
    },
    {
      id: "sleep_weekend_diff",
      section: "Sleep Screening",
      type: "yesno",
      question:
        "Do you fall asleep at different times on the weekends versus the weekdays?",
      dependsOn: { id: "work", equals: "No" }, // only ask if they do not work
    },
    {
      id: "sleep_weekday_bedtime",
      section: "Sleep Screening",
      type: "time12",
      question: "What time do you usually fall asleep on weekdays or workdays?"
    },
    {
      id: "sleep_weekday_wake",
      section: "Sleep Screening",
      type: "time12",
      question: "What time do you usually wake up on weekdays or workdays?"
    },
    {
      id: "sleep_weekend_bedtime",
      section: "Sleep Screening",
      type: "time12",
      question: "What time do you usually fall asleep on weekends or non-workdays?",
     
    
      optionalIf: { id: "sleep_weekend_diff", equals: "No" },
    },
    {
      id: "sleep_weekend_wake",
      section: "Sleep Screening",
      type: "time12",
      question: "What time do you usually wake up on weekends or non-workdays?",

      optionalIf: { id: "sleep_weekend_diff", equals: "No" },
    },
  
    // physical activity
    {
      id: "moderate_min_week", 
      section: "Physical Activity Screening",
      type: "frequency",
      question: "How often do you do moderate-intensity leisure-time physical activities?",
      sublabel: "a. Number of times (per day, week, or year)",
    },
    {
      id: "moderate_duration_each",
      section: "Physical Activity Screening",
      type: "duration",
      question:
        "About how long do you do these moderate leisure-time physical activities each time?",
      sublabel: "a. Time in minutes/hours",
      dependsOnAnswered: "moderate_min_week", // show only if Q1 answered
    },
    {
      id: "vigorous_min_week", 
      section: "Physical Activity Screening",
      type: "frequency",
      question: "How often do you do vigorous-intensity leisure-time physical activities?",
      sublabel: "a. Number of times (per day, week, or year)",
    },
    {
      id: "vigorous_duration_each",
      section: "Physical Activity Screening",
      type: "duration",
      question:
        "About how long do you do these vigorous leisure-time physical activities each time?",
      sublabel: "a. Time in minutes/hours",
      dependsOnAnswered: "vigorous_min_week", // show only if Q3 answered
    },
    {
        id: "sedentary_hours_day",
        section: "Physical Activity Screening",
        type: "duration",
        question: "How much time do you usually spend sitting on a typical day?",
        sublabel: "a. Time in minutes/hours",
        info:
          "This includes sitting at school, at home, getting to and from places, or with friends including time spent sitting at a desk, traveling in a car or bus, reading, playing cards, watching television, or using a computer. Do not include time spent sleeping.",
      },
      
  ];
  