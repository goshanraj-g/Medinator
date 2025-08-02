import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler
from sklearn.preprocessing import OneHotEncoder
import warnings
warnings.filterwarnings('ignore')

def clean_dataset(file_path, save_output=True, output_path='../DATA/cleaned_dataset.csv'):
    try:
        df = pd.read_csv(file_path)
        original_shape = df.shape
        print(f"Dataset loaded successfully!")
        print(f"Original shape: {original_shape[0]:,} rows × {original_shape[1]:,} columns")
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None

    missing_before = df.isnull().sum().sum()
    missing_by_column = df.isnull().sum()
    missing_percent = (missing_by_column / len(df)) * 100
    print(f"Missing values found: {missing_before:,} ({(missing_before/(df.shape[0]*df.shape[1])*100):.1f}% of total)")

    high_missing_cols = missing_percent[missing_percent > 95].index.tolist()
    if high_missing_cols:
        df = df.drop(columns=high_missing_cols)
        print(f"Removed {len(high_missing_cols)} columns with >95% missing values")

    threshold = len(df.columns) * 0.2
    before_rows = len(df)
    df = df.dropna(thresh=threshold)
    after_rows = len(df)
    if before_rows != after_rows:
        print(f"Removed {before_rows - after_rows:,} rows with >80% missing values")

    for col in df.columns:
        if df[col].isnull().sum() > 0:
            if df[col].dtype == 'object':
                mode_val = df[col].mode()
                fill_val = mode_val[0] if len(mode_val) > 0 else 'Unknown'
                df[col].fillna(fill_val, inplace=True)
            else:
                median_val = df[col].median()
                if pd.notna(median_val):
                    df[col].fillna(median_val, inplace=True)
                else:
                    df[col].fillna(0, inplace=True)

    missing_after = df.isnull().sum().sum()
    print(f"Missing values after cleaning: {missing_after}")

    columns_to_drop = []

    id_patterns = ['id', 'ID', 'Id', '_id', 'key', 'index', 'idx', 'record', 'seq']
    for col in df.columns:
        for pattern in id_patterns:
            if pattern in col and df[col].nunique() > len(df) * 0.9:
                columns_to_drop.append(col)
                break

    single_value_cols = [col for col in df.columns if df[col].nunique() <= 1]
    columns_to_drop.extend(single_value_cols)

    for col in df.columns:
        if col not in columns_to_drop:
            value_counts = df[col].value_counts()
            if len(value_counts) > 0:
                most_common_pct = value_counts.iloc[0] / len(df)
                if most_common_pct > 0.99:
                    columns_to_drop.append(col)

    columns_to_drop = list(set(columns_to_drop))

    if columns_to_drop:
        df = df.drop(columns=columns_to_drop)
        print(f"Dropped {len(columns_to_drop)} irrelevant columns:")
        for col in columns_to_drop[:10]:
            print(f"   - {col}")
        if len(columns_to_drop) > 10:
            print(f"   ... and {len(columns_to_drop) - 10} more")
    else:
        print("No irrelevant columns found")

    before_dedup = len(df)
    df = df.drop_duplicates()
    after_dedup = len(df)

    if before_dedup != after_dedup:
        print(f"Removed {before_dedup - after_dedup:,} duplicate rows")
    else:
        print("No duplicate rows found")

    categorical_columns = df.select_dtypes(include=['object']).columns.tolist()
    label_encoders = {}
    onehot_columns = []

    print(f"Found {len(categorical_columns)} categorical columns")

    for col in categorical_columns:
        unique_count = df[col].nunique()

        if unique_count == 2:
            le = LabelEncoder()
            df[col + '_encoded'] = le.fit_transform(df[col])
            label_encoders[col] = le
            print(f"   Label encoded: {col} ({unique_count} categories)")

        elif 3 <= unique_count <= 10:
            dummies = pd.get_dummies(df[col], prefix=col, drop_first=True)
            df = pd.concat([df, dummies], axis=1)
            onehot_columns.extend(dummies.columns.tolist())
            print(f"   One-hot encoded: {col} ({unique_count} categories)")

        elif 11 <= unique_count <= 50:
            le = LabelEncoder()
            df[col + '_encoded'] = le.fit_transform(df[col])
            label_encoders[col] = le
            print(f"   Label encoded: {col} ({unique_count} categories)")

        else:
            print(f"   Skipped: {col} ({unique_count} categories - too many)")

    print(f"Encoded {len(label_encoders)} columns with label encoding")
    print(f"Encoded {len([col for col in categorical_columns if any(col in onehot_col for onehot_col in onehot_columns)])} columns with one-hot encoding")

    numerical_columns = df.select_dtypes(include=[np.number]).columns.tolist()

    encoded_cols = [col + '_encoded' for col in label_encoders.keys()] + onehot_columns
    numerical_columns = [col for col in numerical_columns if col not in encoded_cols]

    scalers = {}

    if numerical_columns:
        print(f"Found {len(numerical_columns)} numerical columns to scale")

        for col in numerical_columns:
            col_min = df[col].min()
            col_max = df[col].max()
            col_range = col_max - col_min

            if col_range > 100 or col_max > 1000 or col_min < -100:
                scaler = StandardScaler()
                df[col + '_scaled'] = scaler.fit_transform(df[[col]])
                scalers[col] = {'type': 'standard', 'scaler': scaler}
                print(f"   Standard scaled: {col} (range: {col_min:.2f} to {col_max:.2f})")

            elif col_range > 10:
                scaler = MinMaxScaler()
                df[col + '_scaled'] = scaler.fit_transform(df[[col]])
                scalers[col] = {'type': 'minmax', 'scaler': scaler}
                print(f"   MinMax scaled: {col} (range: {col_min:.2f} to {col_max:.2f})")
            else:
                print(f"   No scaling needed: {col} (range: {col_min:.2f} to {col_max:.2f})")
    else:
        print("No numerical columns found that need scaling")

    bool_columns = df.select_dtypes(include=['bool']).columns
    for col in bool_columns:
        df[col] = df[col].astype(int)
        print(f"   Converted boolean to int: {col}")

    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if np.isinf(df[col]).any():
            df[col] = df[col].replace([np.inf, -np.inf], np.nan)
            df[col].fillna(df[col].median(), inplace=True)
            print(f"   Fixed infinite values in: {col}")

    print(f"CLEANING SUMMARY")
    print("=" * 40)
    print(f"Original shape: {original_shape[0]:,} × {original_shape[1]:,}")
    print(f"Final shape: {df.shape[0]:,} × {df.shape[1]:,}")
    print(f"Rows removed: {original_shape[0] - df.shape[0]:,}")
    print(f"Columns removed: {original_shape[1] - df.shape[1]}")
    print(f"Missing values: {df.isnull().sum().sum()}")
    print(f"Label encoded columns: {len(label_encoders)}")
    print(f"One-hot encoded features: {len(onehot_columns)}")
    print(f"Scaled columns: {len(scalers)}")

    print(f"FINAL DATA TYPES:")
    dtype_counts = df.dtypes.value_counts()
    for dtype, count in dtype_counts.items():
        print(f"   {dtype}: {count} columns")

    memory_mb = df.memory_usage(deep=True).sum() / 1024**2
    print(f"Memory usage: {memory_mb:.1f} MB")

    if save_output:
        print(f"Saving cleaned data...")
        try:
            df.to_csv(output_path, index=False)
            print(f"Cleaned data saved to: {output_path}")

            metadata = {
                'original_shape': original_shape,
                'final_shape': df.shape,
                'columns_dropped': columns_to_drop,
                'label_encoders': {col: list(le.classes_) for col, le in label_encoders.items()},
                'onehot_columns': onehot_columns,
                'scaled_columns': list(scalers.keys()),
                'memory_mb': memory_mb,
                'data_types': df.dtypes.astype(str).to_dict()
            }

            import json
            metadata_path = output_path.replace('.csv', '_metadata.json')
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2, default=str)
            print(f"Metadata saved to: {metadata_path}")

        except Exception as e:
            print(f"Error saving data: {e}")

    print(f"DATA CLEANING COMPLETE!")
    print(f"Dataset is ready for machine learning!")

    return df

