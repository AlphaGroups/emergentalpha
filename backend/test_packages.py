import os
from dotenv import load_dotenv
load_dotenv('.env.development')
from server import get_packages
try:
    print(get_packages())
except Exception as e:
    import traceback
    traceback.print_exc()
