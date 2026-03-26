import os

def find_null_bytes(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py') or file == '.env':
                path = os.path.join(root, file)
                try:
                    with open(path, 'rb') as f:
                        if b'\0' in f.read():
                            print(f"Null byte found in: {path}")
                except Exception as e:
                    print(f"Error reading {path}: {e}")

if __name__ == "__main__":
    find_null_bytes('c:/Users/Black/Desktop/builds/invoice/backend')
