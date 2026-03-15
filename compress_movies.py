import os
import subprocess
import time

DOWNLOADS_DIR = 'downloads'

def compress_movies():
    print(f"Starting hardware-accelerated HEVC movie compression in '{DOWNLOADS_DIR}'...")
    
    # Track files to avoid infinite loops
    files_to_compress = []
    
    for root, dirs, files in os.walk(DOWNLOADS_DIR):
        for file in files:
            if file.lower().endswith(('.mp4', '.mkv', '.avi')):
                if '-compressed' not in file:
                    files_to_compress.append(os.path.join(root, file))
                    
    print(f"Found {len(files_to_compress)} video files to compress.")
    
    saved_bytes = 0
    for i, file_path in enumerate(files_to_compress, 1):
        file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
        print(f"\n[{i}/{len(files_to_compress)}] Compressing: {os.path.basename(file_path)} ({file_size_mb:.1f} MB)")
        
        base, ext = os.path.splitext(file_path)
        output_path = f"{base}-compressed.mp4"
        
        # Using Apple's hardware HEVC encoder for speed, with high audio compression
        cmd = [
            'ffmpeg', '-y', '-i', file_path,
            '-c:v', 'hevc_videotoolbox', '-q:v', '65', # 65 is standard quality for videotoolbox
            '-c:a', 'aac', '-b:a', '96k',
            output_path
        ]
        
        start_time = time.time()
        try:
            # Run ffmpeg, suppressing standard output unless it crashes
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            duration = time.time() - start_time
            
            new_size_mb = os.path.getsize(output_path) / (1024 * 1024)
            saved = file_size_mb - new_size_mb
            saved_bytes += (os.path.getsize(file_path) - os.path.getsize(output_path))
            
            print(f"  ✓ Success! Shrunk to {new_size_mb:.1f} MB in {duration:.1f}s. Saved {saved:.1f} MB.")
            
            # Replace original
            os.remove(file_path)
            os.rename(output_path, file_path)
            
        except subprocess.CalledProcessError:
            print(f"  ❌ Compression failed for {os.path.basename(file_path)}")
            if os.path.exists(output_path):
                os.remove(output_path)
                
    total_saved_gb = saved_bytes / (1024 * 1024 * 1024)
    print(f"\n🎉 Compression complete! Total space saved: {total_saved_gb:.2f} GB")

if __name__ == '__main__':
    compress_movies()
