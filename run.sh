#!/bin/bash

# Revenue Forecaster AI - Run Script
# Usage: ./run.sh [DATA_DIR] [MODEL_PATH] [OUTPUT_PATH]

# Set default values
DATA_DIR=${1:-"./data"}
MODEL_PATH=${2:-"./pickle/model.pkl"}
OUTPUT_PATH=${3:-"./output/predictions.csv"}

echo "=================================================="
echo "Revenue Forecaster AI - AIgnition 3.0"
echo "=================================================="
echo "Data Directory: $DATA_DIR"
echo "Model Path: $MODEL_PATH"
echo "Output Path: $OUTPUT_PATH"
echo "=================================================="

# Create necessary directories
mkdir -p data
mkdir -p pickle
mkdir -p output
mkdir -p src/backend
mkdir -p logs

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt

# Check if model exists
if [ -f "$MODEL_PATH" ]; then
    echo "Loading existing model from $MODEL_PATH"
    
    # Run prediction script
    python3 << EOF
import pickle
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

print("\n📊 Loading trained model...")
try:
    with open('$MODEL_PATH', 'rb') as f:
        model_data = pickle.load(f)
    model = model_data['model']
    scaler = model_data.get('scaler', None)
    print("✓ Model loaded successfully")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    exit(1)

print("\n📁 Loading data from $DATA_DIR...")
data_files = [f for f in os.listdir('$DATA_DIR') if f.endswith('.csv')]
if not data_files:
    print("✗ No CSV files found in data directory")
    exit(1)

df = pd.read_csv(os.path.join('$DATA_DIR', data_files[0]))
print(f"✓ Loaded {len(df)} records from {data_files[0]}")

print("\n🔧 Engineering features...")
df['Date'] = pd.to_datetime(df['Date'])
df = df.sort_values('Date')

# Aggregate by date
daily_data = df.groupby('Date').agg({
    'Spend': 'sum',
    'Revenue': 'sum',
    'Clicks': 'sum',
    'Impressions': 'sum',
    'Conversions': 'sum'
}).reset_index()

# Feature engineering
daily_data['ROAS'] = daily_data['Revenue'] / (daily_data['Spend'] + 1)
daily_data['CTR'] = daily_data['Clicks'] / (daily_data['Impressions'] + 1)
daily_data['CVR'] = daily_data['Conversions'] / (daily_data['Clicks'] + 1)
daily_data['CPC'] = daily_data['Spend'] / (daily_data['Clicks'] + 1)
daily_data['CPA'] = daily_data['Spend'] / (daily_data['Conversions'] + 1)

# Time-based features
daily_data['DayOfWeek'] = daily_data['Date'].dt.dayofweek
daily_data['DayOfMonth'] = daily_data['Date'].dt.day
daily_data['Month'] = daily_data['Date'].dt.month
daily_data['Quarter'] = daily_data['Date'].dt.quarter

# Rolling averages
daily_data['Revenue_MA7'] = daily_data['Revenue'].rolling(7, min_periods=1).mean()
daily_data['Revenue_MA30'] = daily_data['Revenue'].rolling(30, min_periods=1).mean()
daily_data['Spend_MA7'] = daily_data['Spend'].rolling(7, min_periods=1).mean()

print("✓ Features engineered successfully")

print("\n🔮 Generating forecasts...")
forecast_days = 30
last_date = daily_data['Date'].max()
forecast_dates = [last_date + timedelta(days=i+1) for i in range(forecast_days)]

# Create forecast features
forecast_features = []
for i, date in enumerate(forecast_dates):
    features = {
        'Spend': daily_data['Spend'].tail(30).mean(),
        'Clicks': daily_data['Clicks'].tail(30).mean(),
        'Impressions': daily_data['Impressions'].tail(30).mean(),
        'Conversions': daily_data['Conversions'].tail(30).mean(),
        'ROAS': daily_data['ROAS'].tail(30).mean(),
        'CTR': daily_data['CTR'].tail(30).mean(),
        'CVR': daily_data['CVR'].tail(30).mean(),
        'CPC': daily_data['CPC'].tail(30).mean(),
        'CPA': daily_data['CPA'].tail(30).mean(),
        'DayOfWeek': date.dayofweek,
        'DayOfMonth': date.day,
        'Month': date.month,
        'Quarter': date.quarter,
        'Revenue_MA7': daily_data['Revenue'].tail(7).mean(),
        'Revenue_MA30': daily_data['Revenue'].tail(30).mean(),
        'Spend_MA7': daily_data['Spend'].tail(7).mean(),
    }
    forecast_features.append(features)