def quick_clean(file_path):
    return clean_dataset(file_path, save_output=False)

def clean_and_save(input_path, output_path):
    return clean_dataset(input_path, save_output=True, output_path=output_path)

def get_cleaning_info(file_path):
    try:
        df = pd.read_csv(file_path)

        info = {
            'original_shape': df.shape,
            'missing_values': df.isnull().sum().sum(),
            'categorical_columns': len(df.select_dtypes(include=['object']).columns),
            'numerical_columns': len(df.select_dtypes(include=[np.number]).columns),
            'duplicate_rows': df.duplicated().sum(),
            'memory_mb': df.memory_usage(deep=True).sum() / 1024**2
        }

        print("DATASET INFO:")
        for key, value in info.items():
            print(f"   {key}: {value}")

        return info

    except Exception as e:
        print(f"Error getting info: {e}")
        return None

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        output_path = sys.argv[2] if len(sys.argv) > 2 else '../DATA/cleaned_dataset.csv'
    else:
        file_path = input("Enter path to your dataset: ").strip()
        output_path = '../DATA/cleaned_dataset.csv'

    print(f"Processing: {file_path}")

    cleaned_df = clean_dataset(file_path, save_output=True, output_path=output_path)

    if cleaned_df is not None:
        print(f"SUCCESS!")
        print(f"Cleaned dataset shape: {cleaned_df.shape}")
        print(f"Saved to: {output_path}")
    else:
        print(f"FAILED!")