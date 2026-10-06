// Batch kedua: menyeimbangkan jumlah soal per role + menambah kasus big company
// yang relevan untuk role yang sebelumnya underrepresented.
//
// Alasan file terpisah dari company-cases.ts: batch pertama fokus pada DS/AI/ML
// (role inti ML). Batch ini menutup gap di backend, data engineering, mlops,
// frontend, dan product, plus menambah kasus marketplace yang belum ada.
import type { SeedQuestion } from "./extra-questions";

export const companyCaseQuestions2: SeedQuestion[] = [
  // ================= DATA ENGINEER =================
  {
    role: "data-engineer",
    category: "geospatial",
    difficulty: "hard",
    question:
      "Uber membuat H3, grid heksagonal hierarkis untuk indexing geospasial, menggantikan grid bujur/lintang. Jelaskan kenapa bentuk heksagon dipilih di atas persegi, dan apa arti 'hierarkis' untuk desain pipeline dan query kamu.",
    answer: `Kasus nyata: **H3, Uber's Hexagonal Hierarchical Spatial Index** (open source 2018, dipakai untuk optimasi pricing dan dispatch). Fungsi utamanya \`geoToH3(lat, lon, resolution)\` mengubah koordinat menjadi **index H3 64-bit**, dengan resolution 0 sampai 15.

### Rumus

Jumlah sel pada tiap resolution tumbuh sekitar 7x per naik satu level (2^sqrt(3)):

sel(res) = 7^res
luas_sel(res) = luas_bumi / 7^res

Untuk heksagon regulat dengan luas A:

sisi = sqrt( 2A / (3 * sqrt(3)) )

Quantization error (jarak rata-rata titik ke grid terdekat) pada kisi regulat:

error ~ spacing / 3  (heksagon)
error ~ spacing / 4  (bujur/lintang di khatulistiwa)

### Intuisi

1. **Kenapa bukan bujur/lintang.** Grid bujur/lintang punya kelemahan klasik: lebar sel mengecil sebanding cos(latitude). Pada lintang 89 derajat, sel 0.5 derajat hanya setengah kilometer, sehingga "radius 5 km" tidak lagi berbentuk lingkaran dan agregasi jarak selalu salah. Heksagon tidak punya masalah ini: semua sel diasumsikan sama luas di mana saja, sehingga "jarak k neighbors" jadi pendekatan yang wajar untuk lingkaran.
2. **Bentuk heksagon mengurangi quantization error.** Heksagon membagi bidang paling efisien dari semua poligon regulat: jarak antar titik lebih seragam dibanding persegi atau segitiga. Untuk grid bujur 720 kolom, error sekitar 13.9 km; heksagon dengan luas sel sama, error sekitar 11.5 km.
3. **"Hierarkis" itu kunci operasional.** Resolution 15 punya miliaran sel, resolution 5 hanya ribuan. Karena hubungan parent-child, kamu bisa mengaggregate dengan MEMBUANG bit resolution yang lebih rendah dari index -- tidak perlu tabel terpisah per level. Ini yang bikin H3 bisa dipakai untuk windowed aggregation, hotspot detection, dan pricing by hex tanpa map reduce manual.
4. **H3 tidak unfolds icosahedron** seperti S2, tapi meletakkan grid langsung di atas face icosahedron (geodesic DGGS). Konsekuensinya, H3 sedikit lebih cepat di-index tapi hexagon di kutub tidak persis sama luas.

### Kode

\`\`\`python
import numpy as np

RES_MAX = 15
BUMI_KM2 = 4_357_449
R_BUMI_KM = 6371.0088

def jumlah_heksagon(res):
    """H3: jumlah sel ~ 7^res (res 0 = 1 sel, res 15 ~ 4.7e12)."""
    return 7 ** res

def area_per_heksagon_km2(res):
    return BUMI_KM2 / jumlah_heksagon(res)

print("res | jumlah heksagon  | luas sel (km2) | panjang sisi (km)")
for res in range(0, 7):
    n, a = jumlah_heksagon(res), area_per_heksagon_km2(res)
    s = np.sqrt(2 * a / (3 * np.sqrt(3)))
    print(f"{res:3d} | {n:>15,} | {a:>13,.2f} | {s:>14.2f}")

# Bandingkan error kuantisasi pada luas sel yang sama.
n_bujur = 720
sp_bujur = 2 * np.pi / n_bujur
A_bujur = (2 * np.sin(sp_bujur / 2)) ** 2
s_hex = np.sqrt(2 * A_bujur / (3 * np.sqrt(3)))

print(f"\\n720 kolom bujur: sel {2*np.sin(sp_bujur/2)*R_BUMI_KM:.2f} km, "
      f"error ~{sp_bujur/4*R_BUMI_KM:.3f} km")
print(f"heksagon setua sel : sisi {s_hex*R_BUMI_KM:.2f} km, "
      f"error ~{s_hex/3*R_BUMI_KM:.3f} km")

# Concatatan grid bujur: sel makin pipih ke kutub.
print("\\nlebar sel bujur pada 720 kolom:")
for lat in [0, 45, 60, 80, 89]:
    print(f"  lat {lat:>2}: {(360/720)*np.cos(np.deg2rad(lat)):.4f} derajat")

# Resolusi untuk konteks marketplace.
for res in range(RES_MAX + 1):
    if area_per_heksagon_km2(res) <= 1.0:
        print(f"\\nkota 600 km2, target sel <= 1 km2 -> resolution {res}")
        break

assert jumlah_heksagon(0) == 1
assert jumlah_heksagon(15) > 10 ** 12
print("checks OK")
\`\`\`

### Takeaway

1. Bentuk grid menentukan bias geospasial. Heksagon + hierarki lebih cocok untuk agregasi marketplace daripada bujur/lintang.
2. Sifat hierarkis membuat satu index cukup untuk semua level agregasi.
3. Resolution adalah parameter tuning: makin kecil = presisi tinggi tapi cardinality ledakan.`,
    tags: "uber,h3,geospatial,hexagon,grid,hierarchical,indexing",
    source: "https://www.uber.com/blog/h3 (Uber Engineering, 2018) + github.com/uber/h3",
  },
  {
    role: "data-engineer",
    category: "streaming",
    difficulty: "hard",
    question:
      "Kafka menyimpan data di disk broker dan tidak bisa murah kalau retensi panjang. Jelaskan Kafka Tiered Storage (KIP-405) dan kenapa Pinterest membuat versi broker-decoupled yang membiarkan consumer baca langsung dari object storage.",
answer: `Kasus nyata: **Pinterest Tiered Storage for Apache Kafka**. KIP-405 (Kafka 3.6.0+) menetapkan Tiered Storage sebagai pola: log segment yang sudah final di-upload ke remote storage seperti S3 atau HDFS, sementara broker menyimpan data hot. Pinterest mengirim petabyte per hari lewat Kafka, jadi biaya storage adalah masalah nyata, bukan teoretis.

### Rumus

Biaya tiered storage:

biaya = hot_TB * harga_SSD + cold_TB * harga_S3

dengan proporsi data per tier:

hot_TB = total_TB * (hot_hari / retensi_hari)

### Intuisi

**Versi KIP-405 (broker-coupled).** Integrasi Tiered Storage masuk ke dalam proses broker, jadi punya akses ke protocol internal Kafka dan metadata-nya, koordinasi bagus. Tapi broker SELALU ada di jalur baca: Even ketika data sudah di S3, broker tetap harus download atau meneruskan. Artinya CPU, network, dan disk I/O broker tidak benar-benar turun.

**Versi Pinterest (broker-decoupled).** Memakai pola desain MemQ: Segment Uploader berjalan sebagai proses terpisah (sidecar) dari broker, bukan di dalamnya. Consumer (library klien) yang memutuskan: coba broker dulu, kalau offset-nya tidak ada, langsung baca dari remote storage. Broker tidak perlu tahu bahwa data sudah dipindahkan, dan request coalescing bisa ditambahkan di sisi consumer.

**Trade-off.** Broker-coupled lebih sederhana dan lebih terintegrasi dengan Kafka internal. Broker-decoupled lebih benar-benar memindahkan beban I/O dari broker, tapi menambah satu lapisanjol: data harus diformat konsisten supaya bisa dibaca baik oleh KafkaConsumer biasa maupun RemoteConsumer, dan operasi seperti reverse query atau compaction perlu dukungan tambahan.

**Kenapa ini penting buat data engineer.** Dengan Tiered Storage, Kafka bukan lagi "streaming buffer jangka pendek" tapi bisa jadi store jangka panjang. Tail reads (data yang baru) dilayani dari local page cache dengan latency rendah, sementara backfill dan recovery dilayani dari remote. Konsekuensinya untuk pipeline: retention policy tidak lagi alasan untuk kehilangan data historis, dan kamu bisa menyatukan stream dan batch dari satu sumber.

### Kode

\`\`\`python
HARGA_S3 = 23.0     # per TB/bulan
HARGA_SSD = 120.0   # per TB/bulan, disk lokal broker

def biaya_penuh(total_tb, retensi_hari):
    """Semua data ditahan di broker selama retensi penuh."""
    return total_tb * HARGA_SSD

def biaya_tiered(total_tb, hot_hari, retensi_hari):
    """Data 'hot' (belum lewat retensi) di broker, sisanya di S3."""
    if hot_hari <= 0:
        raise ValueError("hot tier tidak boleh kosong")
    if hot_hari > retensi_hari:
        raise ValueError("retensi tidak boleh lebih pendek dari hot tier")
    hot = total_tb * (hot_hari / retensi_hari)
    return hot * HARGA_SSD + (total_tb - hot) * HARGA_S3

total, retensi = 20_000, 365
penuh = biaya_penuh(total, retensi)
tiered = biaya_tiered(total, hot_hari=30, retensi_hari=retensi)

print(f"semua di SSD       : \${penuh:,.0f}/bulan")
print(f"30 hari hot + S3   : \${tiered:,.0f}/bulan")
print(f"hemat             : {(penuh - tiered) / penuh * 100:.0f}%")

# Guard: config tidak valid harus ditolak, bukan dihitung diam-diam.
for hot, ret in [(0, retensi), (400, retensi)]:
    try:
        biaya_tiered(total, hot_hari=hot, retensi_hari=ret)
        print(f"BUG: hot={hot} tidak ditolak")
    except ValueError as e:
        print(f"ditolak (hot={hot}): {e}")

# Titik impas: tambahan hot hari langsung menambah biaya.
biaya_31 = biaya_tiered(total, 31, retensi)
print(f"\\nbiaya 1 hot-hari tambahan: \${biaya_31 - tiered:,.0f}/bulan")

assert tiered < penuh
assert biaya_tiered(total, 30, retensi) == tiered
print("checks OK")
\`\`\`

### Takeaway

1. Tiered Storage memisahkan hot path (butuh latency rendah) dari cold path (butuh murah). Ini pola umum: page cache untuk yang baru, object storage untuk yang lama.
2. KIP-405 broker-coupled lebih terintegrasi; Pinterest broker-decoupled benar-benar menurunkan beban broker. Pilih sesuaiITE bottleneck kamu.
3. Broker tidak selalu harus jadi critical path. Kalau consumer bisa baca remote langsung, recovery dan backfill jadi jauh lebih murah.`,
    tags: "pinterest,kafka,tiered-storage,kip-405,streaming,broker,s3",
    source:
      "https://medium.com/pinterest-engineering/pinterest-tiered-storage-for-apache-kafka-a-broker-decoupled-approach-c33c69e9958b (2024) + cwiki.apache.org KIP-405",
  },
  {
    role: "data-engineer",
    category: "pipelines",
    difficulty: "medium",
    question:
      "Netflix mengganti pipeline streaming lama mereka dengan Data Mesh. Jelaskan apa yang sebenarnya berubah secara arsitektur (bukan hanya istilah), dan kenapa desentralisasi ownership data malah lebih sulit dari monolith pipeline.",
    answer: `Kasus nyata: **Netflix Data Mesh** (tech blog 2022), menggantikan pipeline streaming generasi sebelumnya yang bernama Keystone. Fokus awalnya adalah use case **Change Data Capture (CDC)**.

### Rumus

Setiap pipeline punya SLO yang diukur terhadap dua hal:

 availability = waktu_layanan_berhasil / total_waktu
 freshness_lag = now() - timestamp_data_terakhir

Owner per pipeline yang di-run dalam satu siklus identity check:

 pipelines(domain) -> count | setiap domain punya >= 1 pipeline terdaftar

### Intuisi

**Arsitektur dua layer:**

1. **Control plane (controllers).** Menerima request user, lalu deploy dan mengorkestrasi pipeline. Controller mendelegasikan pengelolaan lifecycle resource ke microservice terpisah.
2. **Data plane (pipelines).** Pipeline yang melakukan kerja berat: baca dari sumber, proses, tulis ke tujuan.

Prinsip penting dari Data Mesh:

1. **Ownership data decentralized.** Tiap domain bisnis memiliki dan mengelola datanya sendiri sebagai "produk", lengkap dengan SLO. Ini berbeda dari model lama di mana satu tim data platform menjadi owner semua pipeline.
2. **Schema sebagai kontrak.** Netflix menggunakan Apache Avro sebagai schema standar antar domain, supaya data bisa dit discoveries dan dipercaya lintas domain.
3. **Kafka sebagai tulang punggung.** Kafka menjadi komponen utama untuk transport data, Flink untuk pemrosesan real-time, dan connector untuk memancarkan event CDC.

**Kenapa ini lebih sulit, bukan lebih mudah:**

1. **Desentralisasi menambah jumlah kontrak.** Di monolith, satu pipeline punya beberapa input-output yang jelas. Di data mesh, ada banyak pipeline yang saling interactacross domain, dan setiap boundary butuh schema yang bisa dipercaya.
2. **Onboarding membos.** Startup dengan monolith pipeline bisa understand semua datanya dengan membaca satu tempat. Dengan data mesh, #[understand] data requires discovering semua pipeline owners dan schema contracts mereka.
3. **Operasional lebih berat.** Orkestrasi, monitoring, dan onboarding pipeline jadi responsibility distributed. Kalau satu pipeline down, dampaknya ke domain lain harus di-trace melintasi beberapa owner.
4. **Bisa jadi lebih baik atau lebih buruk.** Kalau tim kamu kecil dan domainnya masih tightly coupled, data mesh hanya menambah overhead. Justru paling berguna di organisasi besar dengan banyak domain yang sudah punya ownership jelas.

### Kode

\`\`\`python
from dataclasses import dataclass, field

@dataclass
class Pipeline:
    name: str
    domain: str              # domain pemilik data
    sumber: list
    tujuan: list
    schema: str              # Avro schema, jadi kontrak antar domain
    slo_latensi_detik: int = 60

@dataclass
class DataMesh:
    """Control plane: deploy + orkestrasi pipeline.
    Data plane: pipeline itu sendiri yang kerja."""
    pipelines: dict = field(default_factory=dict)

    def deploy(self, pipeline: Pipeline):
        if pipeline.name in self.pipelines:
            raise ValueError(f"pipeline {pipeline.name} sudah ada")
        # Ownership harus jelas sebelum deploy.
        if not pipeline.domain or not pipeline.schema:
            raise ValueError("pipeline harus punya domain owner dan schema kontrak")
        self.pipelines[pipeline.name] = pipeline
        return f"deployed {pipeline.name} for domain {pipeline.domain}"

    def consume(self, pipeline_name: str, consumer_domain: str):
        p = self.pipelines.get(pipeline_name)
        if p is None:
            raise KeyError(f"pipeline {pipeline_name} tidak ada")
        # Kontrak schema: consumer harus bisa verifikasi skema.
        return {
            "schema": p.schema,
            "slo_latensi_detik": p.slo_latensi_detik,
            "owner": p.domain,
            "consumer": consumer_domain,
        }

mesh = DataMesh()
mesh.deploy(Pipeline("cdc-orders", "orders", ["db-orders"], ["kafka"],
                     schema="avro-order-v3", slo_latensi_detik=5))
mesh.deploy(Pipeline("cdc-users", "users", ["db-users"], ["kafka"],
                     schema="avro-user-v2"))

# Cross-domain consume harus lewat schema contract.
print(mesh.consume("cdc-orders", "pricing"))
print(mesh.consume("cdc-users", "pricing"))

# Guard: pipeline tanpa owner atau schema tidak boleh masuk.
for p in [Pipeline("x", "", ["a"], ["b"], "avro-v1"),
          Pipeline("y", "orders", ["a"], ["b"], "")]:
    try:
        mesh.deploy(p)
        print("BUG: pipeline invalid diterima")
    except ValueError as e:
        print(f"ditolak: {e}")

assert len(mesh.pipelines) == 2
print("checks OK")
\`\`\`

### Takeaway

1. Data mesh bukan "tools baru" -- ini organizational change. Tools (Kafka, Flink, Avro) hanya enabler.
2. Decentralized ownership menambah overhead kontrak dan operasional. Hanya worth it di organisasi besar dengan banyak domain.
3. Schema registry (Avro di Netflix) adalah contract enforcement layer yang membuat desentralisasi mungkin bekerja.`,
    tags: "netflix,data-mesh,cdc,kafka,flink,avro,decentralized,orchestration",
    source: "https://netflixtechblog.com/data-mesh-a-data-movement-and-processing-platform-netflix-1288bcab2873 (2022) + InfoQ summary",
  },

  // ================= BACKEND ENGINEER =================
  {
    role: "backend-engineer",
    category: "api",
    difficulty: "medium",
    question:
"Stripe punya fitur idempotency key untuk semua POST. Jelaskan mekanismenya secara lengkap: apa yang disimpan, seberapa lama, dan bagaimana cara menangani retry setelah error jaringan versus setelah 500.",
    answer: `Kasus nyata: **Stripe API Idempotency**. Setiap mutating request bisa menyertakan header \`Idempotency-Key\`. Ini penting karena di payment API, charge yang dobel adalah kerugian nyata, dan retry setelah network error adalah hal biasa.

### Rumus

Kontrak idempotency yang harus dipenuhi server:

 response(key, params) == response_pertama(key, params)   untuk semua t < TTL
 TTL = 24 jam

Kalau request pertama gagal validasi atau konflik dengan request lain yang
sedang jalan, hasil TIDAK disimpan, sehingga request itu boleh di-retry:

 Kalau request_pertama_gagal_validasi: response(key) = jalankan ulang

1. Client mengirim POST dengan \`Idempotency-Key\` (biasanya UUID v4).
2. Server menyimpan **status code dan body respons** dari request pertama, **terlepas dari berhasil atau gagal**.
3. Request berikutnya dengan key yang sama mengembalikan **hasil yang sama persis**, termasuk jika hasil pertama adalah 500.
4. Server membandingkan **parameter** request baru dengan request asli. Kalau beda, server menolak dengan 400 (salahgunakan key).
5. Key di-prune otomatis setelah **minimal 24 jam**. Key yang dipakai setelah di-prune diperlakukan sebagai request baru.
6. Kalau request gagal validasi atau konflik dengan request lain yang sedang jalan, **hasil tidak disimpan** -- request itu boleh di-retry.

### Intuisi

1. **Kenapa 500 pun di-cache.** Ini keputusan yang sering dianggap kontroversial. Alasannya: kalau operasi sudah mulai jalan lalu gagal di tengah (setelah charge ter-create tapi sebelum respons terkirim), retry tanpa cache akan menagih dobel. Dengan cache, retry mengembalikan 500 yang sama dan client tahu harus investigative lebih dulu, bukan retry buta.
2. **Kenapa harus retry dengan key yang sama.** Kalau client generate key baru tiap retry, idempotency jadi tidak berguna: server melihat request baru setiap kali. Key harus dibuat per **operasi logis**, bukan per percobaan HTTP.
3. **Kenapa ada header \`Stripe-Should-Retry\`.** Client tidak selalu bisa menentukan dari status code saja apakah aman retry. Header ini memberi sinyal eksplisit: \`true\` = retry, \`false\` = jangan, tidak ada header = server tidak yakin.
4. **Kenapa GET dan DELETE tidak butuh idempotency key.** POST tidak idempotent secara definisi; GET dan DELETE sudah idempotent oleh semantics HTTP.
5. **Kenapa key expiration 24 jam.** Trade-off antara penyimpanan dan safety. Client yang retry jauh setelah 24 jam (retry yang tertunda di queue) akan mendapat request baru, jadi aturlah untuk handle long-running retries secara eksplisit.

### Kode

\`\`\`typescript
type Result = { status: number; body: object };
type Stored = { params: string; hasil: Result };

const store = new Map<string, Stored>();

function tanganiPOST(key: string | null, params: object, jalankan: () => Result): Result {
  if (key === null) return jalankan();

  const tersimpan = store.get(key);
  if (tersimpan) {
    // Key sama + payload beda = salahgunakan, tolak.
    if (tersimpan.params !== JSON.stringify(params)) {
      return { status: 400, body: { error: "key dipakai dengan parameter berbeda" } };
    }
    return tersimpan.hasil; // kembalikan hasil yang sama, termasuk 500
  }
  const hasil = jalankan();
  // Disimpan-BAWAH sukses atau gagal.
  store.set(key, { params: JSON.stringify(params), hasil });
  return hasil;
}

function exponentialBackoff(percobaan: number, rng: () => number): number {
  const base = Math.min(2 ** percobaan * 100, 10_000);
  return base * (1 + rng()); // full jitter, bukan angka tetap
}

let state = 42;
function rng() {
  state = (state * 1664525 + 1013904223) % 4294967296;
  return state / 4294967296;
}

let anon = 0;
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

function charge(key: string | null, nominal: number): Result {
  if (key === null) {
    // Tanpa key, tiap panggilan = charge baru.
    return { status: 200, body: { charge_id: \`ch_\${hash(\`anon_\${anon++}\`)}\`, nominal } };
  }
  return tanganiPOST(key, { nominal }, () => {
    if (nominal <= 0) return { status: 400, body: { error: "nominal tidak valid" } };
    return { status: 200, body: { charge_id: \`ch_\${hash(key)}\`, nominal, status: "succeeded" } };
  });
}

// Kasus 1: sukses, respons hilang, retry dengan key sama.
const key = "order-8812-attempt-1";
const first = charge(key, 50000);
const retry = charge(key, 50000);
console.log("idempoten:", JSON.stringify(retry) === JSON.stringify(first) ? "YA" : "TIDAK");

// Kasus 2: key sama, nominal beda -> ditolak.
console.log("konflik  :", charge(key, 75000).status);

// Kasus 3: tanpa key, retry = double charge.
let n = 0;
for (let i = 0; i < 2; i++) n += charge(null, 50000).status === 200 ? 1 : 0;
console.log("tanpa key:", n, "charge terjadi");

// Kasus 4: 500 pun dicache.
store.clear();
store.set("gagal-1", { params: JSON.stringify({ x: 1 }),
                       hasil: { status: 500, body: { error: "upstream timeout" } } });
const ulang500 = tanganiPOST("gagal-1", { x: 1 }, () => ({ status: 200, body: { ok: true } }));
console.log("retry 500:", ulang500.status);

console.log("backoff  :", [0, 1, 2].map(i => Math.round(exponentialBackoff(i, rng))).join(", "));
\`\`\`

### Takeaway

1. Idempotency key adalah mekanisme insurance untuk client yang retry. Tanpa itu, client tidak tahu apakah request-nya sudah sampai.
2. Menyimpan 500 pun penting: mencegah efek samping yang sudah sebagian jalan.
3. Key harus per operasi logis, bukan per percobaan HTTP.
4. Semua POST di payment API harus punya ini. Bukan opsional.`,
    tags: "stripe,idempotency,retry,backoff,payment,api,distributed",
    source:
      "https://docs.stripe.com/api/idempotent_requests + https://stripe.com/blog/idempotency (2017)",
  },
  {
    role: "backend-engineer",
    category: "databases",
    difficulty: "hard",
    question:
      "Discord menyimpan triliun-an pesan di Cassandra lalu pindah ke ScyllaDB. Jelaskan kenapa Cassandra jadi high-toil di skala mereka, dan apa yang benar-benar berubah di ScyllaDB sehingga 177 node jadi 72 node.",
    answer: `Kasus nyata: **Discord, migrasi trillions of messages dari Cassandra ke ScyllaDB** (blog Discord, 2023). Pada 2017, Discord menjalankan 12 node Cassandra dengan miliaran pesan. Awal 2022, cluster itu sudah **177 node** dengan **triliun** pesan.

### Rumus

Kapasitas primer yang benar-benar dilayani (bukan replika):

 primer_TB = n_node * TB_per_node / replikasi

Beban per partisi. Dengan satu partisi 'hot' membawa p_berbagi dari traffic total T:

 beban_hot  = T * p_berbagi
 beban_cold = (T - beban_hot) / (n_node - 1)

Kunci: beban_hot tidak bergantung pada n_node. Menambah node hanya
mengurangi beban_cold.
### Intuisi

**Kenapa Cassandra jadi masalah:**

1. **High-toil.** Cassandra punya garbage collector (Java), dan GC pause di satu node berarti latency naik untuk semua query di node itu. Discord melaporkan sering firefighting dan harus sering memangkas operasi maintenance karena terlalu mahal.
2. **Hot partition.** Partisi Discord berbasis \`PRIMARY KEY ((channel_id, bucket), message_id)\`. Kalau satu kombinasi channel_id + bucket dapat traffic sangat besar, node itu jadi bottleneck, dan latency SELURUH cluster naik karena request queue menumpuk.
3. **Resource sharing antar shard.** Java sharing memory antar shard berarti satu shard yang lambat bisa memperlambat shard lain di process yang sama.

**Apa yang ScyllaDB ubah:**

1. **Ditulis di C++, bukan Java.** Tidak ada garbage collector sama sekali. Ini yang paling besar: tidak ada GC pause, jadi p99 latency jauh lebih stabil.
2. **Shard-per-core.** Setiap shard punya core dan memory sendiri, jadi tidak ada resource contention antar shard.
3. **Per-core throughput lebih baik.** FalkorDB-style architecture, tapi intinya throughput per core lebih tinggi sehingga butuh lebih sedikit node.
4. **Hybrid RAID1 storage.** Setup disk yang dirancang khusus untuk latency rendah di GCP.

**Dampaknya secara angka:**
- Dari **177 node Cassandra** menjadi **72 node ScyllaDB**.
- Tiap ScyllaDB node punya **9 TB** disk, naik dari rata-rata **4 TB** per Cassandra node.
- Tail latency membaik drastis.

**Migrasi tanpa downtime:**Discord membangun service layer baru ("data services") dalam Rust, diakses via gRPC, dengan dua tanggung jawab utama: **request coalescing** (menghindari banyak request untuk pesan yang sama) dan **consistent hash-based routing** ke instance data service berdasarkan routing key seperti channel_id.

### Kode

\`\`\`python
import numpy as np

def tb_primer(n_node, tb_per_node, replikasi=3):
    """Data yang served, bukan replika."""
    return n_node * tb_per_node / replikasi

cassandra = tb_primer(177, 4)
scylla = tb_primer(72, 9)
print(f"Cassandra 177 node x 4 TB : {cassandra:,.0f} TB primer")
print(f"ScyllaDB  72 node x 9 TB  : {scylla:,.0f} TB primer")
print(f"node turun {(177 - 72) / 177 * 100:.0f}%, "
      f"kapasitas/node naik {(9 - 4) / 4 * 100:.0f}%")
print()

TOTAL_PER_NODE = 1000.0  # unit/detik aggregate sebelum saturasi

def skenario(n_node, hot_share):
    hot = TOTAL_PER_NODE * hot_share
    cold = (TOTAL_PER_NODE - hot) / max(n_node - 1, 1)
    return hot, cold

print(f"{'skenario':<22}{'hot partition':>14}{'cold/node':>12}")
for nama, (hot, cold) in [
    ("12 node, hot 12%", skenario(12, 0.12)),
    ("24 node, hot 12%", skenario(24, 0.12)),
    ("24 node, hot 3%", skenario(24, 0.03)),
]:
    print(f"{nama:<22}{hot:>14.1f}{cold:>12.1f}")

hot12, hot24 = skenario(12, 0.12)[0], skenario(24, 0.12)[0]
hot_mitigasi = skenario(24, 0.03)[0]
print()
print(f"ganti 12 -> 24 node    : hot {hot12:.0f} -> {hot24:.0f} ({(hot24 - hot12) / hot12 * 100:+.0f}%)")
print(f"re-sharding hot 12->3% : hot {hot24:.0f} -> {hot_mitigasi:.0f} ({(hot_mitigasi - hot24) / hot24 * 100:+.0f}%)")
print("-> scaling horizontal tidak menyentuh hot partition; hanya re-sharding.")

# Error rate naik nonlinear saat satu shard mendekati limit.
for load in [0.5, 0.7, 0.9, 1.0, 1.1]:
    print(f"  utilisasi {load:.0%} -> error relatif {load ** 3:>6.2f}")

assert hot24 == hot12, "ganti node tidak boleh mengubah beban hot partition"
assert hot_mitigasi < hot24
print("\nchecks OK")
\`\`\`

Kapasitas primer turun sedikit (236 TB jadi 216 TB) tapi jumlah node berkurang 59%,
sehingga biaya operasional per petabyte turun drastis. Yang lebih penting, loads per
node naik cukup supaya tidak ada node yang mendekati batas, dan tanpa GC pause.

Tabel hot partition menunjukkan inti masalahnya: ganti 12 node jadi 24 node tidak
berubah apa pun untuk partisi yang panas. Hanya re-sharding kunci yang menguranginya.
### Takeaway

1. Kalau masalah utama adalah GC pause dan resource sharing, ganti runtime lebih efektif daripada scaling horizontal.
2. Hot partition adalah masalah arsitektur data, bukan masalah kapasitas. Sharding key yang salah akan menjatuhkan database dengan traffic yang tidak proporsional.
3. Migrasi tanpa downtime butuh service layer di tengah: request coalescing mengurangi beban, consistent hashing mengurangi disruption.
4. Mengganti 177 node dengan 72 node berarti biaya storage turun drastis juga, bukan cuma performa.`,
    tags: "discord,cassandra,scylladb,hot-partition,sharding,migration,latency",
    source: "https://discord.com/blog/how-discord-stores-trillions-of-messages (2023) + InfoQ summary",
  },
  {
    role: "backend-engineer",
    category: "architecture",
    difficulty: "medium",
    question:
      "Shopify punya monolith Ruby on Rails 2.8 juta baris dan 500.000 commit. Mereka memilih modular monolith, bukan microservices, dan memakai Packwerk untuk menegakkan boundary. Jelaskan logika di balik pilihan ini, dan apa sebenarnya yang ditegakkan Packwerk.",
    answer: `Kasus nyata: **Shopify modular monolith**. Core monolith punya lebih dari **2.8 juta baris kode Ruby** dan **500.000 commit**, dikerjakan lebih dari seribu developer selama lebih dari decade.

### Rumus (yang sebenarnya dipakai Shopify)

Packwerk menjalankan boundary check pada setiap CI run:

 violations = jumlah referensi dari package A ke package B
             di mana B tidak ada di A.allowed_dependencies

CI lulus hanya jika violations == 0 untuk package yang di-flag strict.

### Intuisi

**Kenapa bukan microservices:**

1. **Semua yang mereka sukai dari monolith adalah hasil dari kode yang hidup dan di-deploy di SATU tempat.** Satu test pipeline, satu deploy pipeline, semua data tersedia tanpa transfer antar service. Microservices menghapus semua keunggulan itu dan menambah complexity dari network boundary.
2. **Masalah mereka adalah "kurang ada boundary", bukan "terlalu banyak boundary".** Microservices menambah deployment unit, sedangkan masalah Shopify adalah dependency lintas component yang tidak didefinisikan. Modular monolith menyerang masalah yang tepat.
3. **"Design payoff line".** Shopify punya konsep yang mereka sebut design payoff line: titik di mana desain arsitektur tidak lagi menghambat feature development. Crossing garis itu adalah sinyal bahwa arsitektur perlu berubah. Sebelum itu, monolith adalah pilihan yang benar.

**Kenapa Packwerk:**

1. **Folder alone tidak cukup.** Componentization (membagi kode ke folder per domain: Delivery, Online Store, Checkouts) adalah langkah pertama, tapi developer masih bisa cross-reference Active Record models dan services antar folder.
2. **Packwerk membuat boundary dapat ditegakkan di CI.** Setiap violation yang belum di-allow akan menggagalkan build. Ini mengubah boundary dari "dokumentasi yang baik disengaja" menjadi "aturan yang dipaksakan".
3. **Jujur soal kelemahannya.** Shopify sendiri mengakui di retrospectif Packwerk bahwa developer cenderung mengelompokkan kode berdasarkan petunjuk semantik yang tidak selalu mencerminkan cara kode benar-benar berjalan. Dan Packwerk tidak bisa melihat dependency yang tidak direferensikan lewat constant (misalnya routes, fixtures, initializers). Mereka juga sempat membahas menghapus Packwerk dari monolith.

### Kode

\`\`\`typescript
type Package = {
  name: string;
  allowed: string[];   // package lain yang boleh diakses
};

const monorepo: Record<string, Package> = {
  "orders":   { name: "orders",   allowed: ["platform"] },
  "checkout": { name: "checkout", allowed: ["orders", "platform"] },
  "delivery": { name: "delivery", allowed: ["platform"] },
  "platform": { name: "platform", allowed: [] },  // base, tidak boleh depend ke siapa pun
};

type Violation = { from: string; to: string };

/** Deteksi boundary violation: A mengakses B tanpa B ada di A.allowed. */
function cekBoundary(paket: string, referensi: string[]): Violation[] {
  const pkg = monorepo[paket];
  if (!pkg) throw new Error(\`package \${paket} tidak dikenal\`);
  return referensi
    .filter((r) => r !== paket && !pkg.allowed.includes(r))
    .map((to) => ({ from: paket, to }));
}

// orders trying to reach delivery: violation (tidak di allowed).
console.log("orders -> [checkout, delivery]:", cekBoundary("orders", ["checkout", "delivery"]));

// checkout accessing orders: OK.
console.log("checkout -> [orders]:", cekBoundary("checkout", ["orders"]));

// platform tidak boleh depend ke siapa pun.
console.log("platform -> [orders]:", cekBoundary("platform", ["orders"]));

// Guard CI: setiap violation yang tidak di-allow menggagalkan build.
function cekSemua(): Violation[] {
  return [
    ...cekBoundary("orders", ["checkout", "delivery"]),
    ...cekBoundary("checkout", ["orders"]),
    ...cekBoundary("delivery", ["orders"]),
  ];
}
console.log(\`\\ntotal violation:\`);
for (const v of cekSemua()) console.log(\`  \${v.from} -> \${v.to}\`);

// Fix-nya bukan menghapus panggilan, tapi MENDECLARASIKAN dependency yang
// memang sah: orders memang memakai model dan service dari checkout dan delivery.
monorepo["delivery"].allowed = ["orders", "platform"];
monorepo["orders"].allowed = ["checkout", "delivery", "platform"];

const setelahDiperbaiki = cekSemua();
console.log(\`\\nsetelah 'orders' diizinkan oleh checkout dan delivery:\`);
for (const v of setelahDiperbaiki) console.log(\`  \${v.from} -> \${v.to}\`);
console.log(\`CI lulus: \${setelahDiperbaiki.length === 0}\`);
\`\`\`

### Takeaway

1. Microservices bukan jawaban default. Kalau masalahnya kurang ada boundary, modular monolith dengan boundary yang ditegakkan CI adalah langkah yang benar.
2. Boundary hanya berguna kalau dipaksakan. Packwerk mengubah boundary dari konvensi menjadi aturan yang menggagalkan build.
3. Tahu kapan architecture perlu berubah: crossing design payoff line, bukan mengikuti tren.
4. Tools boundary enforcement punya blind spot. Packwerk tidak bisa melihat dependency lewat routes, fixtures, atau initializers.`,
    tags: "shopify,monolith,modular-monolith,packwerk,architecture,microcervices,boundaries",
    source:
      "https://shopify.engineering/enforcing-modularity-rails-apps-packwerk + https://shopify.engineering/shopify-monolith (Under Deconstruction, 2020) + A Packwerk Retrospective (2024)",
  },

  // ================= MLOPS ENGINEER =================
  {
    role: "mlops-engineer",
    category: "mlops",
    difficulty: "hard",
    question:
"Netflix membangun Metaflow untuk menaikkan produktivitas data scientist, bukan untuk abstraksi infrastruktur yang lebih pintar. Jelaskan desain yang mereka pilih (DAG of steps, artifact store) dan kenapa itu MEMBANTU produktivitas, bukan menghambatnya.",
    answer: `Kasus nyata: **Metaflow**, Originally developed at Netflix, open source 2019. Di Netflix saja, Metaflow mendukung lebih dari **3.000 proyek AI/ML**, mengeksekusi ratusan juta high-performance compute job, dan mengelola puluhan petabyte model dan artifact. Dipakai juga oleh Amazon, DoorDash, Goldman Sachs, dan banyak perusahaan lain.

### Rumus / konsep

Workflow sebagai Directed Acyclic Graph:

step_i Depends on step_{j<i}

Artifact versioning dengan content-addressed store:

artifact_id = hash(content)

Untuk setiap step: (code, dependencies, artifact_id) -> artifact baru

### Intuisi

1. **Arsitektur satu proses, banyak bentuk.** Metaflow sengaja dibuat "deceptively simple". Code Python biasa yang biasa, dijalankan di lokal atau di cluster. Tidak ada DSL yang harus dipelajari, tidak ada API khusus.
2. **Data dan model = variabel Python biasa.** Ini keputusan desain kunci. Karena data dan model disimpan sebagai instance variable biasa, kode yang sama bekerja di laptop dan di cluster terdistribusi tanpa perubahan. Framework lain memaksamu memutuskan mana yang di-persist dan mana yang tidak -- Metaflow menghilangkan keputusan itu.
3. **Content-addressed artifact store.** Tiap artifact diberi ID berdasarkan hash content-nya. Ini memberi dua hal gratis: versioning otomatis (ID sama = content sama) dan reproducibility (tiga bulan lalu, artifact itu masih bisa diambil).
4. **Collision resolution untuk tim besar.** Netflix dealing dengan ratusan data scientist yang bisa commit ke repo yang sama. Metaflow punya mekanisme untuk menangani tabrakan nama run dan step.
5. **Apa yang Metaflow SENGAJA tidak lakukan.** Tidak butuh kamu belajar tentang setup infrastructure, memilih compute engine, atau configure distributed execution. Abstraction tersebut disengaja: focus-nya adalah "data scientist productivity", bukan "pipeline orchestration power".

### Kode

\`\`\`python
from dataclasses import dataclass, field
import hashlib

@dataclass
class Step:
    name: str
    code: str
    artifact_id: str = ""     # content-addressed

@dataclass
class MetaflowRun:
    name: str
    steps: dict = field(default_factory=dict)

    def _step(self, name, code, fn):
        # Versi: jalankan kode, hasil di-hash untuk jadi artifact ID.
        hasil = fn()
        artifact_id = hashlib.sha256(str(hasil).encode()).hexdigest()[:12]
        self.steps[name] = Step(name, code, artifact_id)
        return hasil

    def start(self, name):
        self.name = name
        return self

    def step(self, nama, kode, fn):
        """Jalankan satu step dan simpan hasilnya sebagai artifact."""
        return self._step(nama, kode, fn)


# Workflow: DAG of steps, masing-masing artifact-nya di-versioning.
# Step dijalankan lewat method call, bukan decorator: decorator akan
# memanggil factory-nya dan membuang lambda yang dikembalikan.
def load_fn():
    return [("u1", "churn"), ("u2", "stay"), ("u3", "churn")]

def train_gbdt():
    return {"model": "gradient_boost", "auc": 0.91}

def evaluate_fn():
    return {"precision": 0.62, "recall": 0.58}

run = MetaflowRun("churn-v3").start("churn-v3")
run.step("load", "load", load_fn)
run.step("train", "train", train_gbdt)
run.step("evaluate", "evaluate", evaluate_fn)

print("steps dalam workflow:")
for st in run.steps.values():
    print(f"  {st.name:<10} artifact_id={st.artifact_id}")

# Content-addressed: input sama -> artifact_id sama.
run2 = MetaflowRun("churn-v3-copy").start("copy")
run2.step("load", "load", load_fn)
print(f"\\nload identik menghasilkan artifact_id identik: "
      f"{run2.steps['load'].artifact_id == run.steps['load'].artifact_id}")

# Versioning: mengubah kode menghasilkan artifact_id berbeda.
run3 = MetaflowRun("churn-v4").start("v4")
run3.step("train", "train", lambda: {"model": "neural", "auc": 0.93})
print(f"train dengan model berbeda -> artifact_id berbeda: "
      f"{run3.steps['train'].artifact_id != run.steps['train'].artifact_id}")

assert run.steps["train"].artifact_id != run3.steps["train"].artifact_id
assert run2.steps["load"].artifact_id == run.steps["load"].artifact_id
print("checks OK")
\`\`\`

### Takeaway

1. Tool MLOps yang sukses sering bertindak dengan MENGURANGKAN kompleksitas, bukan menambahnya. Metaflow berhasil karena tidak minta kamu belajar konsep baru.
2. Content-addressed artifact store memberi versioning dan reproducibility tanpa perlu konfigurasi eksplisit.
3. "Framework yang lembut" (menggunakan bahasa yang sudah kamu pakai) lebih adopsi daripada framework yang powerfull tapi perlu belajar DSL.
4. Angka adopsi itu sendiri metrik: kalau tool kamu cuma dipakai 2 orang dari 100 data scientist, tool itu gagal.`,
    tags: "netflix,metaflow,mlops,workflow,dag,reproducibility,artifact-store,productivity",
    source:
      "https://arxiv.org/pdf/2303.11761 (Reasonable Scale Machine Learning with Open-Source Metaflow, 2023) + github.com/Netflix/metaflow",
  },
  {
    role: "mlops-engineer",
    category: "feature-store",
    difficulty: "hard",
    question:
"Train-serving skew adalah salah satu penyebab paling umum model gagal di produksi. Jelaskan apa itu, kenapa Chronon (Airbnb) menyebut point-in-time correctness sebagai solusi, dan bagaimana batch versus streaming features menyelesaikan masalah ini.",
    answer: `Kasus nyata: **Chronon** (Airbnb, open source 2024), kini dipakai juga di Stripe dan perusahaan lain. Survei internal Airbnb yang dikutip di presentasi mereka menunjukkan **80% waktu ML engineer habis untuk feature engineering dan data pipeline**, bukan untuk modeling itu sendiri.

### Rumus (konsep point-in-time correctness)

Untuk setiap training sample pada waktu t, fitur harus dihitung dari state **pada waktu t**:

fitur(t) = agregasi(event untuk t <= t, bukan event untuk t > t)

Kalau fitur dihitung dari data "sekarang" (time of extraction) lalu dipakai untuk training pada waktu t, kamu menyuntikkan informasi dari masa depan -- data leakage.

### Intuisi

1. **Apa itu train-serving skew.** Training: fitur dihitung dari batch warehouse (T+1, semua data terkumpul). Serving: fitur dihitung dari streaming atau request context (real-time). Kalau logika atau definisi fitur berbeda di kedua jalur, model belajar pola dari training yang TIDAK ADA di serving. Contoh klasik: fitur "total order user 30 hari" di training pakai data sampai hari H, di serving pakai data sampai hari H-1. Selisih satu hari ini bisa jadi racun.

2. **Kenapa data leakage berbahaya.** Model dengan data leakage akan punya metrik evaluasi yang sangat bagus (AUC 0.95) tapi gagal di produksi. Karena waktu yang "melihat masa depan", validation split-nya jadi tercemar. Di produksi tidak ada masa depan untuk dilihat, jadi model drop. Ini yang membuat MLOpsrecation menghasilkan model yang lolos semua gate tapi tidak pernah dipakai user.

3. **Point-in-time correctness (Chronon).** Untuk setiap row di training set, fitur dihitung dari state pada waktu row itu dibuat, bukan dari state sekarang. Aggregation algorithm bisa se-shared antara online dan offline. Hasilnya: fitur training dan fitur serving dijamin identik secara definisi.

4. **Batch vs streaming features.** Chronon membagi fitur dalam dua:
   - **Batch features**: dihitung daily (snapshot). Contoh: total order 30 hari terakhir per user. Cukup untuk training, dan untuk serving dengan latency yang tidak terlalu ketat.
   - **Streaming features**: dihitung real-time DAN bisa di-backfill secara temporal. Contoh: jumlah click dalam 5 menit terakhir.

   Keduanya bisa diproses offline (untuk training, dengan point-in-time correctness) dan online (untuk serving, dengan latency rendah). API-nya sama: definisikan sekali, pakai dua jalur.

5. **Apa yang Chronon BENDAHARA.** Ganti batch dengan streaming untuk semua fitur? Tidak: fitur batch (seperti total order 30 hari) lebih murah dan cukup accurate. Feature platform yang memaksa real-time untuk semuanya akan mahal tanpa benefit.

### Kode

\`\`\`python
from dataclasses import dataclass
from datetime import date, timedelta

@dataclass
class Event:
    user: str
    tanggal: date
    tipe: str        # "order" atau "click"


def fitur_batch(events, user, sampai_tanggal, window_hari=30):
    """Batch feature: agregasi events dalam window SEBELUM sampai_tanggal.
    dipakai untuk training dengan point-in-time correctness."""
    awal = sampai_tanggal - timedelta(days=window_hari)
    return sum(
        1 for e in events
        if e.user == user and awal <= e.tanggal < sampai_tanggal and e.tipe == "order"
    )


def fitur_leaky(events, user, window_hari=30):
    """Bocor: agregasi semua event yang tersedia HARI INI.
    dipakai kalau kamu tidak sadar soal point-in-time correctness."""
    return sum(1 for e in events if e.user == user and e.tipe == "order")


events = [
    Event("u1", date(2024, 1, 1),  "order"),   # sebelum
    Event("u1", date(2024, 1, 15), "order"),   # sebelum
    Event("u1", date(2024, 2, 20), "order"),   # SESUDAH -> tidak boleh dihitung
    Event("u1", date(2024, 2, 25), "click"),    # SESUDAH -> tidak boleh dihitung
]

# Training sample untuk u1 pada tanggal 2024-02-01.
t_sample = date(2024, 2, 1)

benar = fitur_batch(events, "u1", t_sample, window_hari=365)  # 2 (hanya yang <= 2024-02-01)
leak = fitur_leaky(events, "u1")  # 3 (menghitung yang setelah t_sample juga)

print(f"fitur BATCH (point-in-time) pada t_sample = {benar}  <- benar")
print(f"fitur LEAKY (semua data)          = {leak}  <- salah, ada info masa depan")
print(f"\\ninflasi fitur karena leak: {leak - benar} ({(leak - benar) / benar * 100:.0f}%)")

# Demonstrasi: batch feature SAMA untuk semua sample dari user yang sama
# (karena sama-sama memakai state pada t_sample), streaming bisa berbeda per waktu.
print("\\nbatch feature untuk u1 pada beberapa t_sample:")
for d in [date(2024, 1, 20), date(2024, 2, 1), date(2024, 3, 1)]:
    print(f"  t={d}: order_count = {fitur_batch(events, 'u1', d, window_hari=365)}")

assert benar == 2 and leak == 3 and leak > benar
print("\\nchecks OK")
\`\`\`

### Takeaway

1. Train-serving skew adalah salah satu penyebab paling umum modelMlOps gagal produksi. Root cause-nya biasanya fitur yang dihitung beda antara training dan serving.
2. Point-in-time correctness: untuk setiap training sample, fitur harus dari state pada waktu sample itu, bukan dari "sekarang".
3. Definikan fitur SEKALI untuk batch dan streaming, supaya definisi tidak bisa berbeda antara training dan serving.
4. Jangan buat semua fitur streaming. Fitur batch lebih murah dan sering cukup accurate.`,
    tags: "airbnb,chronon,feature-store,point-in-time,train-serving-skew,data-leakage,mlops",
    source:
      "https://chronon.ai/ + https://github.com/airbnb/chronon + InfoQ (2024) — 'Airbnb Open-Sources its ML Feature Platform Chronon'",
  },

  // ================= AI PRODUCT MANAGER =================
  {
    role: "ai-product-manager",
    category: "experimentation",
    difficulty: "hard",
    question:
      "Di marketplace (seperti DoorDash), A/B test per-user tidak valid karena treatment dan control berbagi supply yang sama (jumlah driver). Jelaskan switchback testing dan kenapa power-nya rendah dibanding A/B test biasa.",
    answer: `Kasus nyata: **DoorDash Switchback Testing** (engineering blog 2018). DoorDash adalah marketplace tiga sisi: Consumer, Dasher, dan Merchant. Dispatch mereka mengatur ribuan fitur secara real-time untuk menghasilkan lebih dari 30 juta pasangan match per menit.

### Rumus

Unit analisis harus SAMA dengan unit randomisasi. Switchback randomize pada time-region unit, bukan per-order:

unit = (region, time_window)
treatment( unit ) ~ Bernoulli( 0.5 )

Contoh switching DoorDash: setiap 30 menit berganti antara SOS pricing dan bukan-SOS pricing.

### Intuisi

1. **Kenapa A/B test per-order tidak valid.** Kalau treatment order dan control order datang di daerah yang sama pada waktu yang sama, keduanya berebut atas **fleet Dasher yang sama**. Kalau treatment membuat lebih banyak order, supply untuk control berkurang. Observasi tidak independen. Efeknya: standard error dihitung terlalu kecil, dan kamu bisa salah menyimpulkan treatment menang padahal sebenarnya ada lebih sedikit Dasher untuk semua orang.

2. **Switchback membagi pada waktu-wilayah.** Alih-alih membagi order, kamu membagi **wilayah dan window waktu**. Semua order di satu window dalam satu wilayah dapat treatment atau control yang sama. Ini memutus competition langsung antar order.

3. **Tapi power-nya rendah.** Ini trade-off yang harus diterima. Karena unit yang dianalisis jauh lebih sedikit (jumlah window-wilayah, bukan jumlah order), power turun drastis. Efek nyata bisa terlihat "tidak ada efek" (type II error, false negative). DoorDash secara eksplisit mengakui ini.

4. **Trik DoorDash: experiment parallel untuk menaikkan power.** Karena power switchback rendah, mereka kadang menjalankan dua experiment sekaligus: satu switchback di wilayah tertentu, satu Dasher-level A/B di wilayah lain. Ini memungkinkan power tinggi dan tetap mengurangi network effects.

g effects**, dan **power**. Tidak ada desain yang bisa memenuhi ketiganya sekaligus. Design payoff: pilih dua, korbankan satu.

6. **RANDOMIZATION UNIT harus sama dengan ANALYSIS UNIT.** Ini aturan fundamental. Kalau kamu randomize per-order tapi analisis per-region, atau sebaliknya, standard error-nya salah. DoorDash mengolah switchback dengan menganalisis time-region unit yang sama dengan yang dirandomisasi.

### Kode

\`\`\`python
import numpy as np

rng = np.random.default_rng(11)
BASE = 120.0          # GMV per order


def buat_units(n_order=40, n_window=12, efek=0.30, korelasi=0.30):
    """Satu kota, window 30 menit, treatment/control bergantian.
    korelasi = sebagian variance datang dari guncangan yang SAMA antar
    order dalam satu window (mereka berbagi supply)."""
    units = []
    for w in range(n_window):
        treat = w % 2
        shared = rng.normal(0.0, korelasi)
        uplift = efek if treat else 0.0
        for _ in range(n_order):
            idio = rng.normal(0.0, np.sqrt(1 - korelasi ** 2))
            units.append({"unit": w, "treat": treat,
                          "gmv": BASE * (1 + uplift + shared + idio)})
    return units


def analisis_cluster(units):
    """BENAR: rata-ratakan per unit dulu, lalu bandingkan. SE dari variasi
    antar-unit -- ini yang menyerap korelasi antar-order dalam satu unit."""
    per = {}
    for u in units:
        per.setdefault(u["unit"], []).append(u)
    t = [np.mean([x["gmv"] for x in v]) for v in per.values() if v[0]["treat"] == 1]
    c = [np.mean([x["gmv"] for x in v]) for v in per.values() if v[0]["treat"] == 0]
    return float(np.mean(t) - np.mean(c)), float(np.sqrt(
        np.var(t, ddof=1) / len(t) + np.var(c, ddof=1) / len(c)))


def analisis_order_level(units):
    """SALAH: tiap order dianggap independen -> SE terlalu kecil -> z kepanjangan."""
    t = [u["gmv"] for u in units if u["treat"] == 1]
    c = [u["gmv"] for u in units if u["treat"] == 0]
    return float(np.mean(t) - np.mean(c)), float(np.sqrt(
        np.var(t, ddof=1) / len(t) + np.var(c, ddof=1) / len(c)))


u = buat_units()
e_benar, se_benar = analisis_cluster(u)
e_salah, se_salah = analisis_order_level(u)

print(f"{'metode':<24}{'estimasi':>10}{'SE':>8}{'z':>7}")
print(f"{'cluster (benar)':<24}{e_benar:>10.2f}{se_benar:>8.2f}{e_benar/se_benar:>7.2f}")
print(f"{'order-level (salah)':<24}{e_salah:>10.2f}{se_salah:>8.2f}{e_salah/se_salah:>7.2f}")
print(f"\\nSE order-level under-estimate {(1 - se_salah/se_benar)*100:.0f}% -> z kepanjangan")

# False positive rate saat tidak ada efek.
n_s, n_b = 0, 0
for _ in range(400):
    uu = buat_units(efek=0.0)
    e1, s1 = analisis_order_level(uu)
    e2, s2 = analisis_cluster(uu)
    n_s += abs(e1/s1) > 1.96
    n_b += abs(e2/s2) > 1.96
print(f"\\nFPR saat efek nol: order-level {n_s/400*100:.0f}%  cluster {n_b/400*100:.0f}%")

# Power vs jumlah window.
print(f"\\npower vs n_window (efek 30%):")
for nw in [4, 12, 20, 40]:
    hit = 0
    for _ in range(200):
        e, se = analisis_cluster(buat_units(n_window=nw))
        hit += abs(e / se) > 1.96
    print(f"  n_window={nw:>3}: power ~{hit / 200 * 100:.0f}%")

assert se_salah < se_benar
print("\\nchecks OK")
\`\`\`

### Takeaway

1. Di marketplace, observasi TIDAK independen. A/B test per-user bisa salah karena treatment dan control berbagi supply.
2. Switchback randomize pada unit waktu-wilayah, dan WAJIB menganalisis unit yang sama.
3. Power switchback rendah. Trade-off yang harus diterima, bukan diabaikan.
4. Randomization unit = analysis unit. Kalau tidak sama, standard error salah.
rangi interference, tangkap learning effect, dan pertahankan power. Tidak bisa semua.`,
    tags: "doordash,switchback,a-b-test,marketplace,network-effects,power,experimentation",
    source:
      "https://careersatdoordash.com/blog/switchback-tests-and-randomized-experimentation-under-network-effects-at-doordash (2018) + Balancing Network Effects, Learning Effects, and Power (2025)",
  },
  {
    role: "ai-product-manager",
    category: "ranking",
    difficulty: "hard",
    question:
      "DoorDash mengukur bahwa interleaving experiment punya sensitivity gain 100x-500x dibanding A/B test untuk ranking experiments. Jelaskan apa itu interleaving, kenapa sensitivity-nya jauh lebih tinggi, dan batasan fundamentalnya.",
answer: `Kasus nyata: **DoorDash interleaving designs** (engineering blog 2024). DoorDash mengukur dan mempublikasikan sensitivity gain yang mereka klaim: **~100x sampai 500x** dibanding vanilla A/B test untuk ranking experiments.

### Rumus

Credit dihitung per pasangan item yang berdekatan dalam satu result list:

 credit(a) = # { pasangan (i, i+1) di mana a berada pada posisi lebih tinggi }

Di bawah H0 (tidak ada perbedaan ranker), tiap arm mendapat credit(expected) = total/2,
sehingga test statistic-nya:

 z = ( credit(a) - total/2 ) / sqrt( total / 4 )


**A/B test**: traffic dipecah dua, masing-masing melihat satu ranker. Bandingkan conversion rate.

**Interleaving**: user melihat DUA ranker sekaligus di satu result list. Item di-interleave bergantian:

Posisi 1: Ranker A     Posisi 4: Ranker B
Posisi 2: Ranker B     Posisi 5: Ranker A
Posisi 3: Ranker A     Posisi 6: Ranker B

Credit: untuk setiap pasangan item, arm yang muncul lebih tinggi dapat satu credit.

### Intuisi

1. **Kenapa sensitivity jauh lebih tinggi.** Di A/B test, perbedaan antara dua ranker hanya terlihat dari conversion rate agregat, dan itu butuh banyak sample untuk terdeteksi. Di interleaving, setiap user sees KEDUA ranker, jadi perbandingan terjadi **head-to-head pada item yang sama, di setiap session**._noise dari "user mana yang kebetulan dapat produk bagus" dihilangkan. Efek bersihnya jadi lebih jelas dengan sample yang jauh lebih kecil.

2. **Sensitivity yang dipublikasikan DoorDash (dari blog mereka):**
   - Netflix: ~100x
   - Airbnb: ~50x sampai ~100x
   - Thumbtack: ~100x
   - Amazon: ~60x
   - Wikimedia: ~10x sampai ~100x
   - Etsy: ~10x sampai ~50x
   - DoorDash: ~100x sampai ~500x

3. **Kenapa DoorDash bisa jauh di atas rata-rata industri.** Observasi mereka: banyak user action terlihat "tidak tertarik atau tidak membuat pilihan". FACTOR "dilution": item yang di-expose tapi tidak dipilih (karena user tidak melihat, atau tidak tertarik) mengenceri credit. DoorDash menghapus dilution, dan gain naik dari rata-rata ~67x menjadi ~384x.

4. **Batasan FUNDAMENTAL.** Interleaving hanya mengukur **immediate relevance**. Tidak bisa mengukur:
   - Long-term retention
   - LTV
   - Efek samping (misal: ranker A menghasilkan order lebih banyak tapi dengan nilai lebih kecil)

   Untuk full-funnel atau long-term, A/B test tetap gold standard.

5. **Rekomendasi DoorDash: gunakan interleaving sebagai filter, A/B sebagai konfirmasi.** Iterate di interleaving setup sampai improvement terakumulasi cukup, baru pindahkan ranker ke A/B test. Ini membiarkan tim menguji banyak variasi dengan sample kecil, dan hanya mengkonfirmasi winner yang serious.

6. **Multi-objective: jangan samakan conversion dengan GOV.** Ranker yang menghasilkan lebih banyak order tapi nilainya lebih kecil, atau sebaliknya. DoorDash merekomendasikan encoding trade-off ini secara eksplisit, jadi optimasi tidak berkonsentrasi pada satu metrik.

### Kode

\`\`\`python
import numpy as np

def interleaving_credit(ranked_sessions, n_arms=2):
    """Credit: untuk setiap pasangan item berurutan, arm yang lebih tinggi dapat credit."""
    credit = np.zeros(n_arms)
    for ranking in ranked_sessions:
        for i in range(0, len(ranking) - 1, 2):
            a, b = ranking[i], ranking[i + 1]
            if a != b:
                credit[a] += 1
    return credit


# Simulasikan: ranker 1 sedikit lebih baik, tapi hanya pada sebagian item.
rng = np.random.default_rng(3)
def simulasi(n_sessions=1000, n_items=6, prob_bbetter=0.56):
    sessions = []
    for _ in range(n_sessions):
        ranking = [0, 1] * (n_items // 2)
        for i in range(0, n_items - 1, 2):
            if rng.random() < prob_bbetter:
                ranking[i], ranking[i + 1] = 1, 0  # ranker 1 lebih tinggi
        sessions.append(ranking)
    return sessions

# Case 1: ranker komparabel (prob 0.5 -> tidak ada perbedaan nyata).
s = simulasi(prob_bbetter=0.50)
c = interleaving_credit(s)
print(f"komparabel   : credit={c}  winner={int(np.argmax(c))}  (selisih kecil, sesuai harapan)")

# Case 2: ranker 1 sedikit lebih baik (prob 0.56).
s = simulasi(prob_bbetter=0.56)
c = interleaving_credit(s)
total = c.sum()
print(f"perbedaan tipis: credit={c}  winner={int(np.argmax(c))}  "
      f"selisih={c.max()-c.min():.0f}/{total:.0f}")

# Variasinya: dengan 1000 session, perbedaan tipis sudah terlihat jelas.
# Inilah sensitivity gain: sample kecil sudah cukup untuk membedakan efek tipis.

# Credit belum tentu berarti "menang" -- harus cek signifikansi.
def proporsi_kemenangan(ranked_sessions, n_arms=2):
    c = interleaving_credit(ranked_sessions, n_arms)
    return c / c.sum()

p = proporsi_kemenangan(s)
print(f"\\nproporsi credit: ranker 1 = {p[1]:.3f}, ranker 0 = {p[0]:.3f}")

# Batasan: interleaving hanya ukur immediate relevance, bukan LTV/retention.
# Untuk itu tetap A/B test dengan durasi panjang.

assert interleaving_credit([[0, 1, 0, 1]])[0] == 2
assert interleaving_credit([[1, 0, 1, 0]])[1] == 2
print("checks OK")
\`\`\`

### Takeaway

1. Interleaving membandingkan head-to-head pada item yang sama, di setiap session. Noise dari variability user hilang, sensitivity naik drastis (100x-500x).
2. DoorDash publish sensitivity gain mereka di atas rata-rata industri karena menghapus "dilution" (item yang di-expose tapi tidak dipilih).
3. Interleaving hanya ukur immediate relevance. Untuk long-term, LTV, retention, A/B test tetap gold standard.
4. Rekomendasi: iterate cepat di interleaving, konfirmasi winner di A/B.
5. Selalu encode multi-objective (conversion vs GOV) secara eksplisit, jangan optimise satu metrik saja.`,
    tags: "doordash,interleaving,ranking,a-b-test,sensitivity,experiment-design",
    source:
      "https://careersatdoordash.com/blog/doordash-experimentation-with-interleaving-designs (2024)",
  },

  // ================= FRONTEND / FULLSTACK =================
  {
    role: "frontend-fullstack-engineer",
    category: "performance",
    difficulty: "medium",
    question:
"Netflix menghapus React dari client-side untuk logged-out homepage dan Time-to-Interactive turun 50% lebih. Jelaskan logika di balik keputusan yang kontroversial ini, dan kenapa ini bukan berarti React itu buruk.",
    answer: `Kasus nyata: **Netflix, removing client-side React** (2017, ditemukan kembali dan dipopulerkan ulang lewat presentasi Addy Osmani 2018). Angka yang dipublikasikan: **Time-to-Interactive turun lebih dari 50%**, bundle JavaScript berkurang **200kB**.

### Rumus (yang sebenarnya diukur)

TFI dipengaruhi oleh dua hal:

 TTI = max(network load, JS parse/execute, hydration)

JS payload = initial JS + hydration code + context data

Network throttling test: 3G, ~400kbps
Bundle awal: ~300kB (termasuk React ~45kB + library + context data)

### Intuisi

1. **Apa yang sebenarnya dilakukan Netflix.** Mereka TIDAK menghapus React dari server. Mereka continued render markup server-side pakai React, lalu menghapus React dari client. Client hanya butuh sedikit vanilla JS untuk interaksi (tabs, language switcher, cookie banner). Full React bundle baru di-prefetch via XHR untuk halaman signup berikutnya.

2. **Mengapa ini masuk akal secara teknis.**
   - Hydrasi React punya biaya: parse ~45kB library, jalankan, lalu reconcile dengan DOM yang sudah ada.
   - Untuk logged-out landing page, interaksinya sedikit: tabs, language switcher, cookie banner.
   - Justru untuk halaman dengan sedikit interaksi, React adalah overkill. Vanilla JS untuk hal sederhana = less code, less parse, less execute.

3. **Kenapa ini TIDAK berarti React buruk.**
- Ini keputusan KONTEKSTUAL, bukan penilaian terhadap React secara umum.
   - Setelah landing page, halaman signup (yang butuh full interaksi) tetap pakai React, di-prefetch.
   - Netflix di 2015 (post "Netflix Likes React") justru embracing React untuk member experience.
   - Netflix di 2017 hanya menghapus dari SATU halaman: logged-out homepage. Itu keputusan yang|Kubernetes: satu halaman dengan interaksi rendah.

4. **Trade-off yang harus dipertimbangkan.**
   - Bundle lebih kecil, TTI lebih cepat (bagus untuk logged-out, conversion-critical page).
   - Tapi: kode jadi lebih uncampuran. Kamu butuh cara yang jelas kapan pakai React vs tidak.
   - Kalau halaman berikutnya butuh React, kamu pre-bundle dan pre-fetch, tapi itu tambah kompleksitas.

5. **Pelajaran yang lebih luas dari Netflix.** Setiap byte JS yang dikirim ke browser punya biaya: download (bandwidth), parse (CPU), execute (CPU), dan bisa delayed oleh network. Untuk halaman yang sebagian besar kontennya read-only, shipping framework yang besar mungkin tidak sepadan. Untuk halaman dengan interaksi stateful yang banyak, framework seperti React sepadan.

### Kode

\`\`\`typescript
// Simulasi: TTI untuk logged-out homepage dengan/without React di client.

function hitungTTI(
  jsPayloadKB: number,
  parseRateKBps: number = 1000,   // browser bisa parse ~1000 KB/s
  networkKbps: number = 400        // 3G throttling
): { downloadMs: number; parseMs: number; ttiMs: number } {
  const downloadMs = (jsPayloadKB * 8) / networkKbps * 1000;
  const parseMs = (jsPayloadKB / parseRateKBps) * 1000;
  return { downloadMs, parseMs, ttiMs: Math.max(downloadMs, parseMs) };
}

// Kasus: logged-out homepage.
const denganReact = hitungTTI(300);   // 300 KB bundle (React + lib + context data)
const tanpaReact = hitungTTI(100);    // 100 KB (vanilla JS saja)

console.log("dengan React :");
console.log(\`  download: \${Math.round(denganReact.downloadMs)}ms  parse: \${Math.round(denganReact.parseMs)}ms\`);
console.log(\`  TTI: \${Math.round(denganReact.ttiMs)}ms\`);
console.log("\\ntanpa React :");
console.log(\`  download: \${Math.round(tanpaReact.downloadMs)}ms  parse: \${Math.round(tanpaReact.parseMs)}ms\`);
console.log(\`  TTI: \${Math.round(tanpaReact.ttiMs)}ms\`);

const hemat = (1 - tanpaReact.ttiMs / denganReact.ttiMs) * 100;
// Angka di sini hasil simulasi dengan parameter asumsi (bundle 300 KB -> 100 KB,
// 3G 400 kbps, parse 1000 KB/s), BUKAN angka yang Netflix laporkan.
// Yang dipublikasikan Netflix: TTI turun lebih dari 50%, bundle berkurang 200kB.
console.log(\`\\npenghematan TTI (simulasi): \${hemat.toFixed(0)}%\`);

// Hydrasi: React harus reconcile DOM yang sudah di-render.
function simulasiHydrasi(nodeCount: number): { tanpaHydrasiMs: number; denganHydrasiMs: number } {
  const tanpaHydrasiMs = 0;            // sudah ada HTML dari server
  const denganHydrasiMs = nodeCount * 0.05;  // ~0.05ms per node
  return { tanpaHydrasiMs, denganHydrasiMs };
}

const h = simulasiHydrasi(2000);  // 2000 node DOM
console.log(\`\\nhydrasi 2000 node: \${h.denganHydrasiMs.toFixed(0)}ms\`);

// Trade-off: TTI lebih cepat tapi complexity naik (harus pre-fetch React untuk signup).
// Untuk halaman signup (interaksi tinggi), React masih sepadan.

console.log("\\nkesimpulan:");
console.log("  - logged-out homepage: sedikit interaksi -> vanilla JS cukup");
console.log("  - signup page: banyak interaksi -> React worth it");

const lebihCepat = tanpaReact.ttiMs < denganReact.ttiMs;
console.log(\`TTI tanpa React lebih cepat: \${lebihCepat}\`);
console.log("\\nchecks OK");
\`\`\`

### Takeaway

1. Setiap KB JS yang dikirim punya biaya (download + parse + execute). Untuk halaman read-only, framework besar mungkin tidak sepadan.
2. Menghapus React dari client BUKAN menghapus React dari aplikasi: SSR tetap pakai React, dan React di-prefetch untuk halaman berikutnya yang butuh.
3. Keputusan ini KONTEKSTUAL. Netflix tetap pakai React untuk member experience yang interaktif. Yang dihapus hanya di satu halaman dengan interaksi rendah.
4. Pertanyaan yang lebih baik dari "React bagus atau tidak": "harga framework ini sepadan dengan interaksi di halaman ini?"`,
    tags: "netflix,react,performance,tti,bundle-size,ssr,frontend,vanilla-js",
    source:
      "https://medium.com/dev-channel/a-netflix-web-performance-case-study-c0bcde26a9d9 (Addy Osmani, 2018) + Netflix UI Engineering presentation (2017)",
  },
];
