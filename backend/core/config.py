from dotenv import load_dotenv
import os

import sys

sys.dont_write_bytecode = True


load_dotenv()

def get_client_id():
  return os.getenv("CLIENT_ID")

def get_client_secret():
  return os.getenv("CLIENT_SECRET")