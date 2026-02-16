try:
    import daytona
    print("Importer successful")
    print(dir(daytona))
    try:
        from daytona import Daytona, DaytonaConfig
        print("Daytona class found")
        print(help(Daytona))
    except ImportError:
        print("Daytona class NOT found directly")
except ImportError:
    print("Failed to import daytona")
