from fastapi import FastAPI
from pydantic import BaseModel
import random
import json
import os

app = FastAPI()

class ChatRequest(BaseModel):
    username: str
    message: str


# Buat memory.json kalau belum ada
if not os.path.exists("memory.json"):
    with open("memory.json", "w") as f:
        json.dump({"players": {}}, f, indent=2)


hello_replies = [
    "Halo!",
    "Hai!",
    "Hey!",
    "Halo, ada yang bisa kubantu?",
    "Senang bertemu denganmu!"
]

unknown_replies = [
    "Aku belum tahu jawabannya.",
    "Aku masih belajar.",
    "Menarik, ceritakan lebih lanjut.",
    "Aku belum mengerti pertanyaan itu."
]


@app.get("/")
def home():
    return {"message": "RBXAI1.0 Online!"}


@app.post("/chat")
def chat(data: ChatRequest):
    username = data.username
    message = data.message
    msg = message.lower()

    # Baca memory
    with open("memory.json", "r") as f:
        memory = json.load(f)

    # Buat data player
    if username not in memory["players"]:
        memory["players"][username] = {
            "messages": [],
            "likes": [],
            "facts": {}
        }

    player = memory["players"][username]

    # Simpan pesan
    player["messages"].append(message)

    # Maksimal 20 pesan
    if len(player["messages"]) > 20:
        player["messages"].pop(0)

    # ===== PROSES PESAN =====

    # Salam
    if any(word in msg for word in ["halo", "hai", "hello", "hi"]):
        reply = random.choice(hello_replies)

    # Nama
    elif msg.startswith("namaku "):
        nama = message[7:].strip()
        player["facts"]["name"] = nama
        reply = f"Senang bertemu denganmu, {nama}. Aku akan mengingat namamu."

    elif msg == "siapa aku":
        nama = player["facts"].get("name")

        if nama:
            reply = f"Namamu adalah {nama}."
        else:
            reply = f"Kamu adalah {username}."

    # Kesukaan
    elif msg.startswith("aku suka "):
        thing = message[9:].strip()

        if thing not in player["likes"]:
            player["likes"].append(thing)

        reply = f"Oke, aku akan mengingat bahwa kamu suka {thing}."

    elif msg == "apa yang aku suka":
        if player["likes"]:
            reply = "Kamu suka " + ", ".join(player["likes"]) + "."
        else:
            reply = "Aku belum tahu apa yang kamu suka."

    # Pesan terakhir
    elif msg == "pesan terakhirku":
        if len(player["messages"]) >= 2:
            reply = (
                "Pesan terakhirmu adalah: "
                + player["messages"][-2]
            )
        else:
            reply = "Kamu belum punya pesan sebelumnya."

    # Riwayat
    elif msg == "ingat percakapanku":
        if player["messages"]:
            reply = (
                "Pesanmu:\n"
                + "\n".join(player["messages"])
            )
        else:
            reply = "Belum ada percakapan."

    # Tidak tahu
    else:
        reply = random.choice(unknown_replies)

    # Simpan memory
    with open("memory.json", "w") as f:
        json.dump(memory, f, indent=2)

    return {
        "reply": reply
    }
