import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

load_dotenv()

# Initialize Firebase
_sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "firebase-service-account.json")
if not os.path.exists(_sa_path):
    _sa_path = os.path.join(os.path.dirname(__file__), _sa_path)

if not firebase_admin._apps:
    cred = credentials.Certificate(_sa_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

email = "alex.chen@openhire.com"

# 1. Get Employee ID
docs = db.collection("employees").where(filter=FieldFilter("email", "==", email)).limit(1).stream()
employee = None
for d in docs:
    employee = d.to_dict()
    employee["id"] = d.id

if not employee:
    print("Employee not found")
    exit()

user_id = employee['id']
print(f"User ID: {user_id}")

# 2. Get Equity
eq_docs = db.collection("equity_grants").where(filter=FieldFilter("employee_id", "==", user_id)).stream()
grants = []
for d in eq_docs:
    grant = d.to_dict()
    grant["id"] = d.id
    grants.append(grant)

print("Current Equity:", grants)

# 3. Update Equity to match Contract (1,200 shares)
if grants:
    grant = grants[0]
    grant_id = grant['id']
    print(f"--> Found Grant ID: {grant_id}")
    print(f"--> Current Total Shares: {grant.get('total_shares')}")
    
    try:
        db.collection("equity_grants").document(grant_id).update({
            "total_shares": 1200,
            "vested_shares": 400,
            "status": "Partially Vested"
        })
        
        updated = db.collection("equity_grants").document(grant_id).get().to_dict()
        print("--> UPDATE SUCCESSFUL")
        print("--> New Data:", updated)
    except Exception as e:
        print(f"--> UPDATE FAILED: {e}")
else:
    print("--> No equity grant found to update for this user.")
