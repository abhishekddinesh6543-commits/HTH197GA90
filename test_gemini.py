import requests

transcript = """
Meera: Let's discuss the release.
Ravi: I will finish the payment API integration by Friday.
Priya: I will prepare the vendor comparison sheet by Monday.
Meera: We decided to postpone the release by one week.
Arjun: The pricing email still has no owner.
"""

response = requests.post(
    "http://127.0.0.1:8000/extract",
    json={"text": transcript}
)

print("STATUS:", response.status_code)
print("RESPONSE:", response.text)