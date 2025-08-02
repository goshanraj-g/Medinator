import pandas as pd

load = pd.read_csv("DATA/cleaned_dataset.csv", low_memory=False)

variables = [
    # Demographics & Sociodemographics
    "DHHGAGE",
    "DHH_SEX",
    "SDCDGCGT",
    # Anthropometrics
    "HWTDGHTM",
    "HWTDGWTK",
    "HWTDGBMI",
    # General Health & Stress
    "GEN_015",
    "GEN_020",
    "GEN_025",
    "CCC_065",
    "CCC_075",
    # Diabetes & Cardiovascular
    "CCC_095",
    "CCC_120",
    "CCC_085",
    # Mental Health & Distress
    "DIS_010",
    "DIS_015",
    "DIS_030",
    "DISDVK6",
    "DISDVDSX",
    "DEPDVSEV",
    "CCC_200",
    # Sleep & Sleep Apnea
    "SLPG005",
    "SLP_010",
    "SLP_015",
    "SLP_020",
    "CCC_035",
    # Physical Activity & Sedentary Behavior
    "PAADVREC",
    "PAADVOTH",
    "PAADVWHO",
    "SBE_005",
    "SBE_010",
    # Substance Use & Related Risks
    "ALC_010",
    "ALC_015",
    "ALC_020",
    "SMK_005",
    "CCC_030",
    # Bone Health
    "CCC_060",
]


load_clean = load[variables].copy()

load_clean.to_csv("DATA/filtered_data.csv", index=False)
print("Filtered data saved to filtered_data.csv")
