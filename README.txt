/* Emlaxy – Modern Gayrimenkul Platformu */

Emlaxy, gayrimenkul ilanlarını kolayca listeleyebileceğiniz, detaylıca inceleyebileceğiniz ve favorilerinize ekleyebileceğiniz modern, kullanıcı dostu ve hızlı bir emlak listeleme platformudur.

* Özellikler : 

 -> Gayrimenkul ilanlarını oluşturma, düzenleme ve silme yönetimi
 -> İlanlar arasında detaylı arama ve gelişmiş filtreleme seçenekleri
 -> Beğendiğiniz ilanları kaydedebileceğiniz favori sistemi
 -> Alıcı ve satıcılar arasında platform içi anlık mesajlaşma
 -> Admin Paneli: Tüm sistemi, ilanları ve kullanıcıları yöneten kontrol merkezi
 -> Mobil, tablet ve masaüstü ile tam uyumlu modern, glassmorphism destekli karanlık tema
 -> Rate Limit, Helmet ve JWT ile public seviyede üst düzey güvenlik

* Kullanılan Teknolojiler :

    Frontend : 

   -> React.js
   -> Vite
   -> Vanilla CSS (Dark & Glassmorphism)
   -> Lucide React
   -> React Router Dom

    Backend :

   -> Node.js
   -> Express.js
   -> PostgreSQL (NeonDB)
   -> JWT & BcryptJS

* Geliştirici : Eren Söğütlü

-----------------------------------------------------------------------------------------------------------------

/* Emlaxy – Modern Real Estate Platform */

Emlaxy is a modern, user-friendly, and fast real estate listing platform where you can easily list, browse in detail, and add property listings to your favorites.

* Features : 

 -> Real estate listing creation, editing, and deletion management
 -> Detailed search and advanced filtering options for listings
 -> Favorite system to save the listings you like
 -> In-platform instant messaging between buyers and sellers
 -> Admin Panel: Control center managing the entire system, listings, and users
 -> Modern, glassmorphism-supported dark theme fully responsive with mobile, tablet, and desktop
 -> High-level security with Rate Limiting, Helmet, and JWT

* Technologies Used : 

    Frontend : 

   -> React.js 
   -> Vite 
   -> Vanilla CSS (Dark & Glassmorphism)
   -> Lucide React
   -> React Router Dom

    Backend : 

   -> Node.js 
   -> Express.js 
   -> PostgreSQL (NeonDB)
   -> JWT & BcryptJS

* Developer : Eren Söğütlü

-----------------------------------------------------------------------------------------------------------------

## Kurulum ve Çalıştırma

### 1. Gerekli Paketlerin Yüklenmesi

Frontend için:

```bash
cd frontend
npm install
```

Backend için:

```bash
cd backend
npm install
```

---

### 2. Çevre Değişkenleri Ayarları (.env)

Backend için `backend` dizininde `.env` dosyasını oluşturup bilgileri girin:

```env
PORT=5000
VERITABANI_URL=your_postgresql_database_url
JWT_GIZLI_ANAHTAR=your_secret_key
```

---

### 3. Projeyi Çalıştırma

Kurulum tamamlandıktan sonra iki ayrı terminal kullanın:

#### Backend (Arka Yüz)

```bash
cd backend
node server.js
```

> Sunucu: http://localhost:5000

---

#### Frontend (Ön Yüz)

```bash
cd frontend
npm run dev
```

> Uygulama: http://localhost:5173

-----------------------------------------------------------------------------------------------------------------

## Installation and Operation

### 1. Installing Required Packages

For frontend:

```bash
cd frontend
npm install
```

For backend:

```bash
cd backend
npm install
```

---

### 2. Environment Variables Settings (.env)

Create an `.env` file in the `backend` directory and fill in the contents:

```env
PORT=5000
VERITABANI_URL=your_postgresql_database_url
JWT_GIZLI_ANAHTAR=your_secret_key
```

---

### 3. Running the Project

Once the installation is complete, use two separate terminals:

#### Backend

```bash
cd backend
node server.js
```

> Server: http://localhost:5000

---

#### Frontend

```bash
cd frontend
npm run dev
```

> Application: http://localhost:5173