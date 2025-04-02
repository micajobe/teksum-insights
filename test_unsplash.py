import requests
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get API key from environment variable
UNSPLASH_ACCESS_KEY = os.getenv('UNSPLASH_ACCESS_KEY')

def test_unsplash_api():
    # API endpoint for random photo
    url = "https://api.unsplash.com/photos/random"
    
    # Parameters for the request
    params = {
        "query": "technology,business",
        "orientation": "landscape"
    }
    
    # Headers including authorization
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print("Success! Image details:")
            print(f"URL: {data['urls']['regular']}")
            print(f"Description: {data['description']}")
            print(f"Photographer: {data['user']['name']}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Exception occurred: {str(e)}")

if __name__ == "__main__":
    if not UNSPLASH_ACCESS_KEY:
        print("Please set UNSPLASH_ACCESS_KEY in your .env file")
    else:
        test_unsplash_api()