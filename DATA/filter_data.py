import pandas as pd
import numpy as np

# Load the dataset
load = pd.read_csv("DATA/cleaned_dataset.csv", low_memory=False)

# Define the variables we want to extract (expanded list based on what's available)
desired_variables = [
    # Demographics & Sociodemographics
    "DHHGAGE",  # Age group
    "DHH_SEX",  # Sex
    "DHHGMS",  # Marital status
    "DHHDGHSZ",  # Household size
    # General Health & Stress
    "GEN_015",  # General health
    "GEN_020",  # Mental health
    "GEN_025",  # Stress level
    "GEN_030",  # Life satisfaction
    # Chronic Conditions
    "CCC_035",  # Diabetes
    "CCC_065",  # High blood pressure
    "CCC_075",  # Heart disease
    "CCC_095",  # Stroke
    "CCC_185",  # Cancer
    "CCC_195",  # Arthritis
    "CCC_200",  # Depression
    # Mental Health & Distress
    "DEPDVSEV",  # Depression severity
    "DEPDVPHQ",  # Depression PHQ score
    # Physical Activity & Sedentary Behavior
    "PAADVREC",  # Recreational activities
    "PAADVOTH",  # Other activities
    "PAADVWHO",  # WHO physical activity guidelines
    "PAADVACV",  # Active transportation
    "PAADVVIG",  # Vigorous activities
    "PAADVVOL",  # Moderate activities
    # Substance Use & Related Risks
    "ALC_010",  # Alcohol consumption
    "ALC_015",  # Drinking frequency
    "ALC_020",  # Binge drinking
    "SMK_005",  # Smoking status
    "SMK_010",  # Current smoking
    "SMK_015",  # Smoking frequency
    # Sleep & Sleep Apnea
    "SWL_005",  # Sleep quality
    "SWL_010",  # Sleep duration
    "SWL_015",  # Sleep problems
    "SWL_020",  # Sleep medication
    # Body Weight & Measurements
    "DOHWT",  # Height/weight measured
    "HWT_050",  # Weight in kg
    "HWTDGWHO",  # WHO BMI classification
    "HWTDGBCC",  # Body composition
    # Social & Economic Factors
    "SBE_005",  # Social support
    "SBE_010",  # Social isolation
    "INCG015",  # Income level
    "INCDGHH",  # Household income
    # Healthcare Access
    "PHC_005",  # Primary care access
    "PHC_010",  # Healthcare provider
    "PHC_015",  # Healthcare visits
    "INS_005",  # Insurance status
    # Additional Health Indicators
    "CIH_005",  # Chronic conditions count
    "CIH_010",  # Health conditions
    "CIH_015",  # Medication use
    "CIH_020",  # Health limitations
]

# Check which variables actually exist in the dataset
available_variables = []
missing_variables = []

for var in desired_variables:
    if var in load.columns:
        available_variables.append(var)
    else:
        missing_variables.append(var)

print(f"Variables found in dataset ({len(available_variables)}):")
for var in available_variables:
    print(f"  ✓ {var}")

print(f"\nVariables NOT found in dataset ({len(missing_variables)}):")
for var in missing_variables:
    print(f"  ✗ {var}")

# Filter the dataset with only available variables
if available_variables:
    load_clean = load[available_variables].copy()

    # Basic data cleaning
    print(f"\nData cleaning steps:")

    # Remove rows with all missing values
    initial_rows = len(load_clean)
    load_clean = load_clean.dropna(how="all")
    print(f"  - Removed {initial_rows - len(load_clean)} rows with all missing values")

    # Special cleaning for physical activity variables
    pa_variables = ['PAADVREC', 'PAADVOTH', 'PAADVWHO', 'PAADVACV', 'PAADVVIG', 'PAADVVOL']
    missing_codes = [99996, 99997, 99998, 99999, 96, 97, 98, 99]
    
    print(f"\nCleaning physical activity variables:")
    for col in pa_variables:
        if col in load_clean.columns:
            missing_before = load_clean[col].isin(missing_codes).sum()
            print(f"  - {col}: {missing_before} missing values found")
            
            # Replace missing codes with NaN
            load_clean[col] = load_clean[col].replace(missing_codes, np.nan)
            
            # For time-based variables, fill with median
            if col in ['PAADVREC', 'PAADVOTH', 'PAADVVIG', 'PAADVVOL']:
                median_val = load_clean[col].median()
                load_clean[col] = load_clean[col].fillna(median_val)
                print(f"    Filled with median: {median_val}")
            
            # For indicator variables, fill with mode
            elif col in ['PAADVWHO', 'PAADVACV']:
                mode_val = load_clean[col].mode().iloc[0] if not load_clean[col].mode().empty else 1
                load_clean[col] = load_clean[col].fillna(mode_val)
                print(f"    Filled with mode: {mode_val}")

    # Fill missing values with appropriate defaults for other variables
    # For categorical variables, use mode; for numeric, use median
    for col in load_clean.columns:
        if col not in pa_variables:  # Skip already cleaned PA variables
            if load_clean[col].dtype in ["int64", "float64"]:
                # For numeric columns, fill with median
                median_val = load_clean[col].median()
                missing_count = load_clean[col].isna().sum()
                if missing_count > 0:
                    load_clean[col] = load_clean[col].fillna(median_val)
                    print(
                        f"  - Filled {missing_count} missing values in {col} with median ({median_val})"
                    )
            else:
                # For categorical columns, fill with mode
                mode_val = (
                    load_clean[col].mode().iloc[0]
                    if not load_clean[col].mode().empty
                    else "Unknown"
                )
                missing_count = load_clean[col].isna().sum()
                if missing_count > 0:
                    load_clean[col] = load_clean[col].fillna(mode_val)
                    print(
                        f"  - Filled {missing_count} missing values in {col} with mode ({mode_val})"
                    )

    # Save the filtered dataset
    load_clean.to_csv("DATA/filtered_data.csv", index=False)
    print(
        f"\nFiltered data saved to filtered_data.csv with {len(available_variables)} variables"
    )

    # Print some basic info about the filtered dataset
    print(f"\nFiltered dataset shape: {load_clean.shape}")
    print(f"Number of rows: {load_clean.shape[0]}")
    print(f"Number of columns: {load_clean.shape[1]}")

    # Show data types and basic statistics
    print(f"\nData types:")
    print(load_clean.dtypes)

    print(f"\nBasic statistics:")
    print(load_clean.describe())

    # Show first few rows
    print("\nFirst few rows of filtered data:")
    print(load_clean.head())

else:
    print("\nNo desired variables found in the dataset!")
