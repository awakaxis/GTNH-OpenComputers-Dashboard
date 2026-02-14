from random import Random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

app = FastAPI()
random = Random()

last_response = 0
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
app.add_middleware(CORSMiddleware, allow_origins=["*"])


class EUData(BaseModel):
    stored: int = 0
    avg_in: int = 0
    avg_out: int = 0
    passive_loss: int = 0


@app.put("/submit-lsc")
def submit_lsc(
    data: EUData,
):
    global lsc_eu
    lsc_eu = data.stored

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
