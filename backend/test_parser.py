import os
from dotenv import load_dotenv

load_dotenv('.env.production') # Force loading production keys

from server import startup_event
print("Testing startup_event...")
startup_event()
print("Done.")
