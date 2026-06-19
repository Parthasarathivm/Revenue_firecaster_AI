# Quick Start Guide

## Revenue Forecaster AI - Get Started in 5 Minutes

---

## 🚀 For Demo/Judges (Fastest Method)

### Option 1: Open the Built App

The project is already built! Just open the built file:

```bash
# Open dist/index.html in your browser
# All functionality works in the browser without a server
```

**Note**: This is a demo version with mock ML predictions. The full ML pipeline requires the Python backend.

---

## 💻 For Development

### Step 1: Install Dependencies (2 minutes)

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Step 3: Upload Sample Data

Use the provided sample data:
- File: `data/sample_data.csv`
- Contains 15 days of marketing data
- Includes Google Ads, Meta, and Microsoft Ads campaigns

### Step 4: Generate Forecast

1. Click "Browse Files" and upload `data/sample_data.csv`
2. Select forecast period (30, 60, or 90 days)
3. Click "Generate Revenue Forecast"
4. Wait 2-3 seconds for mock ML processing
5. Explore the dashboard!

---

## 🐍 For Full ML Pipeline (Python Backend)

### Step 1: Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### Step 2: Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Run the Training Script

```bash
chmod +x run.sh
./run.sh
```

This will:
- Create necessary directories
- Load data from `data/` folder
- Train ML models (XGBoost, LightGBM, Random Forest)
- Select best model (lowest MAE)
- Generate predictions
- Save to `output/predictions.csv`

### Step 4: Check Output

```bash
cat output/predictions.csv
```

You'll see:
- Date
- Revenue Forecast
- Lower Bound (95% CI)
- Upper Bound (95% CI)
- ROAS predictions

---

## 🐳 Docker Deployment

### One Command to Rule Them All

```bash
docker-compose up -d
```

This starts:
- Frontend on port 5173
- Backend API on port 8000
- Database (SQLite)
- All dependencies

Access: http://localhost:5173

---

## 📊 Using Your Own Data

### CSV Format

Create a CSV with these columns:

```csv
Date,Channel,Campaign,Campaign Type,Clicks,Impressions,Spend,Conversions,Revenue
2024-01-01,Google Ads,Brand Campaign,Search,1200,50000,5000,120,25000
```

**Required Columns**:
- `Date` (YYYY-MM-DD)
- `Channel` (e.g., "Google Ads", "Meta", "Microsoft Ads")
- `Campaign` (any string)
- `Campaign Type` (e.g., "Search", "Display", "Shopping")
- `Clicks` (integer)
- `Impressions` (integer)
- `Spend` (decimal)
- `Conversions` (integer)
- `Revenue` (decimal)

**Tips**:
- At least 30 days of data recommended
- More data = better predictions
- Daily granularity works best

---

## 🎯 Feature Highlights

### 1. Upload & Validate
- Drag & drop CSV
- Automatic validation
- Missing value detection
- Duplicate checking

### 2. Forecast Generation
- Select 30/60/90 day period
- ML model training
- Probabilistic predictions
- Confidence intervals

### 3. Visualizations
- Revenue trend chart
- ROAS trend
- Channel distribution pie chart
- Top campaigns bar chart

### 4. AI Insights
- Executive summary
- Top performing channels
- Weak campaign identification
- Budget recommendations
- Marketing strategy tips

### 5. Budget Simulator
- Adjust channel budgets
- Instant forecast updates
- Compare scenarios

### 6. Export
- Download CSV predictions
- Share with stakeholders

---

## 🔧 Troubleshooting

### Issue: CSV Upload Fails

**Solution**:
- Check CSV format matches example
- Ensure Date column is YYYY-MM-DD
- Remove special characters from campaign names
- Check for missing required columns

### Issue: Forecast Takes Too Long

**Solution**:
- This is normal for first run (model training)
- Subsequent forecasts are faster (cached model)
- Consider using smaller dataset for testing

### Issue: Charts Not Rendering

**Solution**:
- Refresh the page
- Clear browser cache
- Check browser console for errors
- Try different browser (Chrome recommended)

### Issue: Python Dependencies Fail

**Solution**:
```bash
# Update pip
pip install --upgrade pip

# Install with verbose output
pip install -r requirements.txt -v

# If still fails, install individually
pip install pandas numpy scikit-learn xgboost lightgbm
```

---

## 📱 Browser Compatibility

✅ **Recommended**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

⚠️ **Not Tested**:
- Internet Explorer (not supported)
- Opera
- Mobile browsers (responsive but not optimized)

---

## 🎓 Next Steps

1. **Read Documentation**:
   - [README.md](README.md) - Overview
   - [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Technical details
   - [docs/MODEL_DOCUMENTATION.md](docs/MODEL_DOCUMENTATION.md) - ML details

2. **Try Advanced Features**:
   - Budget simulator
   - Different forecast periods
   - Export predictions

3. **Contribute**:
   - Fork the repository
   - Add new features
   - Submit pull requests

4. **Deploy**:
   - Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
   - Deploy to AWS/GCP/Azure
   - Share with your team

---

## 💡 Tips for Best Results

1. **Data Quality**:
   - Clean, consistent data
   - No large gaps
   - Accurate spend/revenue tracking

2. **Forecast Period**:
   - 30 days: Short-term planning
   - 60 days: Medium-term budgeting
   - 90 days: Long-term strategy

3. **Budget Simulator**:
   - Test small changes first (±10-20%)
   - Compare multiple scenarios
   - Use insights to guide decisions

4. **AI Insights**:
   - Read executive summary first
   - Check weak campaigns
   - Implement budget recommendations

---

## 📞 Need Help?

- **Documentation**: Read the docs folder
- **Issues**: Open GitHub issue
- **Email**: support@revenue-forecaster.ai
- **Demo**: Watch video walkthrough

---

## 🎉 Success!

You're now ready to use Revenue Forecaster AI!

**Happy forecasting! 🚀📈**

---

**Pro Tip**: Start with the sample data to understand the workflow, then use your own data for real insights.
