import time
import sys

print("Python version:", sys.version)
start_time = time.time()
print("Starting import of backend.llm_service...")

try:
    import backend.llm_service
    print(f"Import successful in {time.time() - start_time:.4f} seconds")
except Exception as e:
    print(f"Import failed: {e}")
