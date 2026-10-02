# VELTRIX AI
Visual Evidence & Logical Thinking for Real-world Intelligence eXecution.
Observe -> Understand -> Reason -> Verify -> Act

## Run backend
```
cd backend
python -m venv venv
venv\Scripts\activate        # Windows  (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env       # Mac/Linux: cp .env.example .env
uvicorn app.main:app --reload
```
Open http://127.0.0.1:8000/docs

## Run frontend
See frontend/README.md
