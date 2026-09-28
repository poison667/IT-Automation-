import time
from typing import Dict, Any, List
import polars as pl

class DataEngine:
    @staticmethod
    def profile_and_cleanse_data(
        raw_rows: List[Dict[str, Any]],
        deduplicate: bool = True,
        null_strategy: str = "FILL_DEFAULT",
        trim_whitespace: bool = True,
        normalize_dates: bool = True
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        if not raw_rows:
            return {
                "initial_row_count": 0,
                "cleaned_row_count": 0,
                "columns": [],
                "cleaned_rows": [],
                "anomalies_detected": 0,
                "duration_seconds": 0
            }

        # Load into Polars DataFrame
        df = pl.DataFrame(raw_rows)
        initial_rows = df.height
        initial_cols = df.width
        
        # 1. Profile before transformation
        column_profiles = []
        for col in df.columns:
            null_count = df[col].null_count()
            dtype = str(df[col].dtype)
            column_profiles.append({
                "name": col,
                "type": dtype,
                "null_count": null_count,
                "null_percentage": round((null_count / max(1, initial_rows)) * 100, 2),
                "unique_values": df[col].n_unique()
            })

        # 2. Trim string whitespace
        if trim_whitespace:
            for col in df.columns:
                if df[col].dtype == pl.Utf8 or df[col].dtype == pl.String:
                    df = df.with_columns(pl.col(col).str.strip_chars())

        # 3. Deduplication
        duplicates_removed = 0
        if deduplicate:
            pre_dedup = df.height
            df = df.unique()
            duplicates_removed = pre_dedup - df.height

        # 4. Null Strategy
        if null_strategy == "DROP":
            df = df.drop_nulls()
        elif null_strategy == "FILL_DEFAULT":
            for col in df.columns:
                if df[col].dtype == pl.Utf8 or df[col].dtype == pl.String:
                    df = df.with_columns(pl.col(col).fill_null("N/A"))
                elif df[col].dtype in [pl.Int32, pl.Int64, pl.Float32, pl.Float64]:
                    df = df.with_columns(pl.col(col).fill_null(0))

        # 5. Convert back to dictionaries
        cleaned_rows = df.to_dicts()

        return {
            "initial_row_count": initial_rows,
            "cleaned_row_count": len(cleaned_rows),
            "duplicates_removed": duplicates_removed,
            "column_count": initial_cols,
            "column_profiles": column_profiles,
            "cleaned_rows": cleaned_rows[:50],  # Sample preview
            "total_records_processed": len(cleaned_rows),
            "duration_seconds": round(time.time() - start_time, 3)
        }
