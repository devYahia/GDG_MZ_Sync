import os
import asyncpg
import asyncio
from typing import Optional

DATABASE_URL = os.environ.get("DATABASE_URL")

class Database:
    def __init__(self):
        self._pool: Optional[asyncpg.Pool] = None

    async def connect(self, retries=5, delay=2):
        if not self._pool:
            for i in range(retries):
                try:
                    self._pool = await asyncpg.create_pool(DATABASE_URL)
                    print("Connected to PostgreSQL")
                    return
                except Exception as e:
                    print(f"Failed to connect to PostgreSQL (attempt {i+1}/{retries}): {e}")
                    if i < retries - 1:
                        await asyncio.sleep(delay)
                    else:
                        raise

    async def disconnect(self):
        if self._pool:
            await self._pool.close()
            self._pool = None

    async def execute(self, query: str, *args):
        if not self._pool: await self.connect()
        async with self._pool.acquire() as conn:
            return await conn.execute(query, *args)

    async def fetch(self, query: str, *args):
        if not self._pool: await self.connect()
        async with self._pool.acquire() as conn:
            return await conn.fetch(query, *args)

    async def fetchrow(self, query: str, *args):
        if not self._pool: await self.connect()
        async with self._pool.acquire() as conn:
            return await conn.fetchrow(query, *args)

db = Database()
