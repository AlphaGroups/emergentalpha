import sys
import os
from pathlib import Path

# Add project root to python path so we can import backend
sys.path.append(str(Path(__file__).parent.parent))

from backend.server import app