forecast_df = pd.DataFrame(forecast_features)

# Prepare features for prediction
feature_cols = ['Spend', 'Clicks', 'Impressions', 'Conversions', 'ROAS', 'CTR', 'CVR', 
                'CPC', 'CPA', 'DayOfWeek', 'DayOfMonth', 'Month', 'Quarter', 
                'Revenue_MA7', 'Revenue_MA30', 'Spend_MA7']

X_forecast = forecast_df[feature_cols]

# Scale if scaler exists
if scaler:
    X_forecast_scaled = scaler.transform(X_forecast)
else:
    X_forecast_scaled = X_forecast

# Make predictions
predictions = model.predict(X_forecast_scaled)

# Calculate confidence intervals (using historical volatility)
historical_std = daily_data['Revenue'].std()
confidence_interval = 1.96 * historical_std  # 95% CI

# Create output dataframe
output_df = pd.DataFrame({
    'Date': forecast_dates,
    'Revenue_Forecast': predictions,
    'Lower_Bound': predictions - confidence_interval,
    'Upper_Bound': predictions + confidence_interval,
    'ROAS': predictions / forecast_df['Spend'],
    'ROAS_Lower': (predictions - confidence_interval) / forecast_df['Spend'],
    'ROAS_Upper': (predictions + confidence_interval) / forecast_df['Spend'],
})

# Ensure output directory exists
os.makedirs(os.path.dirname('$OUTPUT_PATH'), exist_ok=True)

# Save predictions
output_df.to_csv('$OUTPUT_PATH', index=False)
print(f"✓ Predictions saved to $OUTPUT_PATH")

print("\n📈 Forecast Summary:")
print(f"  Total Predicted Revenue: ₹{predictions.sum():,.2f}")
print(f"  Average Daily Revenue: ₹{predictions.mean():,.2f}")
print(f"  Average ROAS: {output_df['ROAS'].mean():.2f}x")
print(f"  Confidence Interval: ±₹{confidence_interval:,.2f}")

print("\n✓ Forecast generation completed successfully!")

EOF

else
    echo "No pre-trained model found. Training new model..."
    
    # Run training and prediction script
    python3 << EOF
import pandas as pd
import numpy as np
import pickle
import os
from datetime import datetime, timedelta
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import lightgbm as lgb
import warnings
warnings.filterwarnings('ignore')

print("\n📁 Loading data from $DATA_DIR...")
data_files = [f for f in os.listdir('$DATA_DIR') if f.endswith('.csv')]
if not data_files:
    print("✗ No CSV files found in data directory")
    print("Please add CSV files to the data directory")
    exit(1)

df = pd.read_csv(os.path.join('$DATA_DIR', data_files[0]))
print(f"✓ Loaded {len(df)} records from {data_files[0]}")

print("\n🔧 Preprocessing data...")
df['Date'] = pd.to_datetime(df['Date'])
df = df.sort_values('Date')

# Aggregate by date
daily_data = df.groupby('Date').agg({
    'Spend': 'sum',
    'Revenue': 'sum',
    'Clicks': 'sum',
    'Impressions': 'sum',
    'Conversions': 'sum'
}).reset_index()

# Feature engineering
daily_data['ROAS'] = daily_data['Revenue'] / (daily_data['Spend'] + 1)
daily_data['CTR'] = daily_data['Clicks'] / (daily_data['Impressions'] + 1)
daily_data['CVR'] = daily_data['Conversions'] / (daily_data['Clicks'] + 1)
daily_data['CPC'] = daily_data['Spend'] / (daily_data['Clicks'] + 1)
daily_data['CPA'] = daily_data['Spend'] / (daily_data['Conversions'] + 1)

# Time-based features
daily_data['DayOfWeek'] = daily_data['Date'].dt.dayofweek
daily_data['DayOfMonth'] = daily_data['Date'].dt.day
daily_data['Month'] = daily_data['Date'].dt.month
daily_data['Quarter'] = daily_data['Date'].dt.quarter

# Rolling averages
daily_data['Revenue_MA7'] = daily_data['Revenue'].rolling(7, min_periods=1).mean()
daily_data['Revenue_MA30'] = daily_data['Revenue'].rolling(30, min_periods=1).mean()
daily_data['Spend_MA7'] = daily_data['Spend'].rolling(7, min_periods=1).mean()

print("✓ Feature engineering completed")

