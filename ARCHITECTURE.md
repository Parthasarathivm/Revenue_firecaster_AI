# Architecture Documentation

## Revenue Forecaster AI - System Architecture

### Overview

Revenue Forecaster AI is built on a modern, scalable architecture that separates concerns between frontend visualization, backend processing, and machine learning inference.

---

## System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              React Frontend (TypeScript)                 │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │  Upload  │ │ Budget   │ │ Charts   │ │ Insights │  │  │
│  │  │ Component│ │Simulator │ │Component │ │Component │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              ▼
                         HTTP/REST
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              FastAPI Backend (Python)                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │   API    │ │  Data    │ │   ML     │ │   AI     │  │  │
│  │  │ Router   │ │Processor │ │ Service  │ │ Service  │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              ▼
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │   SQLite    │  │  ML Models  │  │  OpenAI     │
    │  Database   │  │  (Pickle)   │  │  GPT API    │
    │             │  │             │  │             │
    │ • User Data │  │ • XGBoost   │  │ • Insights  │
    │ • Forecasts │  │ • LightGBM  │  │ • Summary   │
    │ • Metadata  │  │ • RandomFor │  │ • Recomm.   │
    └─────────────┘  └─────────────┘  └─────────────┘
```

---

## Component Architecture

### 1. Frontend Layer

**Technology**: React 19.2 + TypeScript + Tailwind CSS

**Components**:

```typescript
src/
├── components/
│   ├── ui/                    // Reusable UI primitives
│   │   ├── button.tsx         // Button component
│   │   ├── card.tsx           // Card component
│   │   ├── tabs.tsx           // Tabs component
│   │   └── progress.tsx       // Progress bar
│   │
│   ├── FileUpload.tsx         // CSV upload & validation
│   ├── BudgetSimulator.tsx    // Budget adjustment UI
│   ├── ForecastCharts.tsx     // Data visualization
│   ├── AIInsights.tsx         // LLM insights display
│   └── MetricsSummary.tsx     // KPI cards
│
├── lib/
│   ├── csvParser.ts           // CSV parsing logic
│   └── mockApi.ts             // API client (mock for demo)
│
└── types/
    └── index.ts               // TypeScript type definitions
```

**State Management**:
- React hooks (`useState`, `useEffect`)
- Props drilling for component communication
- No global state management (Redux/Zustand) needed for current scope

**Styling Strategy**:
- Tailwind CSS utility classes
- Custom CSS variables for theming
- Framer Motion for animations
- Glassmorphism effects

---

### 2. Backend Layer

**Technology**: FastAPI + Python 3.11

**Structure**:

```python
src/backend/
├── main.py                    // FastAPI app entry point
├── routers/
│   ├── upload.py              // File upload endpoints
│   ├── predict.py             // Prediction endpoints
│   └── insights.py            // AI insights endpoints
│
├── services/
│   ├── data_processor.py      // Data cleaning & feature engineering
│   ├── ml_service.py          // Model training & prediction
│   ├── ai_service.py          // LLM integration
│   └── cache_service.py       // Caching layer
│
├── models/
│   ├── schemas.py             // Pydantic models
│   └── database.py            // SQLite ORM
│
└── utils/
    ├── validators.py          // Input validation
    ├── logger.py              // Logging configuration
    └── exceptions.py          // Custom exceptions
```

**API Endpoints**:

```
POST   /api/upload              // Upload CSV
GET    /api/validate/{file_id} // Validate data
POST   /api/train              // Train model
POST   /api/predict            // Generate forecast
POST   /api/insights           // Get AI insights
GET    /api/model/metrics      // Model performance
DELETE /api/model/{model_id}   // Delete model
GET    /health                 // Health check
```

---

### 3. Data Layer

#### SQLite Database Schema

```sql
-- Users table (future authentication)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uploaded files
CREATE TABLE uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    filename VARCHAR(255),
    file_path VARCHAR(500),
    row_count INTEGER,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Marketing data
