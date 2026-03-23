import urllib.request
import json
import socket

def test_proxy():
    # Attempt to fetch the LAN IP
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        lan_ip = s.getsockname()[0]
        s.close()
        backend_url = f"http://{lan_ip}:5001"
    except:
        backend_url = "http://127.0.0.1:5001"
    
    print(f"Testing proxy at: {backend_url}")
    
    # Example YTS image URL
    yts_image = "https://yts.mx/assets/images/movies/gladiator_ii_2024/medium-cover.jpg"
    proxy_url = f"{backend_url}/api/proxy-image?url={yts_image}"
    
    try:
        req = urllib.request.Request(proxy_url)
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"Status: {response.status}")
            print(f"Content-Type: {response.info().get_content_type()}")
            if response.status == 200:
                print("SUCCESS: Image fetched successfully via proxy")
            else:
                print(f"FAILURE: Status code {response.status}")
    except Exception as e:
        print(f"ERROR: Could not reach proxy or fetch image: {e}")
        print("Note: Ensure the Flask server is running on port 5001")

if __name__ == "__main__":
    test_proxy()
