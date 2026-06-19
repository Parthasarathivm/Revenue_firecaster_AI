# Contributing to Revenue Forecaster AI

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Pull Request Process](#pull-request-process)
7. [Feature Requests](#feature-requests)
8. [Bug Reports](#bug-reports)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes**:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes**:
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" button on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/revenue-forecaster-ai.git
cd revenue-forecaster-ai

# Add upstream remote
git remote add upstream https://github.com/original/revenue-forecaster-ai.git
```

### 2. Set Up Development Environment

```bash
# Install Node dependencies
npm install

# Install Python dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install development tools
pip install pytest black flake8 mypy
npm install -D eslint prettier
```

### 3. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

---

## Development Workflow

### 1. Make Changes

- Write clean, well-documented code
- Follow coding standards (see below)
- Add tests for new features
- Update documentation

### 2. Test Locally

```bash
# Run frontend
npm run dev

# Run tests
npm test

# Run Python tests
pytest

# Lint code
npm run lint
black src/backend
flake8 src/backend
```

### 3. Commit Changes

Use conventional commits:

```bash
# Format: <type>(<scope>): <subject>

git commit -m "feat(forecasting): add Prophet model support"
git commit -m "fix(upload): handle CSV with BOM encoding"
git commit -m "docs(readme): add deployment section"
git commit -m "test(api): add forecast endpoint tests"
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### 4. Push Changes

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

- Go to GitHub
- Click "New Pull Request"
- Fill out the template
- Wait for review

---

## Coding Standards

### TypeScript/JavaScript

**Style Guide**: Airbnb JavaScript Style Guide

```typescript
// Use TypeScript for type safety
interface ForecastParams {
  days: number;
  budget?: BudgetSimulation;
}

// Use arrow functions
const generateForecast = async (params: ForecastParams): Promise<void> => {
  // Implementation
};

// Use async/await
const loadData = async () => {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
    throw error;
  }
};

// Use destructuring
const { days, budget } = params;

// Use template literals
const message = `Forecast for ${days} days`;

// Use const/let, never var
const API_URL = 'https://api.example.com';
let counter = 0;
```

**ESLint Configuration** (.eslintrc.json):
```json
{
  "extends": ["airbnb", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "import/extensions": "off"
  }
}
```

### Python

**Style Guide**: PEP 8

```python
# Use type hints
def train_model(data: pd.DataFrame, model_type: str) -> BaseEstimator:
    """Train ML model on data.
    
    Args:
        data: Input DataFrame
        model_type: Type of model to train
        
    Returns:
        Trained model instance
    """
    if model_type == 'xgboost':
        model = XGBRegressor(n_estimators=100, random_state=42)
    else:
        raise ValueError(f"Unknown model type: {model_type}")
    
    return model


# Use docstrings
class ForecastEngine:
    """Engine for generating revenue forecasts.
    
    Attributes:
        model: Trained ML model
        scaler: Feature scaler
    """
    
    def __init__(self, model_path: str):
        """Initialize forecast engine.
        
        Args:
            model_path: Path to saved model file
        """
        self.model = self._load_model(model_path)


# Use f-strings
name = "XGBoost"
score = 0.924
print(f"Model {name} achieved R² of {score:.3f}")


# Use list comprehensions
squared = [x**2 for x in range(10)]


# Use context managers
with open('data.csv', 'r') as f:
    data = f.read()
```

**Black Configuration** (pyproject.toml):
```toml
[tool.black]
line-length = 100
target-version = ['py38']
```

### CSS/Tailwind

```css
/* Use Tailwind utilities */
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">

/* Custom classes only when necessary */
.custom-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Use CSS variables for theming */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}
```

---

## Testing

### Frontend Tests (Jest + React Testing Library)

```typescript
// Component test
import { render, screen, fireEvent } from '@testing-library/react';
import FileUpload from './FileUpload';

describe('FileUpload', () => {
  test('renders upload button', () => {
    render(<FileUpload onDataLoaded={jest.fn()} />);
    expect(screen.getByText('Browse Files')).toBeInTheDocument();
  });

  test('handles file upload', async () => {
    const onDataLoaded = jest.fn();
    render(<FileUpload onDataLoaded={onDataLoaded} />);
    
    const file = new File(['date,revenue\n2024-01-01,1000'], 'test.csv', {
      type: 'text/csv',
    });
    
    const input = screen.getByLabelText('file-upload');
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(onDataLoaded).toHaveBeenCalled();
    });
  });
});
```

### Backend Tests (pytest)

```python
import pytest
from fastapi.testclient import TestClient
from src.backend.main import app

client = TestClient(app)


def test_health_endpoint():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_upload_csv():
    """Test CSV upload endpoint."""
    with open("tests/fixtures/sample.csv", "rb") as f:
        response = client.post(
            "/api/upload",
            files={"file": ("sample.csv", f, "text/csv")}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "upload_id" in data


def test_predict_endpoint():
    """Test prediction endpoint."""
    payload = {
        "upload_id": 1,
        "forecast_days": 30
    }
    response = client.post("/api/predict", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "forecasts" in data
    assert len(data["forecasts"]) == 30


@pytest.fixture
def sample_data():
    """Fixture for sample data."""
    return pd.DataFrame({
        'Date': pd.date_range('2024-01-01', periods=30),
        'Revenue': np.random.randint(1000, 10000, 30),
        'Spend': np.random.randint(500, 5000, 30)
    })


def test_feature_engineering(sample_data):
    """Test feature engineering."""
    from src.backend.services.data_processor import engineer_features
    
    features = engineer_features(sample_data)
    
    assert 'ROAS' in features.columns
    assert 'Revenue_MA7' in features.columns
    assert features['ROAS'].notna().all()
```

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
pytest

# Coverage report
pytest --cov=src/backend --cov-report=html

# Run specific test
pytest tests/test_api.py::test_predict_endpoint
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests added for new features
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How were changes tested?

## Screenshots (if applicable)
Add screenshots

## Checklist
- [ ] Code follows style guide
- [ ] Tests pass
- [ ] Documentation updated
```

### Review Process

1. **Automated Checks**:
   - CI/CD pipeline runs tests
   - Linting checks
   - Build verification

2. **Code Review**:
   - At least 1 reviewer approval required
   - Address review comments
   - Update PR as needed

3. **Merge**:
   - Squash and merge
   - Delete branch after merge

---

## Feature Requests

### Creating Feature Requests

1. Check existing issues first
2. Use feature request template
3. Provide clear use case
4. Include mockups if applicable

**Template**:
```markdown
## Feature Description
What should this feature do?

## Use Case
Why is this feature needed?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches considered

## Additional Context
Screenshots, mockups, etc.
```

---

## Bug Reports

### Creating Bug Reports

1. Search existing issues first
2. Use bug report template
3. Provide reproduction steps
4. Include environment details

**Template**:
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Screenshots
Add screenshots

## Environment
- OS: [e.g., Ubuntu 22.04]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

## Additional Context
Any other context
```

---

## Development Tips

### Hot Reload

```bash
# Frontend hot reload (automatic)
npm run dev

# Backend hot reload
uvicorn src.backend.main:app --reload
```

### Debugging

**Frontend (Chrome DevTools)**:
```typescript
// Add debugger statement
const handleClick = () => {
  debugger;  // Execution will pause here
  console.log('Button clicked');
};

// Use console methods
console.log('Data:', data);
console.table(predictions);
console.time('Forecast');
// ... code ...
console.timeEnd('Forecast');
```

**Backend (pdb)**:
```python
# Add breakpoint
import pdb; pdb.set_trace()

# Or use ipdb for better experience
import ipdb; ipdb.set_trace()

# In code
def train_model(data):
    import pdb; pdb.set_trace()  # Debugger will stop here
    model = XGBRegressor()
    model.fit(X, y)
```

### Performance Profiling

```python
# Profile Python code
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()

# Your code here
generate_forecast()

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumtime')
stats.print_stats(10)  # Top 10 functions
```

---

## Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Given credit in documentation

Top contributors may be invited to become maintainers!

---

## Questions?

- **Discord**: Join our community server
- **Slack**: #revenue-forecaster-ai
- **Email**: developers@revenue-forecaster.ai
- **Docs**: Read the documentation

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎉**

Every contribution, no matter how small, makes a difference!
