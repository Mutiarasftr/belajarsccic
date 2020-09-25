// membuat variable router dengan require atau export variabel express
// Dan menggunakan metode Router
const router = require("express").Router();
// export controller yang ingin dipakai
const mahasiswaController = require("../views/mahasiswaController");

// endpoint mahasiswa
router.get("/", mahasiswaController.viewMahasiswa); // Untuk view
router.post("/", mahasiswaController.addMahasiswa); // Untuk menambahkan data mahasiswa
router.put("/", mahasiswaController.editMahasiswa); // Untuk edit data Mahasiswa
router.delete("/:id", mahasiswaController.deleteMahasiswa); // Untuk hapus data Mahasiswa
// Lalu export routernya
module.exports = router;