CREATE TABLE marketing_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upload_id INTEGER,
    date DATE,
    channel VARCHAR(100),
    campaign VARCHAR(255),
    campaign_type VARCHAR(100),
    clicks INTEGER,
    impressions INTEGER,
    spend DECIMAL(10, 2),
    conversions INTEGER,
    revenue DECIMAL(10, 2),
    FOREIGN KEY (upload_id) REFERENCES uploads(id)
);

-- Forecasts
CREATE TABLE forecasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upload_id INTEGER,
    forecast_date DATE,
    revenue_forecast DECIMAL(10, 2),
    revenue_lower DECIMAL(10, 2),
    revenue_upper DECIMAL(10, 2),
    roas DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (upload_id) REFERENCES uploads(id)
);

-- Models
CREATE TABLE models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name VARCHAR(100),
    model_path VARCHAR(500),
    mae DECIMAL(10, 2),
    rmse DECIMAL(10, 2),
    r2_score DECIMAL(5, 4),
    mape DECIMAL(5, 2),
    trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 4. Machine Learning Layer

#### Model Pipeline

```python
class MLPipeline:
    def __init__(self):
        self.models = {
            'random_forest': RandomForestRegressor(),
            'gradient_boosting': GradientBoostingRegressor(),
            'xgboost': XGBRegressor(),
            'lightgbm': LGBMRegressor()
        }
        self.scaler = StandardScaler()
        self.best_model = None
    
    def preprocess(self, data: pd.DataFrame) -> pd.DataFrame:
        """Clean and prepare data"""
        # Remove duplicates
        # Handle missing values
        # Encode categorical variables
        # Scale numerical features
        return processed_data
    
    def engineer_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create derived features"""
        # Time-based features
        # Marketing metrics (ROAS, CTR, CVR)
        # Rolling averages
        # Lag features
        return featured_data
    
    def train(self, X_train, y_train):
        """Train all models and select best"""
        for name, model in self.models.items():
            model.fit(X_train, y_train)
            score = self.evaluate(model, X_test, y_test)
            # Select model with lowest MAE
        return self.best_model
    
    def predict(self, X: pd.DataFrame) -> dict:
        """Generate probabilistic forecast"""
        predictions = self.best_model.predict(X)
        # Calculate confidence intervals
        return {
            'forecast': predictions,
            'lower_bound': lower,
            'upper_bound': upper
        }
```

#### Feature Engineering

**Time Features**:
- Day of week (0-6)
- Day of month (1-31)
- Month (1-12)
- Quarter (1-4)
- Is weekend (boolean)
- Is month end (boolean)

**Marketing Metrics**:
- ROAS = Revenue / Spend
- CTR = Clicks / Impressions
- CVR = Conversions / Clicks
- CPC = Spend / Clicks
- CPA = Spend / Conversions
- Revenue per impression

**Trend Features**:
- 7-day moving average (revenue, spend)
- 30-day moving average (revenue, spend)
- 7-day standard deviation
- Week-over-week growth
- Month-over-month growth

**Lag Features**:
- Revenue lag 1 day
- Revenue lag 7 days
- Spend lag 1 day

---

### 5. AI Integration Layer

**LLM Service Architecture**:

```python
class AIInsightsService:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4-turbo-preview"
    
    async def generate_insights(
        self, 
        forecasts: List[Forecast],
        historical_data: pd.DataFrame
    ) -> AIInsights:
        """Generate business insights using LLM"""
        
        # Prepare context
        context = self._prepare_context(forecasts, historical_data)
        
        # Generate insights with structured output
        prompt = f"""
        You are a senior marketing analyst reviewing revenue forecasts.
        
        Historical Data Summary:
        {context['historical_summary']}
        
        Forecast Summary:
        {context['forecast_summary']}
        
        Provide:
        1. Executive summary (2-3 sentences)
        2. Top performing channel
        3. Weak campaigns
        4. Budget recommendations
        5. Expected growth analysis
        6. Marketing recommendations (5 bullets)
        """
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a marketing analytics expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        return self._parse_insights(response)
```

---

## Data Flow

### Upload Flow

