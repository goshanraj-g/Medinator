import pandas as pd
import numpy as np
# Load the dataset
df = pd.read_csv("DATA/cleaned_dataset.csv", low_memory=False)

# Prefixes to include
prefixes_to_keep = [
    'DHH_SEX', 'DHHGAGE', 'HWTDGHTM', 'HWTDGWTK', 'DOCCC',
    'CCC', 'WDM', 'SLP', 'SMK', 'ALC', 'ALW', 'MED', 'FLU', 'ADL',
    'PAA_'
]

# Prefixes to exclude (even if they start with a keep prefix)
exclude_prefixes = ['PAA_015', 'PAA_020',
                    # example prefixes to skip
                    'PAA_045', 'PAA_050', 'PAA_075', 'PAA_080', 'PAA_105', 'PAA_080']

# Step 1: Keep only included prefixes that aren't excluded
columns_to_keep = [
    col for col in df.columns
    if any(col.startswith(p) for p in prefixes_to_keep)
    and not any(col.startswith(ex) for ex in exclude_prefixes)
]

# Step 2: Exclude columns with second value == 996.0
filtered_cols = []
for col in columns_to_keep:
  if len(df[col]) > 1 and df[col].iloc[1] == 996.0:
    continue
  filtered_cols.append(col)

# Step 3: Filter the DataFrame
filtered_df = df[filtered_cols]

# Step 4: Add new column with random integers from 1 to 35
filtered_df['PAA_045'] = np.random.randint(1, 36, size=len(filtered_df))

# Step 5: Save to file
filtered_df.to_csv("DATA/filtered-dataset.csv", index=False)

# Step 6: Print result
print(f"Number of columns in filtered-dataset.csv: {filtered_df.shape[1]}")
