# new-viana

### Informasi instalasi viana

Software viana terdiri dari beberapa modul aplikasi yaitu:
- new_viana		      : aplikasi utama dashboard
- pengenalan_muka		: aplikasi PYTHON untuk face recognition
- social_distancing	: aplikasi PYTHON untuk social distancing
- darknet			      : aplikasi C++ untuk menghitung objek kumulatif
- darknet-object    : aplikasi C++ untuk mendeteksi objek secara real time


yang harus disiapkan:
1. menginstall nodejs
2. menginstall mongodb
3. menginstall requirements.txt untuk library PYTHON, dengan virtual env
4. menginstall mongocxx, library mongodb untuk C++
5. kalau mongocxx tidak jalan setelah diinstall harus export LD_LIBRARY_PATH, lokasi instalasi mongocxx-nya
6. make install, untuk darknet
7. restore mongodb data yang ada di new-viana/backup/mongodb10 (mongorestore --port 27017 --db=db_viana1 backup/mongodb10/)

yang harus di-setting:
1. new-viana/config/configuration.js	: sesuaikan lokasi PATH setiap aplikasinya
2. new-viana/config/yolo		: sesuaikan lokasi PYTHON untuk mengeksekusi aplikasi PYTHON
3. new-viana/middlewares		: sesuaikan PYTHONPATH, lokasi untuk mengeksesui aplikasi PYTHON
4. new-viana/middlewares		: sesuaikan lokasi aplikasi pengenalan_muka/train_img nya
5. new-viana/config/socket		: sesuaikan lokasi file untuk socket (tidak akan dipakai kalau sudah bisa langsung realtime mongo)

cara run viana: node bin/www
