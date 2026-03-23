import requests
import os

def test_url(url, label):
    print(f"Testing {label}: {url}")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://yts.mx/',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Success! Content length: {len(response.content)}")
    except Exception as e:
        print(f"Error: {e}")

# Sample URL from YTS
url = "https://img.yts.mx/assets/images/movies/the_beekeeper_2024/medium-cover.jpg"
test_url(url, "YTS MX Direct")

url_bz = "https://img.yts.bz/assets/images/movies/the_beekeeper_2024/medium-cover.jpg"
test_url(url_bz, "YTS BZ Mirror")

url_new = "https://movies-api.accel.li/assets/images/movies/the_beekeeper_2024/medium-cover.jpg"
test_url(url_new, "New Accel API Domain")

url_api_res = "https://yts.bz/assets/images/movies/un_weekend_criminal_2026/medium-cover.jpg"
test_url(url_api_res, "API Response URL (yts.bz)")

url_pm = "https://yts.pm/assets/images/movies/the_beekeeper_2024/medium-cover.jpg"
test_url(url_pm, "YTS PM Mirror")

url_nz = "https://yts.nz/assets/images/movies/the_beekeeper_2024/medium-cover.jpg"
test_url(url_nz, "YTS NZ Mirror")
