import requests
import os
import re

def test_download_alt():
    title = "App"
    # Alternative mirrors
    urls = [
        "https://img.yts.bz/assets/images/movies/app_2013/medium-cover.jpg",
        "https://yts.pm/assets/images/movies/app_2013/medium-cover.jpg",
        "https://yts.unblocked.lol/assets/images/movies/app_2013/medium-cover.jpg"
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    }
    
    for url in urls:
        print(f"Trying: {url}")
        try:
            response = requests.get(url, headers=headers, timeout=5)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print("SUCCESS!")
                break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == '__main__':
    test_download_alt()
