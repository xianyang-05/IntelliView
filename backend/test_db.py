import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv(dotenv_path="backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("❌ Error: configure SUPABASE_URL and SUPABASE_SERVICE_KEY in backend/.env")
    exit(1)
    
supabase: Client = create_client(url, key)

def test_get_employee():
    email = "alex.chen@openhire.com"
    print(f"Testing lookup for: {email}")
    try:
        response = supabase.table("employees").select("*").eq("email", email).execute()
        if response.data:
            print(f"✅ Implementation OK: Found employee {response.data[0]['first_name']}")
            return True
        else:
            print("❌ Implementation Failed: No employee found")
            return False
    except Exception as e:
        print(f"❌ Implementation Error: {e}")
        return False

if __name__ == "__main__":
    test_get_employee()
