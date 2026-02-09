from typing import Dict, Tuple

class GuidelineConfig:

    def __init__(self):
        # Hard-coded CDC sleep ranges by age group
        # Format: (min_age, max_age) -> (min_sleep, max_sleep)

        self.sleepThresholds: Dict[str, Tuple[float, float]] = {   # Teens
            "18-60": (7.0, 9.0),    # Adults
            "61-64": (7.0, 9.0),    # Older adults
            "65+":  (7.0, 8.0)      # Seniors
        }

        self.exerciseMinimum: int = 150  # minutes per week
        self.source: str = "CDC Sleep and Exercise Guidelines"

    def getSleepRange(self, age: int):
       

        if 18 <= age <= 60:
            return self.sleepThresholds["18-60"]

        elif 61 <= age <= 64:
            return self.sleepThresholds["61-64"]

        elif age >= 65:
            return self.sleepThresholds["65+"]

        else:
            return None  # Out of supported range

    def getExerciseMinimum(self):
        return self.exerciseMinimum


if __name__ == "__main__":
    config = GuidelineConfig()

    print("Testing getSleepRange:")
    print("Age 16:", config.getSleepRange(16))
    print("Age 25:", config.getSleepRange(25))
    print("Age 70:", config.getSleepRange(70))

    print("\nTesting getExerciseMinimum:")
    print("Exercise minimum:", config.getExerciseMinimum())
