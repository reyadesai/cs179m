export const surveyQuestions = [
  {
    id: "work",
    section: {
      en: "Work",
      es: "Trabajo",
    },
    type: "yesno",
    question: {
      en: "Do you work?",
      es: "¿Trabajas?",
    },
  },
  {
    id: "sleep_weekend_diff",
    section: {
      en: "Sleep Screening",
      es: "Evaluación del Sueño",
    },
    type: "yesno",
    question: {
      en: "Do you fall asleep at different times on the weekends versus the weekdays?",
      es: "¿Te duermes a diferentes horas los fines de semana en comparación con los días entre semana?",
    },
    dependsOn: { id: "work", equals: "no" },
  },
  {
    id: "sleep_weekday_bedtime",
    section: {
      en: "Sleep Screening",
      es: "Evaluación del Sueño",
    },
    type: "time12",
    question: {
      en: "What time do you usually fall asleep on weekdays or workdays?",
      es: "¿A qué hora sueles dormirte entre semana o en días laborales?",
    },
  },
  {
    id: "sleep_weekday_wake",
    section: {
      en: "Sleep Screening",
      es: "Evaluación del Sueño",
    },
    type: "time12",
    question: {
      en: "What time do you usually wake up on weekdays or workdays?",
      es: "¿A qué hora sueles despertarte entre semana o en días laborales?",
    },
  },
  {
    id: "sleep_weekend_bedtime",
    section: {
      en: "Sleep Screening",
      es: "Evaluación del Sueño",
    },
    type: "time12",
    question: {
      en: "What time do you usually fall asleep on weekends or non-workdays?",
      es: "¿A qué hora sueles dormirte los fines de semana o en días no laborales?",
    },
    optionalIf: { id: "sleep_weekend_diff", equals: "no" },
  },
  {
    id: "sleep_weekend_wake",
    section: {
      en: "Sleep Screening",
      es: "Evaluación del Sueño",
    },
    type: "time12",
    question: {
      en: "What time do you usually wake up on weekends or non-workdays?",
      es: "¿A qué hora sueles despertarte los fines de semana o en días no laborales?",
    },
    optionalIf: { id: "sleep_weekend_diff", equals: "no" },
  },
  {
    id: "moderate_min_week",
    section: {
      en: "Physical Activity Screening",
      es: "Evaluación de Actividad Física",
    },
    type: "frequency",
    question: {
      en: "How often do you do activities that make you breathe a little harder than normal, but you can still talk? (Example: walking fast)",
      es: "¿Con qué frecuencia haces actividades que te hacen respirar un poco más fuerte de lo normal, pero todavía puedes hablar? (Ejemplo: caminar rápido)",
    },
    sublabel: {
      en: "Number of times per week",
      es: "Número de veces por semana",
    },
  },
  {
    id: "moderate_duration_each",
    section: {
      en: "Physical Activity Screening",
      es: "Evaluación de Actividad Física",
    },
    type: "duration",
    question: {
      en: "About how long do you do these physical activities each time?",
      es: "Aproximadamente, ¿cuánto tiempo haces estas actividades físicas cada vez?",
    },
    sublabel: {
      en: "Time in minutes/hours",
      es: "Tiempo en minutos/horas",
    },
    dependsOnAnswered: "moderate_min_week",
  },
  {
    id: "vigorous_min_week",
    section: {
      en: "Physical Activity Screening",
      es: "Evaluación de Actividad Física",
    },
    type: "frequency",
    question: {
      en: "How often do you do activities that make you breathe very hard, where it is difficult to talk? (Example: running or basketball)",
      es: "¿Con qué frecuencia haces actividades que te hacen respirar muy fuerte, de modo que es difícil hablar? (Ejemplo: correr o jugar básquetbol)",
    },
    sublabel: {
      en: "Number of times per week",
      es: "Número de veces por semana",
    },
  },
  {
    id: "vigorous_duration_each",
    section: {
      en: "Physical Activity Screening",
      es: "Evaluación de Actividad Física",
    },
    type: "duration",
    question: {
      en: "About how long do you do these physical activities each time?",
      es: "Aproximadamente, ¿cuánto tiempo haces estas actividades físicas cada vez?",
    },
    sublabel: {
      en: "Time in minutes/hours",
      es: "Tiempo en minutos/horas",
    },
    dependsOnAnswered: "vigorous_min_week",
  },
  {
    id: "sedentary_hours_day",
    section: {
      en: "Physical Activity Screening",
      es: "Evaluación de Actividad Física",
    },
    type: "duration",
    question: {
      en: "How much time do you usually spend sitting on a typical day? This includes sitting at school, at home, getting to and from places, or with friends including time spent sitting at a desk, traveling in a car or bus, reading, playing cards, watching television, or using a computer. Do not include time spent sleeping.",
      es: "¿Cuánto tiempo sueles pasar sentado en un día típico? Esto incluye estar sentado en la escuela, en casa, al ir y venir de lugares, o con amigos, incluyendo el tiempo sentado en un escritorio, viajando en carro o autobús, leyendo, jugando cartas, viendo televisión o usando una computadora. No incluyas el tiempo que pasas durmiendo.",
    },
    sublabel: {
      en: "Time in minutes/hours",
      es: "Tiempo en minutos/horas",
    },
  },
];