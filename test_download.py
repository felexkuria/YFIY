import requests
import os
import re

def test_download():
    title = "App"
    img_url = "https://img.yts.bz/assets/images/movies/app_2013/medium-cover.jpg"
    safe_title = re.sub(r'[^a-zA-Z0-9 ]', '', title)
    movie_dir = os.path.join(os.getcwd(), 'downloads', safe_title)
    os.makedirs(movie_dir, exist_ok=True)
    poster_path = os.path.join(movie_dir, 'poster.jpg')
    
    print(f"Targeting: {poster_path}")
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        response = requests.get(img_url, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            with open(poster_path, 'wb') as f:
                f.write(response.content)
            print(f"File created: {os.path.exists(poster_path)}")
            print(f"File size: {os.path.getsize(poster_path)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_download()
