import requests
import os
import re

def test_download_fixed():
    title = "App"
    # Try a different mirror or more headers
    img_url = "https://img.yts.bz/assets/images/movies/app_2013/medium-cover.jpg"
    safe_title = re.sub(r'[^a-zA-Z0-9 ]', '', title)
    movie_dir = os.path.join(os.getcwd(), 'downloads', safe_title)
    os.makedirs(movie_dir, exist_ok=True)
    poster_path = os.path.join(movie_dir, 'poster_fixed.jpg')
    
    print(f"Targeting: {poster_path}")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://yts.mx/'
    }
    try:
        response = requests.get(img_url, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            with open(poster_path, 'wb') as f:
                f.write(response.content)
            print(f"File created: {os.path.exists(poster_path)}")
            print(f"File size: {os.path.getsize(poster_path)}")
        else:
            # Try original yts.mx if it's not blocked for the runner
            img_url_mx = img_url.replace('img.yts.bz', 'yts.mx')
            print(f"Retrying with {img_url_mx}...")
            response = requests.get(img_url_mx, headers=headers, timeout=10)
            print(f"MX Status Code: {response.status_code}")
            if response.status_code == 200:
                with open(poster_path, 'wb') as f:
                    f.write(response.content)
                print(f"File created: {os.path.exists(poster_path)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_download_fixed()
