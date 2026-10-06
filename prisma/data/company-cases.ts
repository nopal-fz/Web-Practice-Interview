import type { SeedQuestion } from "./extra-questions";

// Kasus nyata dari perusahaan yang dipublikasikan (paper / engineering blog resmi).
// Bedanya dengan extra-questions.ts: angka dan keputusan teknisnya bisa dilacak
// ke sumber publik, jadi aman dipakai sebagai bahan latihan.
//
// Struktur jawaban: rumus -> intuisi -> kode yang bisa dijalankan.
// Semua kode di bawah sudah dijalankan (Python 3.11 + numpy 1.26) dan keluarannya
// cocok dengan angka yang diklaim di dalam teks.
export const companyCaseQuestions: SeedQuestion[] = [
  // ---------------- Netflix Prize ----------------
  {
    role: "data-scientist",
    category: "recommender",
    difficulty: "hard",
    question:
      "Netflix Prize 2009 dinilai dengan metrik RMSE, dan tim BellKor menang dengan submit 20 menit sebelum deadline. Kenapa RMSE dipilih (bukan MAE atau akurasi), dan kenapa submission yang hampir identik bisa punya skor berbeda?",
    answer: `Kasus nyata: **Netflix Prize 2009**. Sistem internal Netflix (Cinematch) punya RMSE **0.9514** di quiz set; prediksi "rating rata-rata tiap film" tanpa personalisasi punya RMSE **1.0540**. Tim BellKor Pragmatic Chaos menang dengan RMSE **0.8567** di test set, yaitu **10.06%** lebih baik dari Cinematch.

### Rumus

RMSE = sqrt( (1/n) * SUM ( r_ui - p_ui )^2 )
MAE = (1/n) * SUM | r_ui - p_ui |

Karena diKuadratkan, galat besar dihukum secara kuadratik. Salah prediksi 1 padahal sebenarnya 5 jauh lebih mahal daripada meleset 0.5.

### Intuisi

1. **Rating itu ordinal, bukan interval.** Orang yang memberi rating 5 tidak berarti "dua kali lebih senang" dibanding rating 3. RMSE dan MAE sama-sama memperlakukan jarak 1-2 sama dengan 4-5, jadi keduanya salah di titik yang sama. Metrik yang lebih jujur untuk data ordinal adalah concordance atau squared-rank, tapi industri tetap pakai RMSE karena murah dan stabil.
2. **Baseline pribadi itu kuat.** Cinematch sendiri sudah ~10% lebih baik daripada prediksi mean. Jadi pendekatan "main effect dulu" (user mean + item mean) harus dikalahkan sebelum model interaksi user-item masuk akal.
3. **Quiz set bisa dibohongi, test set tidak.** Netflix sengaja membagi qualifying set jadi dua bagian: **quiz** (skornya kamu lihat) dan **test** (disembunyikan, menentukan pemenang). Kalau kamu menyetel model berdasarkan skor quiz berulang kali, kamu sedang fit ke quiz set. Skor quiz naik, test set bisa turun. Karena itu submission 20 menit sebelum Ensemble berarti submission yang disusun tanpa waktu untuk overfit quiz berulang.

### Kode

\`\`\`python
import numpy as np

# Quiz set: Cinematch 0.9514. Test set: Cinematch 0.9525, BellKor 0.8567.
cinematch_test, bellkor_test = 0.9525, 0.8567
improvement = (cinematch_test - bellkor_test) / cinematch_test * 100
print(f"improvement vs Cinematch (test set): {improvement:.2f}%")

pred = np.array([3.5, 2.0, 4.8, 1.2])
true = np.array([4.0, 2.5, 4.0, 2.0])
rmse = np.sqrt(np.mean((pred - true) ** 2))
mae = np.mean(np.abs(pred - true))
print(f"RMSE = {rmse:.4f}   MAE = {mae:.4f}")
\`\`\`

Keluarannya: perbaikan 10.06%, RMSE 0.6671, MAE 0.6500. RMSE lebih besar dari MAE karena ada satu galat besar (prediksi 1.2 untuk rating 2.0). Kalau galat besar hilang, keduanya mendekati.

### Takeaway

1. Pilih metrik sesuai bentuk data dan tujuan bisnis, bukan metrik yang terdengar keren.
2. Kalahkan baseline sederhana dulu. Prediksi mean adalah standar profesional, bukan kesalahan.
3. Waspadai overfitting ke metrik yang terlihat; test set tidak bisa kamu tweak.`,
    tags: "netflix,recommender,rmse,mae,cinematch,rating",
    source:
      "https://en.wikipedia.org/wiki/Netflix_Prize + paper BellKor (Koren, Bell, Volinsky)",
  },
  {
    role: "ml-engineer",
    category: "recommender",
    difficulty: "hard",
    question:
      "Netflix hanya menampilkan SATU artwork per judul per member. Bagaimana kamu belajar dari feedback yang tidak lengkap, dan kenapa eksplorasi acak yang di-log membuat analisis offline kamu bias?",
    answer: `Kasus nyata: **Netflix Artwork Personalization** (engineering blog Netflix, 2017). Awalnya Netflix memakai multi-armed bandit untuk memilih satu artwork terbaik per judul untuk semua orang. Lalu mereka mempersonalisasi per member dengan **contextual bandits**, konteksnya member itu sendiri: film yang pernah ditonton, genre, device, jam. Peak-nya **20 juta request per detik**.

### Rumus

Kamu hanya melihat reward untuk arm yang DIPILIH, bukan yang tidak dipilih. Ini namanya **incomplete logged bandit feedback**. Estimator untuk membatalkan bias sampling:

**Inverse Propensity Scoring (IPS):**

V_IPS = (1/n) * SUM_t ( r_t / P(a_t | x_t) )

**Doubly Robust** menggabungkan IPS dengan model reward, jadi tetap unbiased selama salah satu asumsi (model benar ATAU propensity benar) terpenuhi.

### Intuisi

1. **Eksplorasi yang sengaja di-log menciptakan paradoks.** Netflix mengacak pilihan artwork untuk mengumpulkan data. Bagus untuk data, tapi kalau dianalisis naive ("artwork X hasilnya bagus"), kamu salah: artwork X dapat lebih banyak impression karena lebih sering ditampilkan, bukan karena lebih disukai.
2. **Propensity correcting.** Bobot setiap impression dengan 1/P(arm itu dipilih). Kalau sebuah artwork hanya muncul 5% dari waktu, setiap penampilannya dihitung 20x lebih berat.
3. **Cold start.** Judul baru luncur tidak punya interaksi. Karena itu fitur konteks member dan computer vision untuk analisis gambar penting: artwork baru bisa dipersonalisasi sebelum punya data.
4. **Perubahan terlalu sering merusak atribusi.** Kalau artwork berganti tiap sesi, kamu tidak bisa mengaitkan engagement ke gambar tertentu. Netflix mengatur eksplorasi agar pilihan cukup stabil.

### Kode

\`\`\`python
import numpy as np

# Tiap impression: (arm yang ditampilkan, reward, propensities semua arm)
impressions = [
    (0, 1.0, {0: 0.9, 1: 0.1}),
    (1, 0.0, {0: 0.9, 1: 0.1}),
    (0, 0.0, {0: 0.5, 1: 0.5}),
]

# Tanpa koreksi: arm 1 terlihat payout-nya 0.0 padahal hanya jarang dipilih.
naive = np.mean([r for _, r, _ in impressions])
per_arm = {arm: np.mean([r for a, r, _ in impressions if a == arm]) for arm in (0, 1)}
print("naive   =", round(naive, 3), per_arm)

# IPS: bobot 1/P(a|x) membatalkan bias sampling yang tidak seragam.
ips = np.mean([r / p[a] for a, r, p in impressions])
print("IPS     =", round(ips, 3))

# Beta prior (Thompson) agar arm dengan data tipis tidak terlihat ekstrem.
for arm in (0, 1):
    rs = [r for a, r, _ in impressions if a == arm]
    print(f"arm {arm}: alpha={sum(rs) + 1:.1f} beta={len(rs) - sum(rs) + 1:.1f}")
\`\`\`

Naive bikin arm 1 terlihat punya reward 0.0 padahal arm 1 cuma jarang tampil (propensity 0.1-0.5). Setelah IPS angkanya tidak lagi bias oleh frekuensi tampil. Persis masalah yang Netflix hadapi saat menganalisis logged data dari eksplorasi.

### Takeaway

1. Feedback dari logged bandit selalu perlu propensity correction sebelum dianalisis.
2. Log propensi saat logging. Tanpa itu, evaluasi policy offline tidak bisa dipercaya.
3. Beta prior / Thompson sampling adalah cara rapi menangani data tipis.`,
    tags: "netflix,bandit,contextual-bandit,ips,exploration,propensity,artwork",
    source:
      "https://netflixtechblog.com/artwork-personalization-c589f074ad76 + ACM RecSys 2018 (Amat et al.)",
  },

  // ---------------- Google Flu Trends ----------------
  {
    role: "data-scientist",
    category: "data-quality",
    difficulty: "hard",
    question:
      "Google Flu Trends memperkirakan prevalensi flu AS dari query pencarian, dan gagal total musim 2012-13 (overestimate lebih dari 2x di puncak). Apa root cause sebenarnya, dan kenapa kamu tidak bisa mendeteksinya hanya dari korelasi model versus data?",
    answer: `Kasus nyata: **Google Flu Trends**. Lazer dan rekan-rekannya menulis "The Parable of Google Flu: Traps in Big Data Analysis" (Science, 2014). Temuan kunci: musim 2011-12 overestimate lebih dari 50%; puncak 2012-13 hampir dua kali lipat CDC. Untuk periode lebih dari dua tahun menuju September 2013, GFT terlalu tinggi di 100 dari 158 minggu. Google akhirnya menutup layanannya dan menyerahkan proyek ini ke CDC lewat Flu Near You.

### Rumus

GFT memetakan frekuensi query ke ILI lewat regresi:

ILI_hat(t) = beta_0 + beta_1 * log(search_volume(t)) + beta_2 * tren_mingguan + beta_3 * tren_tahunan + ...

Dilatih dengan data CDC historis. Asumsi tak tertulis: search volume adalah proksi yang valid untuk ILI.

### Intuisi

1. **Search behavior bukan illness behavior.** Ketika media banyak meliput epidemi, orang yang sehat pun Googling "flu symptoms". Search volume naik karena coverage media, bukan karena orang sakit. Sinyalnya mengukur hal yang salah.
2. **Big Data Trap: correlation bukan causation.** Volume data yang lebih besar tidak otomatis lebih baik. Kalau variabelnya bias, kamu hanya dapat jawaban yang lebih pasti tentang pertanyaan yang salah.
3. **Kenapa korelasinya tetap tinggi.** Secara historis search volume memang berkorelasi kuat dengan ILI, jadi model GFT bekerja baik selama bertahun-tahun. Yang berubah di 2013: media coverage naik dan search volume tidak lagi proporsional dengan illness. Korelasi in-sample tetap tinggi, prediksi out-of-sample meleset jauh.
4. **Akibat nyata.** Pejabat kesehatan publik memperingatkan bahwa angka yang terlalu tinggi bisa memicu keputusan pembatasan yang tidak perlu, atau membuat orang meremehkannya epidemi yang sebenarnya sedang berjalan.

### Kode

\`\`\`python
import numpy as np

def corr(a, b):
    return float(np.corrcoef(a, b)[0, 1])

# ILI (%) dari CDC untuk 10 minggu.
cdc = np.array([5, 6, 8, 12, 18, 15, 10, 7, 5, 4], dtype=float)
# Minggu 1-5 GFT nempel ke CDC. Minggu 6-10 ada lonjakan liputan media:
# query naik, illness tidak naik seproorsional -> GFT over-predict sistematis.
rel = np.array([1.00, 1.02, 1.00, 0.99, 1.01, 1.55, 1.60, 1.58, 1.62, 1.50])
gft = cdc * rel

print("corr 10 minggu:", round(corr(cdc, gft), 3))
print("corr 5 minggu :", round(corr(cdc[:5], gft[:5]), 3))
print("over-predict minggu 6-10: +%.0f%%" % ((rel[5:].mean() - 1) * 100))
print("R^2 in-sample:", round(corr(cdc, gft) ** 2, 3))

# Guard yang harus ada: bandingkan residual per periode, bukan cuma korelasi.
resid = gft / cdc - 1
print("resid 5 minggu pertama :", np.round(resid[:5], 3))
print("resid 5 minggu terakhir:", np.round(resid[5:], 3))
\`\`\`

Korelasi 10 minggu 0.878 dan R-squared 0.771 terdengar "bagus". Tapi residual menunjukkan over-predict sekitar 57% di paruh akhir: lima minggu pertama mendekati 0, lima minggu terakhir melonjak ke +50 sampai +60%. Korelasi menyembunyikan masalah; residual per periode yang mengungkannya.

### Takeaway

1. Kalau proksi punya confounding yang berubah seiring waktu, korelasi tidak cukup. Pantau residual per periode.
2. Jangan ganti sumber surveilans dengan satu proksi tanpa verifikasi berkala.
3. Tanyakan selalu: apakah proses yang menghasilkan data ini berubah?`,
    tags: "google-flu,data-quality,big-data-trap,media-bias,confounding,proxy,drift",
    source:
      "https://www.science.org/doi/10.1126/science.1248506 (Lazer et al. 2014) + pengungkapan Google 2013",
  },

  // ---------------- eBay A/B Quality ----------------
  {
    role: "data-scientist",
    category: "ab-testing",
    difficulty: "hard",
    question:
      "Di eBay ratusan A/B test jalan setiap hari. Bagaimana mereka memastikan randomisasi benar-benar acak? Jelaskan PSI dan deteksi SRM, dan kenapa SRM bisa menyelamatkan keputusan bisnis yang cacat.",
    answer: `Kasus nyata: **eBay Experimentation Platform** (Nie et al., CIKM 2022). Pendekatan dua lapis: (1) validasi randomisasi memakai **Population Stability Index (PSI)**, (2) deteksi **Sample Ratio Mismatch (SRM)** dengan analisis sekuensial. Validasi mereka memakai 519 eksperimen jangka panjang dengan rata-rata 29 hari data.

### Rumus

**PSI** mengukur jarak sebaran actual terhadap baseline:

PSI = SUM_bins ( (actual% - expected%) * ln(actual% / expected%) )

Acuan umum: PSI < 0.1 stabil, 0.1 sampai 0.25 perlu perhatian, > 0.25 pergeseran signifikan.

**SRM (chi-square goodness of fit)**, untuk n sel dengan proporsi harapan p_i:

chi-square = SUM_i ( (observed_i - n * p_i)^2 / (n * p_i) )

df = n_sel - 1. Untuk df = 1, alpha = 0.001 berarti ambang sekitar 10.8.

### Intuisi

1. **Cek randomisasi dulu, baru baca metrik bisnis.** Kegagalan paling umum A/B test bukan metric-nya salah, tapi assignment-nya tidak merata: bug di SDK, filter yang hanya berlaku di satu arm, atau retry yang oversample satu arm. Akibatnya treatment menang padahal treatment memang dapat lebih banyak user.
2. **PSI dan SRM mengecek tempat berbeda.** PSI mengecek sebaran user yang masuk ke setiap sel. SRM mengecek rasio akhir setelah triggering dan filtering. Keduanya menangkap bug, tapi titik yang berbeda.
3. **Kenapa analisis sekuensial.** Dengan direct chi-square, false positive rate dikali ratusan eksperimen per hari menghasilkan terlalu banyak alarm palsu. eBay membandingkan chi-square, t-test, Anderson-Darling, dan KS pada data mereka: KS test masih menyisakan FPR 0.33%, PSI punya zero FPR pada salah satu dataset. Mereka memilih SPRT untuk deteksi sample delta.

### Kode

\`\`\`python
import numpy as np

def psi(expected, actual, eps=1e-9):
    expected = np.asarray(expected, dtype=float)
    actual = np.asarray(actual, dtype=float)
    p = expected / expected.sum()
    q = actual / actual.sum()
    return float(np.sum((q - p) * np.log((q + eps) / (p + eps))))

# 1) Validasi randomisasi: sebar user antar 4 sel harus mendekati Multinomial(0.25).
sehat = np.array([0.25, 0.25, 0.25, 0.25])
sehat_obs = np.array([0.2499, 0.2501, 0.2503, 0.2497])
# Bug nyata: satu filter targeting tidak berlaku di sel C, user tergeser 5%.
lompat = np.array([0.2500, 0.2500, 0.2000, 0.3000])
print(f"PSI sehat  = {psi(sehat, sehat_obs):.5f}")
print(f"PSI lompat = {psi(sehat, lompat):.5f}")

# 2) SRM pada traffic yang sudah ter-trigger.
obs = np.array([260_000, 240_000])
exp = obs.sum() * np.array([0.5, 0.5])
print(f"chi-square SRM  = {np.sum((obs - exp) ** 2 / exp):.1f}")

obs_acak = np.array([250_400, 249_600])
exp_acak = obs_acak.sum() * np.array([0.5, 0.5])
print(f"chi-square acak = {np.sum((obs_acak - exp_acak) ** 2 / exp_acak):.1f}")
\`\`\`

PSI sehat mendekati 0, PSI lompat 0.02027: pergeseran user terlihat jauh sebelum perbedaan treatment terlihat. Chi-square SRM 800.0 versus chi-square pada fluktuasi acak 1.3. Deviasi 4% itu kecil secara absolut tapi mustahil terjadi secara acak pada 500.000 sample.

### Takeaway

1. Setiap A/B test butuh guard SRM dan PSI. Bukan pelengkap, tapi prasyarat.
2. SRM yang lolos = keputusan bisnis di atas data yang cacat.
3. Di platform dengan banyak eksperimen paralel, analisis sekuensial menahan false positive tanpa mengorbankan power berarti.`,
    tags: "ebay,ab-testing,srm,psi,chi-square,randomization,sequential-testing",
    source:
      "https://arxiv.org/pdf/2208.07766 (Nie, Zhang, Xu, Yuan — CIKM 2022)",
  },
  {
    role: "ai-product-manager",
    category: "experimentation",
    difficulty: "hard",
    question:
      "Duolingo mengoptimasi notifikasi harian dengan bandit untuk ratusan juta pengguna, tapi bukan bandit standar. Dua masalah apa yang membuat bandit biasa gagal, dan bagaimana mereka menyelesaikannya?",
    answer: `Kasus nyata: **"A Sleeping, Recovering Bandit Algorithm for Optimizing Recurring Notifications"** (Yancey & Settles, KDD 2020). Hasilnya: **+0.5% total daily active users** dan **+2% new user retention** di atas baseline yang sudah kuat. Paper ini juga melepas dataset publicly: 200 juta push notification selama 35 hari.

### Rumus

Softmax bandit:

P(a) = exp(theta_a / tau) / SUM_b exp(theta_b / tau)

Pembaruan "recovering" dengan laju belajar yang tetap:

theta_a(t+1) = theta_a(t) + alpha * ( r(t) - theta_a(t) )

Laju tetap (bukan 1/n) justru penting: bobot historis lama meluruh seiring waktu, jadi arm yang kembali relevan bisa menang lagi tanpa mulai dari nol.

### Intuisi

**Masalah 1, novelty effect.** Template terbaik hari ini bisa buruk besok karena pengulangan itu sendiri menurunkan respons. Mean per arm yang kaku tidak bisa menangkap pergeseran ini.

**Masalah 2, conditional eligibility ("sleeping arms").** Tidak semua template boleh dikirim ke semua pengguna. Orang yang baru daftar belum punya streak tujuh hari, jadi template "selesaikan streak-mu" tidak eligible di ronde itu. Arm tertentu tidak bisa dipilih pada ronde tertentu, dan Thompson sampling standar tidak punya cara menangani itu.

**Solusi Duolingo:**
1. **Recovering** memberi bobot historis yang meluruh, sehingga template yang tadinya sudah unggul masih bisa kembali naik.
2. **Sleeping** ditangani secara soft: arm yang tidak eligible diberi probabilitas mendekati nol tanpa dihapus dari state.
3. Personalisasi per pengguna, bukan satu template optimal global.

### Kode

\`\`\`python
import numpy as np

rng = np.random.default_rng(7)

N_ARMS, LR, ROUNDS, WINDOW, TAU = 4, 0.08, 8000, 2000, 800.0

def true_ctr(t):
    """Novelty effect: template 3 menang di awal lalu meluruh, template 0 membaik."""
    decay = np.exp(-t / TAU)
    return np.array([
        0.20 + 0.25 * (1 - decay),   # template 0: makin baik seiring waktu
        0.15,
        0.10,
        0.45 * decay,                # template 3: novelty habis
    ])

def softmax_sample(scores, tau):
    z = scores / tau
    p = np.exp(z - z.max())
    return int(rng.choice(len(p), p=p / p.sum()))

means = np.zeros(N_ARMS)
share = np.zeros((4, N_ARMS))
best_at_start = [int(np.argmax(true_ctr(w * WINDOW))) for w in range(4)]

for t in range(ROUNDS):
    pick = softmax_sample(means, tau=0.08)
    share[t // WINDOW][pick] += 1
    means[pick] += LR * (float(rng.random() < true_ctr(t)[pick]) - means[pick])

for i in range(4):
    print(f"jendela {i+1} | arm terbaik TRUE {best_at_start[i]} | "
          f"share {np.round(share[i] / share[i].sum(), 3)}")

print("template 3 (novelty):", f"{share[0][3] / share[0].sum():.3f}",
      "->", f"{share[-1][3] / share[-1].sum():.3f}")
print("template 0 (steady) :", f"{share[0][0] / share[0].sum():.3f}",
      "->", f"{share[-1][0] / share[-1].sum():.3f}")
\`\`\`

Di jendela pertama template 3 memang arm terbaik dan bandit memberi share terbesar kedua. Setelah novelty habis, share-nya turun ke 0.007, sementara template 0 naik dari 0.611 ke 0.920. Bandit bisa melepas arm 3 tanpa reset dari nol, karena pembaruan fixed-step melupakan masa lalu secara alami.

### Takeaway

1. Asumsi "rate per arm tetap" salah di produksi. Novelty dan eligibility itu realita, bukan penyimpangan.
2. Soft-arm handling lebih praktis daripada menghapus arm secara struktural.
3. Lift 0.5% pada DAU itu besar untuk notifikasi: efeknya bekerja pada kebiasaan, bukan pada klik satu kali.`,
    tags: "duolingo,bandit,novelty-effect,sleeping-arms,softmax,experimentation,pm",
    source:
      "https://research.duolingo.com/papers/yancey.kdd20.pdf (Yancey & Settles, KDD 2020)",
  },

  // ---------------- Airbnb Search Ranking ----------------
  {
    role: "ml-engineer",
    category: "ranking",
    difficulty: "hard",
    question:
      "Airbnb memakai GBDT untuk search ranking dan hasilnya plateau. Mereka pindah ke deep learning tapi objective training-nya tetap L2 regression. Kenapa tidak langsung ganti ke loss ranking, dan bagaimana objective itu tetap dikaitkan ke metrik bisnis?",
    answer: `Kasus nyata: **Airbnb Search** (Haldar et al., KDD 2019 dan KDD 2020). Mengganti scoring function manual dengan GBDT memberi salah satu step improvement terbesar di sejarah Airbnb, tapi setelah itu gain online saturasi dengan rentetan eksperimen netral. Mereka lalu beralih ke deep learning.

### Rumus

Objective tetap L2 regression dengan utility sebagai label:

y_booked = 1.0,  y_not_booked = 0.0
Loss = (1/n) * SUM ( y_i - f(x_i) )^2

Supaya tetap terikat ke ranking, tiap sample diberi bobot sebesar perubahan NDCG yang dihasilkannya:

weight_i = | NDCG(rank_baru_i) - NDCG(rank_baseline_i) |

Positional discount curve dari paper:

discount(x) = log(2) / log(2 + x)
DCG = SUM_i ( gain_i * discount(i) )
NDCG = DCG / DCG_ideal

### Intuisi

1. **Satu variabel per satu eksperimen.** Switch architecture dari GBDT ke neural network sambil mempertahankan objective L2 yang sama berarti perbandingan jadi adil: satu-satunya yang berubah adalah arsitekturnya. Kalau objective ikut diganti, kamu tidak bisa tahu gain datang dari arsitektur atau dari loss.
2. **Tapi L2 buta posisi.** L2 menganggap semua prediksi salah sama, padahal memindahkan listing dari rank 8 ke rank 1 jauh lebih bernilai daripada rank 3 ke rank 2. Di sinilah delta-NDCG masuk sebagai sample weight: sample yang tidak memperbaiki NDCG dapat bobot mendekati nol, sample yang memperbaiki dapat bobot besar.
3. **Kenapa tidak langsung pakai NDCG sebagai loss.** NDCG non-differentiable. Delta-NDCG sebagai bobot mengarahkan gradien L2 ke arah yang memperbaiki NDCG tanpa mengganti loss signature.
4. **Pelajaran dari KDD 2020.** Saat price dihapus sebagai input feature supaya modelnya lebih mudah ditafsirkan, bookings turun 0.67%. Model bisa lebih baik di satu dimensi dan lebih buruk di dimensi bisnis lain.

### Kode

\`\`\`python
import numpy as np

def positional_discount(x):
    return np.log(2.0) / np.log(2.0 + x)

def dcg(gains):
    gains = np.asarray(gains, dtype=float)
    return float(np.sum(gains * positional_discount(np.arange(len(gains)))))

def ndcg(gains):
    gains = np.asarray(gains, dtype=float)
    ideal = np.sort(gains)[::-1]
    return dcg(gains) / dcg(ideal) if dcg(ideal) else 0.0

# Satu session: 3 listing, satu dibooked (utility 1.0), dua tidak (0.0).
print("DCG booked di posisi 1 :", round(dcg([1, 0, 0]), 4))
print("DCG booked di posisi 3 :", round(dcg([0, 0, 1]), 4))
print("NDCG booked di posisi 1:", round(ndcg([1, 0, 0]), 4))
print("NDCG booked di posisi 3:", round(ndcg([0, 0, 1]), 4))

def delta_ndcg(new_order, labels):
    return abs(ndcg([labels[i] for i in new_order]) - ndcg(labels))

print("bobot rank dipertahankan :", round(delta_ndcg([0, 1, 2], [1, 0, 0]), 4))
print("bobot rank diturunkan   :", round(delta_ndcg([2, 1, 0], [1, 0, 0]), 4))
print("discount x=0,1,2,3      :", np.round([positional_discount(x) for x in range(4)], 4))

d = [positional_discount(x) for x in range(10)]
assert all(d[i] > d[i + 1] for i in range(len(d) - 1)), "discount harus menurun"
assert all(0 < v <= 1 for v in d), "discount harus di (0, 1]"
assert round(ndcg([1, 0, 0]), 10) == 1.0, "permutasi ideal NDCG = 1"
print("checks OK")
\`\`\`

DCG untuk listing yang dibooked di posisi 1 adalah 1.0, di posisi 3 hanya 0.5. Bobot delta-NDCG: urutan dipertahankan dapat 0.0 sehingga gradiennya diabaikan; urutan diturunkan dapat 0.5 sehingga dilatih kuat. Discount values: 1.0, 0.631, 0.500, 0.431.

### Takeaway

1. Ganti satu variabel per eksperimen, atau kamu tidak bisa mengatribusikan gain.
2. Delta-NDCG weighting mengikat L2 regression ke metrik ranking tanpa mengganti loss.
3. Menghapus fitur demi interpretability bisa merusak revenue. Ukur selalu.`,
    tags: "airbnb,ranking,gbdt,deep-learning,ndcg,learning-to-rank",
    source:
      "https://arxiv.org/pdf/1810.09591 (KDD 2019) + https://arxiv.org/pdf/2002.05515 (KDD 2020)",
  },

  // ---------------- Facebook Ads Calibration ----------------
  {
    role: "data-scientist",
    category: "calibration",
    difficulty: "hard",
    question:
      "Model prediksi klik iklan punya AUC 0.96, tapi observed CTR 0.50 sementara rata-rata prediksinya hanya 0.345. Kenapa AUC tinggi tidak berarti model berguna untuk auction, dan bagaimana cara memperbaikinya?",
    answer: `Kasus nyata: **"Practical Lessons from Predicting Clicks on Ads at Facebook"** (Field et al., ADKDD 2014). Dengan 750 juta daily active users dan lebih dari 1 juta advertiser aktif, tim ads Facebook memvalidasi bahwa model CTR harus **well-calibrated** di setiap segmen, bukan sekadar diskriminatif. Kombinasi decision tree plus logistic regression di paper itu mengalahkan masing-masing pendekatan sendiri lebih dari 3%.

### Rumus

Kalibrasi global:

ratio = mean(predict) / mean(observed)

Idealnya 1.0. Ratio 0.69 berarti prediksi secara sistematis terlalu rendah, sehingga bidder akan under-bid dan kehilangan impressions.

**Isotonic regression** per bucket: fit observed CTR untuk tiap bucket prediksi, lalu paksa hasilnya monotonik naik.

### Intuisi

1. **AUC cuma mengukur urutan, bukan magnitude.** AUC menjawab "apakah ranking benar?". Auction membutuhkan "berapa nilai absolut setiap impression?". Model yang ranking-nya benar tapi pCTR-nya 0.69x terlalu rendah berarti bidding terlalu rendah: ranking sempurna, revenue hilang.
2. **Over- dan under-prediksi punya konsekuensi berbeda.** Terlalu tinggi berarti overpay; terlalu rendah berarti kehilangan volume. Karena itu kalibrasi bukan detail akademis, tapi uang.
3. **Kalibrasi per segmen lebih penting daripada global.** Ratio 0.69 secara global masih bisa salah besar di satu device, satu wilayah, atau satu advertiser vertikal.
4. **Isotonic memperbaiki bentuk, bukan level.** Mean(y) berbobot dari data observasi dipertahankan oleh PAV. Kalau model punya bias level yang sistematis, isotonic tidak menyentuhnya; butuh scaling terpisah.

### Kode

\`\`\`python
import numpy as np

# Bucket pCTR model. Observed sengaja tidak monotonik: bucket tengah over-predict,
# bucket atas under-predict. Noise dan sampling error di level CTR memang begitu.
bucket_pred = np.array([0.10, 0.30, 0.50])
bucket_obs = np.array([0.08, 0.42, 0.38])
bucket_n = np.array([1000, 300, 700], dtype=float)   # jumlah event, tidak sama rata

def isotonic(y, w):
    """Pool Adjacent Violators: hasil dijamin monotonik, mean(y) berbobot dipertahankan."""
    level, weight, start = [], [], []
    for i, (yi, wi) in enumerate(zip(y, w)):
        level.append(float(yi)); weight.append(float(wi)); start.append(i)
        while len(level) > 1 and level[-2] > level[-1]:
            nw = weight[-2] + weight[-1]
            level[-2] = (level[-2] * weight[-2] + level[-1] * weight[-1]) / nw
            weight[-2] = nw
            level.pop(); weight.pop(); start.pop()
    out = np.empty(len(y), dtype=float)
    for i, j in zip(start, level):
        out[i:] = j
    return out

# Fit ke OBSERVED, bukan ke prediksi.
cal = isotonic(bucket_obs, bucket_n)
print(f"predicted = {bucket_pred}")
print(f"observed  = {bucket_obs}   <- tidak monotonik")
print(f"isotonic  = {np.round(cal, 4)}   <- monotonik naik")

# Properti 1: mean(y) berbobot dipertahankan.
print(f"mean(y) before = {(bucket_obs @ bucket_n) / bucket_n.sum():.4f}")
print(f"mean(y) after  = {(cal @ bucket_n) / bucket_n.sum():.4f}")

# Properti 2: bucket yang digabung dapat rata-rata BERBOBOT, bukan rata-rata simple.
pooled = (bucket_obs[1] * bucket_n[1] + bucket_obs[2] * bucket_n[2]) / (bucket_n[1] + bucket_n[2])
print(f"bucket 2+3 digabung ke {pooled:.4f}, bukan {bucket_obs[1:].mean():.4f}")

# AUC: mengukur ranking saja, tidak menyentuh magnitude.
def auc(pred, label):
    order = np.argsort(pred, kind="mergesort")
    ranks = np.empty(len(pred), dtype=float)
    ranks[order] = np.arange(1, len(pred) + 1)
    pos, neg = int(label.sum()), int((1 - label).sum())
    return float((ranks[label == 1].sum() - pos * (pos + 1) / 2) / (pos * neg))

pred = np.array([0.05, 0.08, 0.12, 0.20, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75])
click = np.array([0,    0,    0,    0,    1,    0,    1,    1,    1,    1])
print(f"AUC = {auc(pred, click):.2f}, kalibrasi ratio = {pred.mean() / click.mean():.2f}")
\`\`\`

Observed [0.08, 0.42, 0.38] melanggar monotonisitas, PAV menggabungkan bucket 2 dan 3 ke 0.392, bukan 0.400. Pembobotan itu penting: kalau memakai rata-rata simple, bucket dengan 700 event diperlakukan sama dengan yang 300. Di bagian bawah terlihat AUC 0.96 bersamaan dengan kalibrasi ratio 0.69, dua fakta yang tidak boleh dilupakan bersamaan.

### Takeaway

1. AUC tinggi plus kalibrasi buruk = tidak berguna untuk auction.
2. Laporkan kalibrasi ratio di samping AUC, per segmen.
3. Isotonic memperbaiki monotonisitas dan mempertahankan mean observasi; untuk bias level, butuh Platt atau scaling terpisah.`,
    tags: "facebook,ads,calibration,auc,isotonic,auction,ctr",
    source:
      "https://ai.meta.com/research/publications/practical-lessons-from-predicting-clicks-on-ads-at-facebook (Field et al., ADKDD 2014)",
  },

  // ---------------- Booking.com Experimentation ----------------
  {
    role: "data-scientist",
    category: "product-sense",
    difficulty: "medium",
    question:
      "Booking.com menjalankan lebih dari seribu A/B test secara simultan. Bagaimana mereka mencegah eksperimen saling menabrak, dan kenapa mereka memakai interleaving khusus untuk evaluasi search ranking?",
answer: `Kasus nyata: **Booking.com**. Mereka menjalankan ribuan eksperimen per tahun dengan lebih dari seribu eksperimen berjalan bersamaan pada satu waktu. Untuk search ranking, mereka secara sengaja menyelidiki **interleaving** sebagai alternatif A/B test.

### Rumus

Interference diukur lewat apa yang dilihat pengguna pada setiap waktu. Kalau user i sebenarnya sudah ada di arm A eksperimen e1, maka dia hanya boleh Novel satu perlakuan tambahan dari eksperimen lain:
Kalau user i sebenarnya sudah ada di arm A eksperimen e1, maka dia hanya boleh mengalami satu perlakuan tambahan dari eksperimen lain:
PlannedTreatment(i) = Experiment(i) + NovelAdded(i)
NovelAdded(i) = PlannedTreatment(i) - Experiment(i)

Jadi kalau e1 == e2, NovelAdded pasti bukan nol, dan hasil eksperimen tidak lagi bisa diatribusikan ke satu perlakuan saja.

Untuk interleaving sendiri, statistiknya berbasis credit per pasangan item:

credit(a) = jumlah pasangan item di mana a tampil pada posisi lebih tinggi

Posisi dalam satu sesi dihitung dengan discount curve yang sama seperti yang dipakai di model ranking, jadilated benefit posisi atas memang dihargai lebih besar:

discount(i) = log(2) / log(2 + i)

### Intuisi

**Interference.** Dua eksperimen yang mengubah bagian UI yang sama saling memengaruhi. Pengguna di arm A eksperimen 1 juga melihat perubahan dari eksperimen 2, sehingga hasil eksperimen 1 tercemar. Solusinya: mutual exclusion group, atau "plane" bersama. Eksperimen yang berpotensi konflik diuji eksklusif di plane yang sama.

**Interleaving.** Alih-alih memecah traffic ke dua ranker terpisah, kedua ranker diinterleave di satu result list: posisi 1 milik ranker A, posisi 2 milik B, posisi 3 milik A, dan seterusnya. Yang menang adalah yang lebih sering berada di posisi lebih tinggi untuk pasangan item yang sama.

**Kenapa interleaving lebih sensitif.** A/B test pada CTR membutuhkan sampel sangat besar untuk mendeteksi perbedaan kecil, karena perbedaan ranking biasanya halus. Interleaving membandingkan head-to-head pada item yang sama di setiap pasang, sehingga statistical power jauh lebih tinggi pada sampel yang lebih kecil.

**Batasnya.** Interleaving tidak cocok untuk semua hal: hanya mengukur immediate relevance, tidak mengukur long-term retention atau LTV, dan sensitif terhadap presentation bias (pengguna cenderung klik posisi atas karena kebiasaan).

### Kode

\`\`\`python
import numpy as np

# Credit: untuk tiap pasangan item, arm yang tampil lebih tinggi di dapat credit.
def interleaved_credit(ranked_pairs, n_arms=2):
    """ranked_pairs: list ranking per session, index 0..n_arms-1 adalah arm."""
    credit = np.zeros(n_arms)
    for ranking in ranked_pairs:
        for i in range(0, len(ranking) - 1, 2):
            a, b = ranking[i], ranking[i + 1]
            if a != b:
                credit[a] += 1
    return credit

# 5 sessions, arm 0 = ranker produksi, arm 1 = kandidat baru.
sessions = [
    [0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1],
]
credit = interleaved_credit(sessions)
print("credit per arm:", credit)
print("total credit  :", credit.sum())
print("winner        :", int(np.argmax(credit)))
\`\`\`

Credit model bukan statistik inferensi yang lengkap (dalam produksi you'd perlu confidence interval dan uji signifikansi), tapi menunjukkan mekanika dasarnya: setiap pasangan head-to-head menghasilkan satu credit untuk arm yang menang di posisi lebih tinggi. Di produksi, platform seperti ini memakai sifat data yang berpasangan untuk menghitung interval yang lebih ketat daripada A/B test independen.

### Takeaway

1. Interference adalah masalah nyata di platform dengan banyak eksperimen konkuren. Rencanakan exclusion group sejak awal.
2. Interleaving lebih sensitif untuk ranking, tapi tidak untuk metrik long-term atau full funnel.
3. Full-funnel A/B tetap gold standard untuk dampak bisnis. Gunakan keduanya sesuai yang anda butuhkan.`,
    tags: "booking,ranking,interleaving,interference,experimentation,product-sense",
    source:
      "https://ceur-ws.org/Vol-2697/paper3_complexrec.pdf (Mavridis et al., ComplexRec/RecSys 2020)",
  },

  // ---------------- Spotify Discover Weekly ----------------
  {
    role: "ai-engineer",
    category: "recommender",
    difficulty: "medium",
    question:
      "Spotify Discover Weekly dibangun dari hack week 2014 oleh dua engineer, lalu menggabungkan tiga model paralel. Jelaskan peran collaborative filtering, NLP, dan audio CNN, dan kenapa normalisasi vektor itu kritis.",
answer: `Kasus nyata: **Spotify Discover Weekly**. Edward Newett membangun prototipe ini sebagai proyek sampingan di 2014 setelah meyakini bahwa halaman "album jelajahi" terlalu banyak kerja untuk pengguna. Diuji dulu ke seluruh karyawan, lalu 1% pengguna pada awal 2015, lalu곤고 penuh ke sekitar 100 juta pengguna aktif di pertengahan 2015. Refresh 100 juta playlist setiap Minggu dengan sekitar satu terabyte data baru.

### Rumus

Collaborative filtering berbasis vektor count:

sim(user_A, user_B) = ( u_A . u_B ) / ( ||u_A|| * ||u_B|| )

Untuk audio, vektor track berisi karakteristik seperti tempo, loudness, key, time signature, dan acousticness.

### Intuisi

1. **Collaborative filtering menjawab "user seperti kamu".** Vektor user dibangun dari apa yang dia stream. Dua user dengan profil genre serupa punya kemiripan tinggi; rekonstruksinya: rekomendasikan lagu yang didengar user lain tapi belum didengar user ini. Ini memakai implicit feedback (stream count), tidak perlu explicit rating, dan itu kelemahannya sekaligus: tidak ada sinyal negatif eksplisit dari skip.

2. **NLP menutup gap metadata.** Dua lagu dianggap mirip kalau artikel web atau bio artisnya sering muncul bersama. Ini berguna untuk lagu dan artis baru yang belum punya stream data tapi sudah punya web presence.
3. **Audio CNN menutup gap cold start paling dalam.** CNN di atas spectrogram mengekstrak fingerprint audio. Lagu baru belum punya stream, tapi sudah punya file audio yang bisa dianalisis. Ini satu-satunya dari tiga sinyal yang tersedia sebelum data interaksi apa pun.
4. **Normalisasi vektor bukan detail teknis.** Tanpa L2 normalization, user dengan 100 kali jumlah streaming mendominasi dot product. Peringkat rekomendasi berubah karena popularitas, bukan relevansi.

### Kode

\`\`\`python
import numpy as np

def cosine(a, b):
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

# Collaborative filtering: vektor user = jumlah streaming per genre (pop, jazz, klasik).
user_aku = np.array([30.0, 10.0, 0.0])
user_sejawat = np.array([20.0, 18.0, 2.0])
print("kemiripan user (CF)     :", round(cosine(user_aku, user_sejawat), 3))

# Audio features: vektor track dari CNN atas spectrogram.
track_a = np.array([0.90, 0.20, 0.05])
track_b = np.array([0.15, 0.80, 0.60])
print("kemiripan track (audio) :", round(cosine(track_a, track_b), 3))

# Tanpa normalisasi, besaran count mendominasi: popularitas menimpa relevansi.
genres = np.array([[3000.0, 1000.0, 100.0],
                   [100.0, 3000.0, 100.0]])
print("dot product RAW    :", user_aku @ genres.T)

unit = genres / np.linalg.norm(genres, axis=1, keepdims=True)
print("setelah normalisasi:", np.round(user_aku @ unit.T, 3))

# CF hanya bisa beroperasi pada yang sudah pernah didengar, jadi butuh filter
# noveltase supaya playlist untuk discovery benar-benar memberi kejutan.
sudah_didengar = {"Lagu A", "Lagu B"}
kandidat = ["Lagu A", "Lagu C", "Lagu D", "Lagu B", "Lagu E"]
print("playlist (potongan):", [s for s in kandidat if s not in sudah_didengar][:3])
\`\`\`

Kemiripan user CF 0.914 (kedua user memang profilnya mirip: pop-dominant), kemiripan track audio 0.348 (kedua track itu memang tidak mirip). Yang penting adalah baris normalisasi: dot product mentah menghasilkan [100000, 33000], jadi pop menang telak murni karena besarannya, sedangkan setelah normalisasi jadi [31.607, 10.988] yang proporsional terhadap kesamaan minat.

### Takeaway

1. Tiga sumber sinyal saling melengkapi; masing-masing menutup gap cold start yang tidak bisa ditutup yang lain.
2. Normalisasi vektor menentukan apakah sistem mengukur relevansi atau sekadar popularitas.
3. Filter noveltase wajib untuk rekomendasi bertipe discovery, karena CF sendiri hanya bisa merekomendasikan yang sudah dikenal.`,
    tags: "spotify,discover-weekly,collaborative-filtering,audio-cnn,normalisasi,cosine",
    source:
      "https://spectrum.ieee.org/the-little-hack-that-could-the-story-of-spotifys-discover-weekly-recommendation-engine (IEEE Spectrum 2021) + talk @Scale 2021",
  },
];
