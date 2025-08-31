import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_squared_error, r2_score
from catboost import CatBoostRegressor
import joblib

# Load the CSV data
df = pd.read_csv('datanew.csv')
df.columns = df.columns.str.strip()

# Drop crop and practice for now
df = df.drop(columns=['crop', 'practice'], errors='ignore')

# Feature engineering
df['moisture_temp'] = df['soil_moist'] * df['temp']
df['moisture2'] = df['soil_moist'] ** 2

# Prepare features and target
X = df.drop(['coef_tCha_year'], axis=1)
y = df['coef_tCha_year']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Initialize CatBoostRegressor
catboost_model = CatBoostRegressor(
    random_seed=99,
    verbose=0,
    loss_function='RMSE'
)

# Hyperparameter grid
param_grid = {
    'depth': [4, 6, 8],
    'learning_rate': [0.01, 0.05, 0.1],
    'iterations': [200, 400]
}

grid_search = GridSearchCV(
    estimator=catboost_model,
    param_grid=param_grid,
    scoring='r2',
    cv=5,
    n_jobs=-1,
    verbose=2
)

# Train model
grid_search.fit(X_train, y_train)

print("Best CatBoost parameters:", grid_search.best_params_)
best_catboost = grid_search.best_estimator_

# Evaluate
y_pred = best_catboost.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"Test MSE: {mse:.5f}")
print(f"Test R2 Score: {r2:.3f}")

# Save model
joblib.dump(best_catboost, "best_catboost_no_crop.pkl")
