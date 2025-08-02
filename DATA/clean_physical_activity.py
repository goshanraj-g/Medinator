import pandas as pd
import numpy as np

# Load the filtered data
df = pd.read_csv("DATA/filtered_data.csv")

# Physical activity variables that need cleaning
pa_variables = [
    'PAADVREC', 'PAADVOTH', 'PAADVWHO', 'PAADVACV', 
    'PAADVVIG', 'PAADVVOL'
]

print("Before cleaning - Physical Activity Variables:")
print(df[pa_variables].describe())

# Define missing value codes to replace
missing_codes = [99996, 99997, 99998, 99999, 96, 97, 98, 99]

# Clean each physical activity variable
for col in pa_variables:
    print(f"\nCleaning {col}:")
    
    # Count missing values before
    missing_before = df[col].isin(missing_codes).sum()
    print(f"  Missing values before: {missing_before}")
    
    # Replace missing codes with NaN
    df[col] = df[col].replace(missing_codes, np.nan)
    
    # For time-based variables, fill with median
    if col in ['PAADVREC', 'PAADVOTH', 'PAADVVIG', 'PAADVVOL']:
        median_val = df[col].median()
        df[col].fillna(median_val, inplace=True)
        print(f"  Filled missing values with median: {median_val}")
    
    # For indicator variables, fill with mode (most common value)
    elif col in ['PAADVWHO', 'PAADVACV']:
        mode_val = df[col].mode().iloc[0] if not df[col].mode().empty else 1
        df[col].fillna(mode_val, inplace=True)
        print(f"  Filled missing values with mode: {mode_val}")
    
    # Count missing values after
    missing_after = df[col].isna().sum()
    print(f"  Missing values after: {missing_after}")

print("\nAfter cleaning - Physical Activity Variables:")
print(df[pa_variables].describe())

# Save the cleaned data
df.to_csv("DATA/cleaned_filtered_data.csv", index=False)
print(f"\nCleaned data saved to cleaned_filtered_data.csv")

# Show some statistics for validation
print("\nValidation - Expected ranges:")
for col in pa_variables:
    min_val = df[col].min()
    max_val = df[col].max()
    mean_val = df[col].mean()
    print(f"  {col}: min={min_val}, max={max_val}, mean={mean_val:.2f}") 