import time
start = time.time()
from dotenv import load_dotenv
print(f"dotenv import: {time.time() - start:.4f}s")
start = time.time()
load_dotenv()
print(f"load_dotenv no args: {time.time() - start:.4f}s")
