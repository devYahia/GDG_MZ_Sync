import time
t0 = time.time()
import os
print(f"os: {time.time()-t0:.4f}")
import pathlib
print(f"pathlib: {time.time()-t0:.4f}")
import dotenv
print(f"dotenv: {time.time()-t0:.4f}")
import asyncio
print(f"asyncio: {time.time()-t0:.4f}")
