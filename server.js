const express = require("express");
const axios = require("axios");
const fs = require("fs-extra");

const app = express();
const PORT = process.env.PORT || 5000;

const MEMORY_FILE = "memory.json";

if (!fs.existsSync(MEMORY_FILE)) {
  fs.writeJsonSync(MEMORY_FILE, {
    facts: {},
    chats: []
  }, { spaces: 2 });
}

function loadMemory() {
  return fs.readJsonSync(MEMORY_FILE);
}

function saveMemory(data) {
  fs.writeJsonSync(MEMORY_FILE, data, { spaces: 2 });
}

app.get("/", async (req, res) => {
  let msg = (req.query.msg || "").trim();

  if (!msg) {
    return res.send("Halo! Aku RBXAI.");
  }

  const key = msg.toLowerCase();
  const memory = loadMemory();

  // Cek memori
  if (memory.facts[key]) {
    return res.send(memory.facts[key]);
  }

  // Jawaban sederhana
  if (key === "halo") {
    memory.facts[key] = "Halo juga!";
    saveMemory(memory);
    return res.send("Halo juga!");
  }

  if (key === "siapa kamu") {
    memory.facts[key] = "Aku RBXAI1.0 Mini buatan Rafka.";
    saveMemory(memory);
    return res.send(memory.facts[key]);
  }

  // Cari di Wikipedia Indonesia
  try {
    const url =
      "https://id.wikipedia.org/api/rest_v1/page/summary/" +
      encodeURIComponent(msg);

    const response = await axios.get(url);

    if (response.data.extract) {
      const answer = response.data.extract;

      memory.facts[key] = answer;
      saveMemory(memory);

      return res.send(answer);
    }
  } catch (e) {
    // lanjut ke bawah
  }

  res.send("Maaf, aku belum mengetahui jawabannya.");
});

app.listen(PORT, () => {
  console.log("RBXAI aktif di port " + PORT);
});