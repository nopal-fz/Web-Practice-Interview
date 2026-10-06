import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

type SeedQuestion = {
  role: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  tags: string;
};

const questions: SeedQuestion[] = [
  // ---------------- Data Scientist ----------------
  {
    role: "data-scientist",
    category: "statistics",
    difficulty: "easy",
    question: "Apa perbedaan statistik deskriptif dan inferensial?",
    answer: `Statistik **deskriptif** merangkum data yang kamu punya apa adanya: mean, median, standar deviasi, distribusi, visualisasi. Tidak ada klaim di luar data itu.

Statistik **inferensial** menarik kesimpulan tentang populasi berdasarkan sampel, lengkap dengan ketidakpastiannya: confidence interval, uji hipotesis, regresi.

Contoh: menghitung rata-rata nilai 100 siswa adalah deskriptif. Menyimpulkan rata-rata seluruh siswa sekolah dari 100 sampel itu adalah inferensial.`,
    tags: "statistics,dasar,descriptive,inferential",
  },
  {
    role: "data-scientist",
    category: "statistics",
    difficulty: "easy",
    question: "Apa itu p-value dan bagaimana menginterpretasikannya?",
    answer: `p-value adalah probabilitas melihat hasil yang seekstrem (atau lebih ekstrem dari) data yang diamati, **dengan asumsi hipotesis nol benar**.

Interpretasi yang benar: p-value kecil (mis. 0.03) berarti data yang diamati tidak biasa bila H0 benar, sehingga H0 dipertanyakan. Ini **bukan** probabilitas H0 benar, dan bukan ukuran besar efek.

Untuk mengukur besar efek, pakai effect size (Cohen's d, selisih mean) dan confidence interval.`,
    tags: "statistics,hipotesis,p-value,inference",
  },
  {
    role: "data-scientist",
    category: "statistics",
    difficulty: "medium",
    question: "Jelaskan perbedaan Type I dan Type II error.",
    answer: `| | H0 benar | H0 salah |
|---|---|---|
| Tolak H0 | **Type I error** (false positive) | benar |
| Gagal tolak H0 | benar | **Type II error** (false negative) |

- **Type I (α)**: menolak H0 padahal benar. Mengklaim ada efek padahal tidak.
- **Type II (β)**: gagal mendeteksi efek yang sebenarnya ada. Power = 1 - β.

Keduanya bertrade-off: menurunkan α (mis. dari 0.05 ke 0.01) menaikkan β pada ukuran sampel tetap. Cara menurunkan keduanya sekaligus adalah menambah jumlah sampel.`,
    tags: "statistics,hipotesis,type1,type2,power",
  },
  {
    role: "data-scientist",
    category: "statistics",
    difficulty: "medium",
    question: "Apa itu Central Limit Theorem dan kenapa penting?",
    answer: `CLT: distribusi **mean sampel** mendekati distribusi normal seiring bertambahnya ukuran sampel, terlepas dari bentuk distribusi populasi asalnya (selama mean dan variansnya berhingga).

Penting karena:
1. Dasar dari confidence interval dan uji hipotesis berbasis normal.
2. Membolehkan inference tanpa asumsi normalitas pada data mentah.
3. Aturan praktis: ukuran sampel ≥ 30 sering dianggap cukup, tapi untuk distribusi sangat skewed butuh lebih banyak.

Catatan: CLT tentang distribusi **mean sampel**, bukan distribusi datanya.`,
    tags: "statistics,clt,sampling,inference",
  },
  {
    role: "data-scientist",
    category: "sql",
    difficulty: "medium",
    question: "Tulis query untuk mencari gaji tertinggi kedua dari tabel employees.",
    answer: `Pendekatan dengan \`DISTINCT\` + \`LIMIT/OFFSET\`:

\`\`\`sql
SELECT DISTINCT salary
FROM employees
ORDER BY salary DESC
LIMIT 1 OFFSET 1;
\`\`\`

Dengan window function (lebih aman untuk kasus yang lebih rumit):

\`\`\`sql
SELECT salary
FROM (
  SELECT salary,
         DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employees
) t
WHERE rnk = 2;
\`\`\`

\`DENSE_RANK\` dipakai agar nilai gaji yang sama tidak "memakan" peringkat (berbeda dengan \`ROW_NUMBER\`).`,
    tags: "sql,window-function,ranking,interview",
  },
  {
    role: "data-scientist",
    category: "sql",
    difficulty: "medium",
    question: "Hitung running total penjualan per hari menggunakan window function.",
    answer: `\`\`\`sql
SELECT
  order_date,
  daily_sales,
  SUM(daily_sales) OVER (
    ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total
FROM daily_sales_summary
ORDER BY order_date;
\`\`\`

Poin penting:
- \`ORDER BY\` di dalam \`OVER\` menentukan urutan akumulasi.
- Frame \`UNBOUNDED PRECEDING AND CURRENT ROW\` membuat total kumulatif sampai baris saat ini.
- Kalau ada partisi (mis. per cabang), tambahkan \`PARTITION BY branch_id\` di dalam \`OVER\`.`,
    tags: "sql,window-function,running-total,analytics",
  },
  {
    role: "data-scientist",
    category: "coding",
    difficulty: "easy",
    question: "Bagaimana mengecek apakah dua string merupakan anagram di Python?",
    answer: `Cara paling ringkas adalah membandingkan frekuensi karakter:

\`\`\`python
from collections import Counter

def is_anagram(a: str, b: str) -> bool:
    return Counter(a) == Counter(b)
\`\`\`

Alternatif dengan sorting: \`sorted(a) == sorted(b)\`, kompleksitas O(n log n). Versi \`Counter\` O(n).

Perhatikan edge case: biasanya spasi dan case diabaikan kalau konteksnya kalimat. Tambahkan normalisasi bila perlu:

\`\`\`python
def normalize(s: str) -> str:
    return "".join(ch.lower() for ch in s if ch.isalnum())
\`\`\``,
    tags: "python,coding,string,anagram",
  },
  {
    role: "data-scientist",
    category: "ml-theory",
    difficulty: "medium",
    question: "Jelaskan overfitting, underfitting, dan bias-variance tradeoff.",
    answer: `- **Underfitting**: model terlalu sederhana, error tinggi di training maupun test. Bias tinggi.
- **Overfitting**: model terlalu kompleks, error rendah di training tapi tinggi di test. Varians tinggi.
- **Good fit**: error training dan test sama-sama rendah.

Bias-variance tradeoff: total error = bias^2 + varians + noise. Menambah kompleksitas menurunkan bias tetapi menaikkan varians.

Cara menangani overfitting: regularisasi (L1/L2), dropout, early stopping, menambah data, mengurangi fitur, cross-validation. Underfitting: tambah kapasitas model atau fitur.`,
    tags: "ml-theory,overfitting,bias-variance,regularization",
  },
  {
    role: "data-scientist",
    category: "statistics",
    difficulty: "hard",
    question: "A/B test menunjukkan hasil signifikan, tapi kamu menguji 5 metrik. Apa masalahnya?",
    answer: `Ini masalah **multiple comparisons**. Dengan α = 0.05 dan 5 uji independen, peluang minimal satu false positive ≈ 1 - 0.95^5 ≈ 23%, jauh di atas 5%.

Solusi:
1. **Tentukan satu primary metric** sebelum eksperimen, sisanya secondary/guardrail.
2. Koreksi p-value: Bonferroni (α / jumlah uji) atau Benjamini-Hochberg untuk mengontrol false discovery rate.
3. Validasi ulang temuan pada holdout atau eksperimen lanjutan sebelum dianggap final.

Signifikansi statistik juga bukan segalanya: cek effect size dan praktisnya berdampak atau tidak.`,
    tags: "statistics,ab-test,multiple-comparisons,experimentation",
  },
  {
    role: "data-scientist",
    category: "behavioral",
    difficulty: "easy",
    question: "Bagaimana kamu menjelaskan model kompleks ke stakeholder non-teknis?",
    answer: `Prinsipnya: fokus pada keputusan, bukan mekanisme.

1. Mulai dari pertanyaan bisnis dan keputusan apa yang dibantu model.
2. Terjemahkan ke bahasa awam: "model membaca pola dari data historis", bukan istilah teknis.
3. Jelaskan performa dengan cara yang bermakna: dari 100 kasus, berapa yang benar, dan dampak ongkos bila salah.
4. Tunjukkan keterbatasan dan risiko secara jujur.
5. Gunakan visualisasi sederhana, bukan tabel angka.
6. Sediakan opsi: apa yang terjadi kalau model dipakai dan tidak dipakai.

Hindari menjejalkan detail teknis; simpan untuk sesi terpisah bila diminta.`,
    tags: "behavioral,komunikasi,stakeholder,storytelling",
  },

  // ---------------- AI Engineer ----------------
  {
    role: "ai-engineer",
    category: "deep-learning",
    difficulty: "easy",
    question: "Apa itu self-attention di arsitektur Transformer?",
    answer: `Self-attention memungkinkan setiap token "melihat" token lain dalam satu sequence dan memberi bobot seberapa relevan token lain untuk merepresentasikan dirinya.

Mekanismenya: setiap token menghasilkan tiga vektor, **Query**, **Key**, **Value**. Skor relevansi dihitung sebagai dot product antara Q dan K, di-softmax menjadi bobot, lalu dipakai untuk menjumlahkan V.

\`\`\`text
Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V
\`\`\`

Bedanya dengan RNN: semua posisi diproses paralel dan jarak antar token tidak menghambat aliran informasi.`,
    tags: "transformer,self-attention,deep-learning,nlp",
  },
  {
    role: "ai-engineer",
    category: "deep-learning",
    difficulty: "medium",
    question: "Kenapa scaled dot-product attention dibagi dengan sqrt(d_k)?",
    answer: `Tanpa scaling, dot product Q dan K tumbuh seiring dimensi d_k. Nilai yang besar membuat softmax menjadi sangat "tajam", mendekati distribusi one-hot, sehingga gradiennya sangat kecil dan training tidak stabil.

Membagi dengan sqrt(d_k) menormalkan varians skor kembali ke sekitar 1 (karena jika q dan k punya komponen independen varians 1, dot product-nya varians d_k), sehingga softmax tetap pada rentang yang menghasilkan gradien sehat.`,
    tags: "transformer,attention,scaling,deep-learning",
  },
  {
    role: "ai-engineer",
    category: "ml-theory",
    difficulty: "medium",
    question: "Apa itu embedding dan kenapa berguna untuk semantic search?",
    answer: `Embedding adalah representasi vektor dari item (teks, gambar) di ruang berdimensi tinggi, di mana jarak antar vektor mencerminkan kemiripan makna.

Untuk semantic search: alih-alih mencocokkan kata kunci, kita mengubah query dan dokumen menjadi embedding lalu mencari dokumen dengan cosine similarity tertinggi. Hasilnya menangkap makna, bukan hanya kata: query "cara mempercepat training" bisa menemukan dokumen "tips speed up model training".

Implementasinya biasanya dengan model seperti Sentence-Transformers atau embedding API, lalu di-index di vector database (FAISS, pgvector, Qdrant).`,
    tags: "embedding,semantic-search,vector-database,nlp",
  },
  {
    role: "ai-engineer",
    category: "system-design",
    difficulty: "medium",
    question: "Desain sistem RAG untuk tanya jawab dokumen internal.",
    answer: `Komponen utama:

1. **Ingestion**: dokumen di-parse, dipotong menjadi chunk (mis. 500 token dengan overlap), lalu setiap chunk di-embed.
2. **Vector store**: simpan chunk + embedding + metadata (sumber, akses). Pilihan: pgvector, Qdrant, Pinecone.
3. **Retrieval**: query user di-embed, ambil top-k chunk (sering digabung dengan BM25 / hybrid search).
4. **Reranking**: model cross-encoder menyaring hasil retrieval sebelum masuk ke prompt.
5. **Generation**: LLM menjawab dengan konteks chunk, diminta menyertakan sitasi.
6. **Guardrails & eval**: cek relevansi, tangani jawaban "tidak ditemukan", log untuk evaluasi.

Pertimbangan: kontrol akses per dokumen, update indeks saat dokumen berubah, dan evaluasi retrieval (recall@k) terpisah dari kualitas jawaban.`,
    tags: "rag,system-design,llm,retrieval,vector-database",
  },
  {
    role: "ai-engineer",
    category: "system-design",
    difficulty: "hard",
    question: "Bagaimana strategi menurunkan latency dan biaya serving LLM?",
    answer: `Latency dan biaya saling terkait. Strategi:

- **Caching**: cache prompt-output untuk query berulang (exact match), dan prompt-prefix caching untuk system prompt panjang.
- **Batching**: continuous batching di server (vLLM, TGI) meningkatkan throughput GPU.
- **Model routing**: model kecil untuk tugas mudah, model besar hanya untuk kasus sulit. Klasifikasi intent dulu.
- **Streaming**: mengurangi perceived latency; token pertama muncul cepat.
- **Prompt optimization**: pangkas konteks, ringkas history, batasi max_tokens.
- **Quantization & distillation**: memperkecil model agar inferensi lebih murah.
- **Speculative decoding**: model draft kecil memprediksi, model besar memverifikasi.
- **Autoscaling & kapasitas**: scale-to-zero untuk traffic rendah, tapi perhatikan cold start.

Ukur dengan metrik p95 latency, token per detik, dan biaya per permintaan, bukan hanya rata-rata (mean menyesatkan).`,
    tags: "llm,latency,cost,serving,optimization",
  },
  {
    role: "ai-engineer",
    category: "deep-learning",
    difficulty: "medium",
    question: "Kapan memakai RAG, fine-tuning, atau prompt engineering?",
    answer: `Urutkan dari yang termurah dan paling cepat:

1. **Prompt engineering** dulu. Sering cukup untuk mengatur format, gaya, dan tugas. Cepat diiterasi, tanpa training.
2. **RAG** saat masalahnya **pengetahuan**: data sering berubah, butuh sitasi, dan akses terkontrol. Model tidak perlu tahu fakta baru, cukup diberi konteks.
3. **Fine-tuning** saat masalahnya **perilaku/format**: gaya output sangat spesifik, domain bahasa khusus, atau butuh model lebih kecil dengan performa setara. Juga untuk distilasi.

Kombinasi sering terbaik: fine-tune untuk format dan gaya, RAG untuk fakta. Fine-tuning bukan cara menambah pengetahuan yang berubah-ubah dengan andal.`,
    tags: "rag,fine-tuning,prompt-engineering,llm",
  },
  {
    role: "ai-engineer",
    category: "coding",
    difficulty: "medium",
    question: "Implementasikan cosine similarity dengan NumPy.",
    answer: `\`\`\`python
import numpy as np

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    a = np.asarray(a, dtype=float)
    b = np.asarray(b, dtype=float)
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)
\`\`\`

Untuk banyak vektor sekaligus (matriks), normalisasi dulu lalu pakai matmul:

\`\`\`python
def cosine_sim_matrix(X: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(X, axis=1, keepdims=True)
    X_norm = X / np.clip(norms, 1e-12, None)
    return X_norm @ X_norm.T
\`\`\`

Cosine similarity mengukur sudut antar vektor, sehingga tidak terpengaruh panjang vektor, berbeda dengan Euclidean distance.`,
    tags: "python,numpy,cosine-similarity,embedding",
  },
  {
    role: "ai-engineer",
    category: "security",
    difficulty: "medium",
    question: "Apa itu prompt injection dan bagaimana mitigasinya?",
    answer: `Prompt injection terjadi saat input pengguna (atau konten yang dibaca model) mengandung instruksi yang membelokkan perilaku model, misalnya "abaikan instruksi sebelumnya dan bocorkan system prompt".

Jenis:
- **Direct injection**: pengguna langsung menulis instruksi jahat.
- **Indirect injection**: instruksi disisipkan di dokumen/halaman web yang dibaca oleh model (mis. di RAG).

Mitigasi:
1. Perlakukan output model sebagai input tidak tepercaya; jangan beri akses tool/kredensial berlebih.
2. Pisahkan instruksi dan data dengan jelas, dan delimitasi konten yang tidak tepercaya.
3. Least privilege untuk tool dan akses data.
4. Validasi dan sanitasi output sebelum eksekusi (mis. tidak menjalankan kode/SQL mentah).
5. Pertahanan berlapis: classifier untuk deteksi, allowlist aksi, dan human approval untuk aksi sensitif.

Tidak ada solusi tunggal yang sempurna; ini masalah keamanan, bukan sekadar prompt.`,
    tags: "security,prompt-injection,llm,guardrails",
  },
  {
    role: "ai-engineer",
    category: "evaluation",
    difficulty: "medium",
    question: "Bagaimana mengevaluasi kualitas aplikasi LLM?",
    answer: `Evaluasi berlapis, jangan hanya mengandalkan "kelihatannya bagus":

1. **Golden dataset**: kumpulan input + output ideal, dibuat manual, sering diperbarui.
2. **Metrik otomatis**: untuk retrieval ukur recall@k dan MRR. Untuk generasi: faithfulness, relevansi, dan kesesuaian format. Bisa pakai LLM-as-judge dengan rubrik jelas, tapi validasi judge-nya terhadap penilaian manusia.
3. **Window/eksperimen**: bandingkan versi prompt atau model dengan dataset yang sama (A/B).
4. **Evaluasi manusia**: sampling berkala untuk kasus sulit dan kasus baru.
5. **Monitoring produksi**: log, feedback pengguna, deteksi regresi, dan deteksi hallucination.

Evaluasi bukan sekali jalan; perlakukan seperti test suite yang ikut berkembang.`,
    tags: "evaluation,llm,evals,llm-as-judge",
  },
  {
    role: "ai-engineer",
    category: "behavioral",
    difficulty: "easy",
    question: "Bagaimana kamu memutuskan model LLM untuk sebuah use case?",
    answer: `Kriteria keputusan:

1. **Kualitas pada tugas spesifik**: ukur dengan eval set milikmu sendiri, bukan hanya benchmark publik.
2. **Biaya**: harga per token input/output, dan perkiraan volume.
3. **Latency**: p95, dan apakah streaming cukup.
4. **Konteks & kemampuan**: panjang context, tool use, multimodal, bahasa Indonesia.
5. **Privasi & kepatuhan**: apakah data boleh keluar, atau perlu self-hosted.
6. **Operasional**: rate limit, ketersediaan, kemudahan ganti model.

Praktiknya: mulai dari model umum yang kuat, bangun eval set kecil, lalu uji beberapa kandidat. Siapkan abstraksi agar ganti model murah, dan jangan menikah dengan satu vendor.`,
    tags: "behavioral,llm,model-selection,tradeoff",
  },

  // ---------------- ML Engineer ----------------
  {
    role: "ml-engineer",
    category: "ml-theory",
    difficulty: "easy",
    question: "Apa perbedaan supervised dan unsupervised learning?",
    answer: `**Supervised**: data punya label. Model belajar memetakan input ke output. Contoh: klasifikasi spam, prediksi harga rumah. Metrik jelas karena ada ground truth.

**Unsupervised**: tanpa label. Model mencari struktur tersembunyi. Contoh: clustering pelanggan, dimensionality reduction (PCA), deteksi anomali.

Di antaranya ada semi-supervised (sedikit label, banyak data tak berlabel) dan self-supervised (label dibuat dari data itu sendiri, dasar model bahasa modern).`,
    tags: "ml-theory,supervised,unsupervised,dasar",
  },
  {
    role: "ml-engineer",
    category: "ml-theory",
    difficulty: "medium",
    question: "Jelaskan precision, recall, dan kapan memakai F1-score.",
    answer: `- **Precision** = TP / (TP + FP). Dari yang diprediksi positif, berapa yang benar. Penting saat false positive mahal (mis. filter spam yang salah menandai email penting).
- **Recall** = TP / (TP + FN). Dari yang seharusnya positif, berapa yang tertangkap. Penting saat false negative mahal (mis. skrining penyakit).
- **F1** = harmonic mean precision dan recall. Dipakai saat kelas tidak seimbang dan kamu butuh satu angka yang menyeimbangkan keduanya.

Pilih metrik berdasarkan **biaya kesalahan**, bukan default. Untuk distribusi kelas sangat timpang, accuracy menyesatkan (model yang selalu prediksi kelas mayoritas bisa 99% akurat tapi tak berguna).`,
    tags: "ml-theory,precision,recall,f1,metrics",
  },
  {
    role: "ml-engineer",
    category: "coding",
    difficulty: "medium",
    question: "Implementasikan gradient descent untuk linear regression sederhana.",
    answer: `\`\`\`python
import numpy as np

def linear_regression_gd(X, y, lr=0.01, epochs=1000):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    n, d = X.shape
    w = np.zeros(d)
    b = 0.0
    for _ in range(epochs):
        y_pred = X @ w + b
        error = y_pred - y
        grad_w = (2 / n) * (X.T @ error)
        grad_b = (2 / n) * error.sum()
        w -= lr * grad_w
        b -= lr * grad_b
    return w, b
\`\`\`

Poin penting: learning rate terlalu besar membuat divergen, terlalu kecil membuat konvergen lambat. Untuk data berskala berbeda, normalisasi fitur dulu.`,
    tags: "python,coding,gradient-descent,linear-regression",
  },
  {
    role: "ml-engineer",
    category: "mlops",
    difficulty: "medium",
    question: "Apa itu data leakage dan bagaimana mendeteksinya?",
    answer: `Data leakage terjadi saat informasi yang seharusnya tidak tersedia saat prediksi ikut masuk ke training, sehingga performa validasi terlihat bagus tetapi gagal di produksi.

Contoh umum:
- Preprocessing (scaling, imputasi) dilakukan pada seluruh data sebelum split.
- Fitur turunan dari target yang tidak tersedia di waktu inferensi.
- Split acak pada data time series, sehingga "masa depan" bocor ke training.
- Duplikasi baris antara train dan test.

Deteksi:
- Performa validasi yang "terlalu bagus" adalah sinyal kuat.
- Audit setiap fitur: apakah nilainya benar-benar diketahui pada saat prediksi?
- Gunakan pipeline yang menempatkan semua preprocessing di dalam fold CV.
- Untuk time series, selalu split berdasarkan waktu.`,
    tags: "mlops,data-leakage,validation,cross-validation",
  },
  {
    role: "ml-engineer",
    category: "mlops",
    difficulty: "medium",
    question: "Apa itu model drift dan bagaimana menanganinya?",
    answer: `Model drift adalah penurunan performa model karena dunia berubah setelah model dilatih.

- **Data drift / covariate shift**: distribusi fitur input berubah.
- **Concept drift**: hubungan antara fitur dan target berubah.
- **Label drift**: distribusi target berubah.

Deteksi:
- Monitor distribusi fitur (PSI, KL divergence) dan output model.
- Monitor metrik performa jika label tersedia (dengan delay).
- Alert pada pergeseran signifikan, bukan hanya dashboard pasif.

Penanganan:
- Retraining terjadwal atau berbasis trigger.
- Online learning untuk perubahan cepat.
- Rollback cepat bila model baru lebih buruk.
- Sertakan data periode drift terbaru saat retraining.`,
    tags: "mlops,drift,monitoring,retraining",
  },
  {
    role: "ml-engineer",
    category: "ml-theory",
    difficulty: "hard",
    question: "Apa perbedaan Random Forest dan Gradient Boosting?",
    answer: `- **Random Forest** (bagging): melatih banyak decision tree secara paralel pada bootstrap sample dan subset fitur, lalu merata-ratakan (regresi) atau voting (klasifikasi). Mengurangi varians. Cenderung tahan terhadap hyperparameter dan overfitting.
- **Gradient Boosting** (boosting): melatih tree secara berurutan, setiap tree memperbaiki residual/error tree sebelumnya. Mengurangi bias. Sering lebih akurat tetapi lebih sensitif terhadap learning rate, jumlah tree, dan kedalaman, serta rentan overfitting bila tidak diregularisasi.

Praktik:
- RF: baseline kuat, cepat, minim tuning.
- GBM (XGBoost/LightGBM): performa terbaik dengan tuning dan early stopping, sering jadi pilihan untuk data tabular.
- Keduanya memberi feature importance, tapi importance boosting bisa bias; gunakan permutation importance atau SHAP untuk interpretasi yang lebih andal.`,
    tags: "ml-theory,random-forest,gradient-boosting,ensemble",
  },
  {
    role: "ml-engineer",
    category: "mlops",
    difficulty: "medium",
    question: "Apa itu feature store dan kapan kamu membutuhkannya?",
    answer: `Feature store adalah lapisan yang menyimpan dan melayani fitur secara konsisten untuk training dan inference, biasanya dengan dua mode: offline store (batch, untuk training) dan online store (low-latency, untuk serving).

Masalah yang diselesaikan: **training-serving skew**, duplikasi logika fitur di banyak tim, dan reuse fitur antar model.

Kamu butuh feature store saat:
- Banyak model memakai fitur yang sama dan tim mulai menduplikasi logika.
- Fitur dihitung streaming/batch dan harus konsisten saat inference.
- Butuh point-in-time correctness untuk mencegah leakage pada training.

Kalau kamu masih punya satu atau dua model, feature store kemungkinan overkill. Mulai dari pipeline fitur yang rapi dan terdokumentasi.`,
    tags: "mlops,feature-store,training-serving-skew",
  },
  {
    role: "ml-engineer",
    category: "system-design",
    difficulty: "hard",
    question: "Desain sistem rekomendasi untuk jutaan pengguna.",
    answer: `Arsitektur tipikal dua tahap:

1. **Candidate generation** (retrieval): menyaring jutaan item menjadi ratusan kandidat dengan biaya rendah. Teknik: collaborative filtering, two-tower embedding (user dan item di-embed, dicari dengan ANN), atau rules popularitas untuk cold start.
2. **Ranking**: model lebih berat (mis. GBM atau deep model) memberi skor kandidat dengan fitur user, item, dan konteks.
3. **Business rules**: diversity, deduplikasi, filter konten, dan penalti item yang sudah sering dilihat.

Pendukung:
- **Feature store** untuk fitur real-time yang konsisten.
- **Vector index** (FAISS/ScaNN) untuk ANN pada skala besar.
- **Caching** hasil rekomendasi per segmen pengguna.
- **Feedback loop**: log impression, click, dan konversi untuk retraining.

Evaluasi: offline (recall@k, NDCG) saja tidak cukup. Validasi dengan online A/B karena metrik engagement bisa berbeda dari prediksi offline.`,
    tags: "system-design,recommendation,retrieval,ranking,scalability",
  },
  {
    role: "ml-engineer",
    category: "coding",
    difficulty: "hard",
    question: "Implementasikan algoritma k-means dari nol.",
    answer: `\`\`\`python
import numpy as np

def kmeans(X, k, max_iters=100, seed=42):
    rng = np.random.default_rng(seed)
    X = np.asarray(X, dtype=float)
    centroids = X[rng.choice(len(X), k, replace=False)]

    for _ in range(max_iters):
        distances = np.linalg.norm(X[:, None] - centroids[None, :], axis=2)
        labels = distances.argmin(axis=1)

        new_centroids = np.array([
            X[labels == j].mean(axis=0) if np.any(labels == j) else centroids[j]
            for j in range(k)
        ])

        if np.allclose(new_centroids, centroids):
            break
        centroids = new_centroids

    return labels, centroids
\`\`\`

Catatan:
- Inisialisasi memengaruhi hasil; k-means++ jauh lebih stabil daripada random.
- k-means mengasumsikan cluster berbentuk bola dan sensitif terhadap skala, jadi normalisasi fitur dulu.
- Pilih k dengan elbow method atau silhouette score.`,
    tags: "python,coding,kmeans,clustering",
  },
  {
    role: "ml-engineer",
    category: "mlops",
    difficulty: "easy",
    question: "Model performanya bagus offline tapi buruk di produksi. Bagaimana men-debug?",
    answer: `Periksa berurutan dari yang paling sering terjadi:

1. **Training-serving skew**: fitur dihitung berbeda saat training dan serving. Bandingkan nilai fitur di kedua jalur untuk sampel yang sama.
2. **Data leakage saat training**: performa validasi terlalu bagus. Audit fitur.
3. **Perbedaan distribusi**: data produksi berbeda dari data training (drift). Bandingkan statistik fitur.
4. **Latency dan timeout**: model dipanggil dengan timeout pendek, atau fallback default yang buruk.
5. **Bug pipeline**: unit salah, format berbeda, urutan fitur tertukar, missing value ditangani beda.
6. **Definisi label**: label di produksi didefinisikan berbeda dari saat training.

Praktik: log input dan output model di produksi, siapkan shadow mode untuk membandingkan prediksi, dan buat integrasi test yang mereplay sampel produksi ke pipeline training.`,
    tags: "mlops,debugging,training-serving-skew,production",
  },
];

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const prisma = new PrismaClient({ adapter });

  const count = await prisma.question.count();
  if (count > 0) {
    console.log(`Skip seed: sudah ada ${count} soal. Kosongkan tabel dulu bila ingin seed ulang.`);
  } else {
    await prisma.question.createMany({ data: questions });
    console.log(`Seed selesai: ${questions.length} soal.`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
