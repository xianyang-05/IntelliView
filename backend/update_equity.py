import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key)

email = "alex.chen@zerohr.com"

# 1. Get Employee ID
res = supabase.table("employees").select("id").eq("email", email).execute()
if not res.data:
    print("Employee not found")
    exit()

user_id = res.data[0]['id']
print(f"User ID: {user_id}")

# 2. Get Equity
res = supabase.table("equity_grants").select("*").eq("employee_id", user_id).execute()
print("Current Equity:", res.data)

# 3. Update Equity to match Contract (1,200 shares)
# Assuming 1,200 total, vesting over 3 years.
# Let's say 400 vested (1 year in).
if res.data:
    grant_id = res.data[0]['id']
    print(f"--> Found Grant ID: {grant_id}")
    print(f"--> Current Total Shares: {res.data[0].get('total_shares')}")
    
    try:
        update_res = supabase.table("equity_grants").update({
            "total_shares": 1200,
            "vested_shares": 400,
            "status": "Partially Vested"
        }).eq("id", grant_id).execute()
        
        print("--> UPDATE SUCCESSFUL")
        print("--> New Data:", update_res.data)
    except Exception as e:
        print(f"--> UPDATE FAILED: {e}")
        if hasattr(e, 'message'):
            print(f"    Message: {e.message}")
        if hasattr(e, 'hint'):
            print(f"    Hint: {e.hint}")
        if hasattr(e, 'details'):
            print(f"    Details: {e.details}")

else:
    print("--> No equity grant found to update for this user.")