```
1. User uploads CSV
   ↓
2. Frontend validates file format
   ↓
3. POST /api/upload
   ↓
4. Backend receives file
   ↓
5. Parse CSV with pandas
   ↓
6. Validate schema & data quality
   ↓
7. Save to SQLite database
   ↓
8. Return validation report
   ↓
9. Frontend displays results
```

### Prediction Flow

```
1. User clicks "Generate Forecast"
   ↓
2. POST /api/predict
   ↓
3. Load data from database
   ↓
4. Feature engineering
   ↓
5. Check if model exists
   ├─ Yes: Load from pickle
   └─ No: Train new model
   ↓
6. Generate predictions
   ↓
7. Calculate confidence intervals
   ↓
8. Call AI service for insights
   ↓
9. Save forecast to database
   ↓
10. Return results to frontend
   ↓
11. Frontend renders charts
```

---

## Scalability Considerations

### Current Architecture
- **Handles**: 1-10 concurrent users
- **Data**: Up to 100K rows per upload
- **Response time**: 2-5 seconds for predictions

### Scaling Strategy

**Horizontal Scaling**:
```
                Load Balancer
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    Instance 1  Instance 2  Instance 3
         │           │           │
         └───────────┼───────────┘
                     ▼
              Shared Database
              (PostgreSQL)
```

**Improvements**:
1. Replace SQLite with PostgreSQL
2. Add Redis for caching
3. Use Celery for async tasks
4. Deploy on Kubernetes
5. Add message queue (RabbitMQ)

---

## Security Architecture

**Authentication** (Future):
- JWT tokens
- OAuth 2.0 (Google, Microsoft)
- API key management

**Data Security**:
- Encrypted file storage
- HTTPS only
- Input validation
- SQL injection prevention
- XSS protection

**Rate Limiting**:
```python
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    if not rate_limiter.allow(client_ip):
        return JSONResponse(
            status_code=429,
            content={"error": "Too many requests"}
        )
    return await call_next(request)
```

---

## Monitoring & Logging

**Logging Strategy**:
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Usage
logger.info("Prediction request received")
logger.error("Model training failed", exc_info=True)
```

**Metrics to Track**:
- Request latency
- Model inference time
- API error rate
- Database query time
- Cache hit rate

---

## Deployment Architecture

**Docker Deployment**:
```
docker-compose.yml
├── Frontend Container (Nginx + React build)
├── Backend Container (Uvicorn + FastAPI)
└── Database Container (PostgreSQL)
```

**Production Stack**:
- **Cloud Provider**: AWS / GCP / Azure
- **Container Orchestration**: Kubernetes
- **Database**: Amazon RDS (PostgreSQL)
- **Storage**: S3 for model files
- **CDN**: CloudFront for frontend
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

---

## Performance Optimization

**Frontend**:
- Code splitting
- Lazy loading components
- Image optimization
- Memoization of expensive calculations

**Backend**:
- Database indexing
- Query optimization
- Caching with Redis
- Async I/O operations
- Connection pooling

**ML**:
- Model quantization
- Batch predictions
- Feature caching
- GPU acceleration (optional)

---

## Testing Strategy

**Unit Tests**:
```python
def test_feature_engineering():
    data = load_test_data()
    features = engineer_features(data)
    assert 'ROAS' in features.columns
    assert features['ROAS'].notna().all()

def test_prediction_range():
    predictions = model.predict(X_test)
    assert predictions.min() >= 0
    assert predictions.max() <= 1e7
```

**Integration Tests**:
```python
def test_end_to_end_prediction(client):
    # Upload file
    response = client.post("/api/upload", files={"file": csv_file})
    assert response.status_code == 200
    
    # Generate forecast
    response = client.post("/api/predict", json={"days": 30})
    assert response.status_code == 200
    assert "forecasts" in response.json()
```

---

## Conclusion

This architecture is designed for:
- ✅ Modularity
- ✅ Scalability
- ✅ Maintainability
- ✅ Performance
- ✅ Security

Ready for production deployment with proper DevOps practices.
