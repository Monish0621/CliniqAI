# CliniqAI - AI Doctor's Second Opinion

A production-ready healthcare AI web application that provides AI-powered disease risk predictions with explainable AI (SHAP), confidence intervals, and comprehensive reporting.

## Features

- **Diabetes & Heart Disease Prediction**: Real-time risk assessment using XGBoost models
- **SHAP Explanations**: Understand what factors contribute to the risk prediction
- **Confidence Intervals**: Bootstrap-based probability ranges (e.g., 74-82%)
- **Risk Trajectory**: Track historical predictions over time
- **What-If Simulator**: Adjust values and see real-time prediction updates
- **PDF Reports**: Generate professional medical-style reports
- **Patient Comparison**: Compare SHAP explanations between patients
- **Model Transparency**: View model accuracy, AUC, ROC curves
- **Role-Based Auth**: Separate Doctor and Patient roles

## Project Structure

```
D:/cliniqai/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # Application entry point
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # SQLite database setup
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── auth.py         # JWT authentication
│   │   ├── routers/        # API endpoints
│   │   │   ├── auth.py     # Login/Register
│   │   │   ├── predictions.py
│   │   │   ├── patients.py
│   │   │   └── reports.py
│   │   └── services/       # Business logic
│   │       ├── model_service.py
│   │       ├── shap_service.py
│   │       └── pdf_service.py
│   ├── requirements.txt
│   └── run.bat / run.sh
├── frontend/               # React + TailwindCSS + Framer Motion
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DiseaseSelection.jsx
│   │   │   ├── InputForm.jsx
│   │   │   ├── Results.jsx
│   │   │   ├── ComparePatients.jsx
│   │   │   └── ModelTransparency.jsx
│   │   ├── components/
│   │   ├── context/
│   │   ├── api/
│   │   └── utils/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── diabetes_model/         # Diabetes XGBoost model
│   ├── model.pkl
│   ├── scaler.pkl
│   ├── shap_explainer.pkl
│   └── config.json
├── heart_model/           # Heart disease XGBoost model
│   ├── heart_model.pkl
│   ├── heart_scaler.pkl
│   ├── heart_shap_explainer.pkl
│   └── heart_config.json
└── README.md
```

## Prerequisites

- **Backend**: Python 3.10+
- **Frontend**: Node.js 18+ and npm

## Installation

### Backend Setup

1. Navigate to the backend directory:
   
```
bash
   cd D:/cliniqai/backend
   
```

2. Create a virtual environment (optional but recommended):
   
```
bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # OR
   source venv/bin/activate  # Linux/Mac
   
```

3. Install Python dependencies:
   
```
bash
   pip install -r requirements.txt
   
```

4. Run the backend server:
   - **Windows**: Run `run.bat` or:
     
```
bash
     set PYTHONPATH=D:/cliniqai/backend
     python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
     
```
   - **Linux/Mac**: Run `run.sh` or:
     
```
bash
     export PYTHONPATH=D:/cliniqai/backend
     uvicorn app.main:app --host 0.0.0.0 --port 8000
     
```

The backend will start at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   
```
bash
   cd D:/cliniqai/frontend
   
```

2. Install npm dependencies:
   
```
bash
   npm install
   
```

3. Run the development server:
   
```
bash
   npm run dev
   
```

The frontend will start at http://localhost:5173

## Usage

### 1. Register an Account
- Open http://localhost:5173 in your browser
- Click "Register" to create an account
- Choose role: "Doctor" or "Patient"

### 2. Login
- Login with your credentials

### 3. Select Disease Type
- Choose between "Diabetes" or "Heart Disease"
- The selection has smooth animations

### 4. Enter Patient Data
- Fill in the medical form with validated inputs
- Submit to get prediction

### 5. View Results
- See risk probability as a confidence interval
- View the risk gauge with color-coded categories
- Review SHAP bar chart showing feature contributions
- Read clinical explanation
- View risk trajectory (historical predictions)

### 6. What-If Simulator
- On the Results page, use the left panel to adjust values
- See real-time prediction updates without refreshing

### 7. Download PDF Report
- Click "Download PDF Report" for a medical-style report

### 8. Compare Patients (Doctor only)
- Select two patient records
- View side-by-side SHAP comparisons

### 9. Model Transparency
- View model accuracy, AUC, dataset information

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login (OAuth2 form data)

### Predictions
- `POST /api/v1/predictions/diabetes` - Diabetes prediction
- `POST /api/v1/predictions/heart_disease` - Heart disease prediction
- `POST /api/v1/predictions/what-if` - What-if simulation
- `GET /api/v1/predictions/info/{disease_type}` - Model information

### Patients
- `GET /api/v1/patients` - List patient records
- `POST /api/v1/patients` - Create patient record
- `GET /api/v1/patients/{id}` - Get patient record
- `DELETE /api/v1/patients/{id}` - Delete patient record

### Reports
- `POST /api/v1/reports/pdf/{prediction_id}` - Generate PDF report

### Risk Trajectory
- `GET /api/v1/trajectory/{patient_id}` - Get prediction history

## Technical Notes

### Model Loading Fallback
The XGBoost models (pickle files) may have compatibility issues with different Python versions. If model loading fails, the system automatically falls back to clinical formula-based calculations that provide clinically accurate risk assessments.

### Database
- Uses SQLite for simplicity (stored in `cliniqai.db`)
- Automatically creates tables on first run

### Security
- JWT-based authentication
- Passwords hashed with bcrypt
- Role-based access control

## Screenshots

The application features:
- Modern medical SaaS-level UI
- Glassmorphism cards with soft shadows
- Smooth animations using Framer Motion
- Loading skeletons and animated counters
- Professional medical color scheme (cyan/teal accents)

## License

MIT License
