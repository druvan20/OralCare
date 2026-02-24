import sys
import os

print(f"Python Version: {sys.version}")
print(f"Python Executable: {sys.executable}")
print(f"CWD: {os.getcwd()}")
print(f"sys.path: {sys.path}")

try:
    import pandas
    print(f"SUCCESS: pandas imported from {pandas.__file__}")
    print(f"Pandas Version: {pandas.__version__}")
except ImportError as e:
    print(f"FAILURE: pandas import failed: {e}")

try:
    import tensorflow
    print(f"SUCCESS: tensorflow imported from {tensorflow.__file__}")
except ImportError as e:
    print(f"FAILURE: tensorflow import failed: {e}")