# Prepare features and target
feature_cols = ['Spend', 'Clicks', 'Impressions', 'Conversions', 'ROAS', 'CTR', 'CVR', 
                'CPC', 'CPA', 'DayOfWeek', 'DayOfMonth', 'Month', 'Quarter', 
                'Revenue_MA7', 'Revenue_MA30', 'Spend_MA7']

X = daily_data[feature_cols]
y = daily_data['Revenue']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("\n🤖 Training ML models...")
models = {
    'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1),
    'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
    'XGBoost': xgb.XGBRegressor(n_estimators=100, random_state=42, n_jobs=-1),
    'LightGBM': lgb.LGBMRegressor(n_estimators=100, random_state=42, n_jobs=-1, verbose=-1),
}

best_model = None
best_mae = float('inf')
best_model_name = ''

for name, model in models.items():
    print(f"\nTraining {name}...")
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print(f"  MAE: ₹{mae:,.2f}")
    print(f"  RMSE: ₹{rmse:,.2f}")
    print(f"  R²: {r2:.4f}")
    
    if mae < best_mae:
        best_mae = mae
        best_model = model
        best_model_name = name

print(f"\n🏆 Best model: {best_model_name} (MAE: ₹{best_mae:,.2f})")

# Save model
print("\n💾 Saving model...")
os.makedirs(os.path.dirname('$MODEL_PATH'), exist_ok=True)
with open('$MODEL_PATH', 'wb') as f:
    pickle.dump({
        'model': best_model,
        'scaler': scaler,
        'model_name': best_model_name,
        'mae': best_mae,
        'feature_cols': feature_cols
    }, f)
print(f"✓ Model saved to $MODEL_PATH")

# Generate forecasts
print("\n🔮 Generating forecasts...")
forecast_days = 30
last_date = daily_data['Date'].max()
forecast_dates = [last_date + timedelta(days=i+1) for i in range(forecast_days)]

forecast_features = []
for i, date in enumerate(forecast_dates):
    features = {
        'Spend': daily_data['Spend'].tail(30).mean(),
        'Clicks': daily_data['Clicks'].tail(30).mean(),
        'Impressions': daily_data['Impressions'].tail(30).mean(),
        'Conversions': daily_data['Conversions'].tail(30).mean(),
        'ROAS': daily_data['ROAS'].tail(30).mean(),
        'CTR': daily_data['CTR'].tail(30).mean(),
        'CVR': daily_data['CVR'].tail(30).mean(),
        'CPC': daily_data['CPC'].tail(30).mean(),
        'CPA': daily_data['CPA'].tail(30).mean(),
        'DayOfWeek': date.dayofweek,
        'DayOfMonth': date.day,
        'Month': date.month,
        'Quarter': date.quarter,
        'Revenue_MA7': daily_data['Revenue'].tail(7).mean(),
        'Revenue_MA30': daily_data['Revenue'].tail(30).mean(),
        'Spend_MA7': daily_data['Spend'].tail(7).mean(),
    }
    forecast_features.append(features)

forecast_df = pd.DataFrame(forecast_features)
X_forecast = forecast_df[feature_cols]
X_forecast_scaled = scaler.transform(X_forecast)

predictions = best_model.predict(X_forecast_scaled)

# Calculate confidence intervals
historical_std = daily_data['Revenue'].std()
confidence_interval = 1.96 * historical_std

# Create output
output_df = pd.DataFrame({
    'Date': forecast_dates,
    'Revenue_Forecast': predictions,
    'Lower_Bound': predictions - confidence_interval,
    'Upper_Bound': predictions + confidence_interval,
    'ROAS': predictions / forecast_df['Spend'],
    'ROAS_Lower': (predictions - confidence_interval) / forecast_df['Spend'],
    'ROAS_Upper': (predictions + confidence_interval) / forecast_df['Spend'],
})

# Save predictions
os.makedirs(os.path.dirname('$OUTPUT_PATH'), exist_ok=True)
output_df.to_csv('$OUTPUT_PATH', index=False)
print(f"✓ Predictions saved to $OUTPUT_PATH")

print("\n📈 Forecast Summary:")
print(f"  Total Predicted Revenue: ₹{predictions.sum():,.2f}")
print(f"  Average Daily Revenue: ₹{predictions.mean():,.2f}")
print(f"  Average ROAS: {output_df['ROAS'].mean():.2f}x")

print("\n✅ Training and forecasting completed successfully!")

EOF

fi

echo ""
echo "=================================================="
echo "✅ Process completed!"
echo "=================================================="
echo "Output file: $OUTPUT_PATH"
echo "=================================================="

# Deactivate virtual environment
deactivate
