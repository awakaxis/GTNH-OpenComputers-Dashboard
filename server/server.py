from random import Random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()
random = Random()

last_response = 0;
responses = [
    "Response 1",
    "Response 2",
    "Response 3",
    "Response 4",
    "Response 5",
    "Response 6",
    "Response 7",
]

lsc_eu = "N/A"

# required to avoid cors rejection, https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"]
)

@app.get("/submit-lsc")
def submit_lsc(stored_eu: str = "0"):
    global lsc_eu
    lsc_eu = stored_eu
    return {"data": "success"}

@app.get("/get-eu")
def get_eu():
    return {"data": lsc_eu}

# example endpoint using query parameters
@app.get("/echo")
def echo(text: str = "echo"):
    return {"data": text}

@app.get("/test")
def test():
    global last_response
    global random

    time.sleep(random.randint(0, 5))

    copy = responses.copy()
    copy.pop(last_response)
    last_response = random.randint(0, len(responses) - 2)
    return {"data": copy[last_response]}

