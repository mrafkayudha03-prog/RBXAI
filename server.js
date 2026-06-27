const http = require("http");
const url = require("url");
const fs = require("fs");

// Membaca memory.json
let memory;

try {
    memory = JSON.parse(
        fs.readFileSync("memory.json", "utf8")
    );
} catch {
    memory = {
        namaPlayer: "",
        conversation: []
    };
}

if (!memory.conversation) {
    memory.conversation = [];
}

const server = http.createServer((req, res) => {
    const query = url.parse(req.url, true).query;
    const pesan = (query.msg || "").toLowerCase().trim();

    let jawaban = "Maaf, aku belum mengerti.";

    // Salam
    if (
        pesan.includes("halo") ||
        pesan.includes("hai") ||
        pesan === "hi"
    ) {
        jawaban = "Halo juga!";
    }

    // Siapa kamu
    else if (
        pesan.includes("siapa kamu")
    ) {
        jawaban =
            "Aku RBXAI1.0 Mini, AI buatan Rafka.";
    }

    // Pembuat
    else if (
        pesan.includes("siapa pembuatmu")
    ) {
        jawaban =
            "Aku dibuat oleh Rafka.";
    }

    // Apa kabar
    else if (
        pesan.includes("apa kabar")
    ) {
        jawaban =
            "Aku baik! Terima kasih sudah bertanya.";
    }

    // Jam
    else if (
        pesan.includes("jam") ||
        pesan.includes("waktu")
    ) {
        jawaban =
            "Sekarang pukul " +
            new Date().toLocaleTimeString("id-ID");
    }

    // Tanggal
    else if (
        pesan.includes("tanggal")
    ) {
        jawaban =
            "Hari ini " +
            new Date().toLocaleDateString("id-ID");
    }

    // Simpan nama
    else if (
        pesan.startsWith("namaku ")
    ) {
        memory.namaPlayer =
            pesan.substring(7);

        jawaban =
            "Senang bertemu denganmu, " +
            memory.namaPlayer +
            "!";
    }

    // Tanya nama
    else if (
        pesan === "siapa namaku"
    ) {
        if (memory.namaPlayer === "") {
            jawaban =
                "Aku belum tahu namamu.";
        } else {
            jawaban =
                "Namamu " +
                memory.namaPlayer;
        }
    }

    // Belajar fakta
    else if (
        pesan.includes(" adalah ")
    ) {
        const bagian =
            pesan.split(" adalah ");

        const kata =
            bagian[0].trim();

        const arti =
            bagian.slice(1).join(" adalah ").trim();

        memory[kata] = arti;

        jawaban =
            "Baik, aku sudah belajar bahwa " +
            kata +
            " adalah " +
            arti +
            ".";
    }

    // Tanya fakta
    else if (
        pesan.startsWith("apa itu ")
    ) {
        const kata =
            pesan.substring(8).trim();

        if (memory[kata]) {
            jawaban =
                kata +
                " adalah " +
                memory[kata] +
                ".";
        }
    }

    // Simpan riwayat chat
    memory.conversation.push({
        user: pesan,
        ai: jawaban,
        waktu: new Date().toLocaleString("id-ID")
    });

    // Maksimal 100 chat terakhir
    if (
        memory.conversation.length > 100
    ) {
        memory.conversation.shift();
    }

    // Simpan memory
    fs.writeFileSync(
        "memory.json",
        JSON.stringify(
            memory,
            null,
            4
        )
    );

    res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8"
    });

    res.end(jawaban);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("RBXAI aktif di port " + PORT);
});