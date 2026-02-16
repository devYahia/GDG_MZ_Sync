print("Starting import...")
try:
    from backend.llm_service import generate_simulation_content
    print("Import successful!")
except Exception as e:
    print(f"Import failed: {e}")
