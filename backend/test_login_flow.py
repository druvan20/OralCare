import requests
import time

BASE_URL = "http://127.0.0.1:5000/api/auth"

def test_otp_flow():
    # 1. Send OTP (Simulate valid phone)
    phone = "1234567890"
    print(f"Testing Send OTP for {phone}...")
    try:
        resp = requests.post(f"{BASE_URL}/send-otp", json={"phone": phone})
        print(f"Send OTP Status: {resp.status_code}")
        print(f"Send OTP Response: {resp.json()}")
    except Exception as e:
        print(f"Failed to connect to backend: {e}")
        return

    if resp.status_code != 200:
        print("❌ Failed to send OTP")
        return

    # In development/simulated env, we can't easily get the OTP unless we mock it or read logs.
    # However, for this test, we are assuming the user can see the server logs or we are just testing the endpoint availability.
    # Actually, the backend prints the OTP to console.
    
    print("\n⚠️  Please check the server console for the OTP and enter it below to verify login.")
    otp = input("Enter OTP from server console: ")

    # 2. Verify OTP
    print(f"\nTesting Verify OTP for {phone} with code {otp}...")
    resp = requests.post(f"{BASE_URL}/verify-otp", json={"phone": phone, "otp": otp})
    print(f"Verify OTP Status: {resp.status_code}")
    print(f"Verify OTP Response: {resp.json()}")

    if resp.status_code == 200:
        data = resp.json()
        if "user" in data:
            print("✅ check passed: User data returned.")
            print(f"User Details: {data['user']}")
        else:
            print("❌ check failed: User data NOT returned.")
    else:
        print("❌ Login failed.")

if __name__ == "__main__":
    test_otp_flow()
