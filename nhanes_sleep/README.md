# NHANES Sleep Analysis

This folder contains analysis code and data for the NHANES 2021–2023
Physical Activity Questionnaire (PAQ_L).

## Data
- SLQ_L.xpt – Sleep Disorder Questionnaire
- DEMO_L.xpt – Demographics and survey weights

## Structure
- data/       Raw NHANES .xpt files + cleaned .csv file
- notebooks/  Code for cleaned data and feature extraction

## Notes
- Data files are linked using SEQN
- "Disorder" questions were removed from 2021-2023 questionnaire to focus more on sleep habits rather than sleep related medical issues. For example, "Ever told doctor had trouble sleeping?" was asked in 2020 but not in this dataset.