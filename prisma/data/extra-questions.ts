export type SeedQuestion = {
  role: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  tags: string;
  // Jejak asal materi (URL/artikel) supaya konten bisa diverifikasi, bukan hasil hafalan model.
  source?: string;
};

export const extraQuestions: SeedQuestion[] = [
  // ---------------- Data Scientist ----------------
  {
    role: "data-scientist",
    category: "probability",
    difficulty: "easy",
    question: "Apa perbedaan distribusi Bernoulli dan Binomial?",
    answer: `Distribusi **Bernoulli** menggambarkan satu percobaan dengan dua hasil: sukses (1) atau gagal (0). X ~ Bernoulli(p), dengan E[X] = p dan Var(X) = p(1-p).

Distribusi **Binomial** adalah jumlah sukses dari n percobaan Bernoulli independen dengan probabilitas sukses sama tiap percobaan: X ~ Binomial(n, p), dengan E[X] = np dan Var(X) = np(1-p).

Jadi Binomial adalah penjumlahan dari n variabel Bernoulli i.i.d. Bernoulli = kasus khusus Binomial dengan n = 1.`,
    tags: "probability,distribusi,bernoulli,binomial",
  },
  {
    role: "data-scientist",
    category: "probability",
    difficulty: "medium",
    question: "Jelaskan beda antara probability dan likelihood.",
    answer: `Keduanya bentuk matematis yang sama (fungsi kepadatan peluang), tapi yang ditetapkan dan yang dilihat berbeda.

- **Probability**: parameter sudah diketahui, kita menghitung peluang sebuah hasil/event. Fungsi data, dijumlahkan/integralkan = 1.
- **Likelihood**: data sudah diamati, kita mengevaluasi seberapa baik setiap nilai parameter menjelaskan data itu. Fungsi parameter, tidak perlu berjumlah 1.

Contoh: dari koin dengan p = 0.5, peluang muncul 2 gambar dari 3 lemparan adalah P(data | p). Sedangkan likelihood menguji: jika saya melihat 2 gambar dari 3 lemparan, seberapa "masuk akal" p = 0.5 vs p = 0.8. MLE memilih p yang memaksimalkan likelihood ini.`,
    tags: "probability,likelihood,mle,inference",
  },
  {
    role: "data-scientist",
    category: "ab-testing",
    difficulty: "medium",
    question: "Apa kesalahan umum dalam menginterpretasikan p-value pada uji A/B?",
    answer: `Kesalahan paling umum: menafsirkan p-value sebagai "peluang H0 benar" atau "peluang efek-nya tidak nyata". Itu salah.

p-value adalah peluang melihat hasil seekstrem (atau lebih ekstrem dari) yang teramati, **dengan asumsi tidak ada efek nyata (H0 benar)**. p = 0.02 bukan berarti 2% kemungkinan H0 benar, dan bukan pula ukuran besar kecilnya efek.

Dampak praktisnya:
1. Hentikan analisis pada p < 0.05 tanpa melihat effect size dan confidence interval.
2. Report hasil eksperimen selalu: estimasi efek, CI-nya, ukuran sampel, dan alpha yang dipakai.
3. Awasi multiple comparison dan penghentian dini (peeking): re-check p-value berulang kali menaikkan false positive.`,
    tags: "ab-testing,p-value,hipotesis,eksperimen",
  },
  {
    role: "data-scientist",
    category: "ab-testing",
    difficulty: "hard",
    question: "Bagaimana menghitung ukuran sampel yang dibutuhkan sebelum menjalankan A/B test?",
    answer: `Sebelum eksperimen, tentukan empat input:

1. **Baseline conversion** (mis. 5% sekarang).
2. **Minimum Detectable Effect (MDE)**: efek terkecil yang masih dianggap layak dikejar (mis. naik 5% relatif). Semakin kecil MDE, semakin besar sampel.
3. **Significance level (α)**, biasanya 0.05.
4. **Power (1-β)**, biasanya 0.8: peluang mendeteksi efek sebesar MDE bila benar-benar ada.

Dengan asumsi normal, besar sampel tiap grup kira-kira:
n = ((Z_{α/2} + Z_β)^2 * 2 * p_bar(1-p_bar)) / δ²

dengan p_bar = rata-rata kedua konversi dan δ = beda absolut minimum yang ingin dideteksi.

Catatan penting:
- **Peeking** (melihat data sebelum durasi selesai dan menghentikan lebih awal) melanggar asumsi dan menggelembungkan false positive. Tetapkan durasi di awal.
- Power rendah = eksperimen "insignificant" padahal mungkin efeknya nyata tapi sampel kekecilan. Beda antara "tidak ada efek" dan "tidak terdeteksi efek".
- Untuk metrik kontinu (revenue), hitung dengan varians metrik, bukan proporsi.`,
    tags: "ab-testing,sample-size,power,mde",
  },
  {
    role: "data-scientist",
    category: "product-sense",
    difficulty: "easy",
    question: "Bedakan north-star metric dan vanity metric. Beri contoh.",
    answer: `**North-star metric** satu metrik yang paling mewakili nilai yang diberikan produk ke user dan berkorelasi dengan pertumbuhan jangka panjang. Ia bisa diarahkan lewat aksi nyata user. Contoh: WhatsApp = pesan terkirim/minggu, Dropbox = file tersimpan/minggu, Spotify = waktu dengarkan.

**Vanity metric** terlihat bagus di dashboard tapi tidak menggambarkan nilai produk dan tidak terdorong oleh satu perilaku utama. Contoh: total download, jumlah akun terdaftar, jumlah pageview tanpa aksi.

Ujian cepat: "Kalau metrik ini naik 10%, apakah produk pasti makin baik?" Download naik tapi user tidak kembali = vanity. Session aktif per user yang bertambah = north-star yang jujur.`,
    tags: "product-sense,metrik,north-star",
  },
  {
    role: "data-scientist",
    category: "product-sense",
    difficulty: "medium",
    question: "Saat A/B test, kamu punya metrik utama dan guardrail metrics. Apa gunanya yang terakhir?",
    answer: `Metrik utama mengukur apakah fitur baru mencapai tujuan (mis. konversi naik). **Guardrail metrics** memastikan kenaikan itu tidak merusak bagian lain produk.

Contoh guardrail: revenue per user, latency API, retention, tingkat trust/keluhan, error rate. Kasus klasik: fitur yang menaikkan konversi tapi asal push notifikasi mengganggu sampai pengguna uninstall. Secara statistik konversi naik, secara bisnis lebih rugi.

Cara memakainya:
- Definisi guardrail (ambang toleransi, mis. latency tidak boleh naik >5%) ditetapkan **sebelum** eksperimen, bukan setelah melihat data.
- Lihat guardrail bersama metrik utama; jangan dilaporkan terpisah.
- Kalau guardrail dilanggar sementara metrik utama naik, dari kasus ke kasus keputusan diambil manual, bukan otomatis "lanjut".`,
    tags: "product-sense,ab-testing,guardrail,eksperimen",
  },
  {
    role: "data-scientist",
    category: "feature-engineering",
    difficulty: "medium",
    question: "Apa risiko target encoding dan bagaimana memitigasinya?",
    answer: `Target encoding mengganti kategori dengan rata-rata target di dalamnya (mis. rata-rata churn per kota). Masalah utama: **leakage dan overfitting**.

Jika encoding dihitung dari data yang sama yang dipakai untuk training, model bisa "menghafal" nilai target per kategori: kategori dengan sedikit sampel mendapat encoding ekstrem. Akibatnya skor validasi bagus tapi performa produksi jelek.

Mitigasi:
1. Hitung encoding hanya dari training set (fold), terapkan ke test; jangan hitung dari gabungan data.
2. Gunakan CV atau out-of-fold encoding: encoding dihitung di luar fold yang sedang dilatih.
3. Smoothing: tarik mean kategori ke arah global mean berdasarkan bobot ukuran sampel (bayesian: target_mean = (n_c * mean_c + m * global)/(n_c + m)).
4. Tambah noise kecil untuk data dengan sampel sedikit, atau drop kategori yang sangat jarang.`,
    tags: "feature-engineering,encoding,leakage,overfitting",
  },
  {
    role: "data-scientist",
    category: "feature-engineering",
    difficulty: "hard",
    question: "Bagaimana menangani class imbalance yang parah pada klasifikasi biner?",
    answer: `1. **Ukur dengan metrik yang tepat dulu.** Akurasi menyesatkan: dengan rasio 99:1, model yang selalu memprediksi kelas mayoritas mendapat 99% padahal tidak berguna. Pakai precision-recall, PR-AUC, F1, atau metrik yang menghitung biaya salah prediksi tiap kelas.

2. **Periksa data sebelum mencari teknik.** Lihat dulu apakah sebagian besar false negatives benar-benar salah. Imbalance kadang bukan masalah; yang membuatnya jadi masalah adalah label yang salah atau fitur yang tidak informatif.

3. **Teknik dengan dampak terbesar ada di sisi model:**
   - class weights (penalti lebih besar untuk minoritas): hampir selalu pilihan pertama.
   - threshold tuning: prediksi = minoritas jika p > t, lalu geser t mengikuti kurva precision-recall, jangan kaku di 0.5.

4. **Resampling dikerjakan hati-hati**: oversampling (SMOTE) memproduksi data sintetis yang bisa overfit dan menanam distribusi palsu; undersampling membuang data nyata. Anggap pelengkap, bukan kewajiban.

5. **Masukkan biaya nyata**: untuk kasus seperti fraud, harga false positive vs false negative harus menentukan threshold, bukan sekadar akurasi.

Urutan yang salah: langsung SMOTE lalu akurasi. Urutan yang benar: metrik tepat, class weight, baru tuning threshold.`,
    tags: "feature-engineering,imbalance,smote,metrik",
  },
  {
    role: "data-scientist",
    category: "model-evaluation",
    difficulty: "medium",
    question: "Kapan lebih baik pakai PR-AUC daripada ROC-AUC?",
    answer: `ROC-AUC menghitung trade-off antara TPR (recall) dan FPR. FPR memakai true negatives, yang biasanya sangat banyak di masalah imbalance.

Jika kelas positif sangat jarang (mis. 1% fraud), ROC-AUC bisa terlihat bagus hanya karena FPR rendah ketika negatif mendominasi, padahal precision model di kelas minoritas buruk. FPR = FP/(FP+TN) dengan TN raksasa membuat baseline terlihat mudah.

**Precision-Recall curve** tidak memakai true negatives sama sekali, hanya precision (kaya akan FP) dan recall. Itu sebabnya PR-AUC lebih sensitif dan jujur saat positif langka.

Aturan praktis:
- Class balance mendekati 50/50: ROC-AUC cukup informatif.
- Positif langka atau **biaya FP dan FN tidak simetris** (fraud, kasus langka medis): utamakan PR-AUC.

Tambahan: ROC naik > 0.95 dengan 1% positif sering tidak menandakan apa-apa; cek PR-AUC dan lihat precision pada threshold yang dipakai.`,
    tags: "model-evaluation,auc,precision-recall,imbalance",
  },
  {
    role: "data-scientist",
    category: "ml-theory",
    difficulty: "medium",
    question: "Kenapa cross-validation penting dan apa gunanya stratification?",
    answer: `Cross-validation membagi data menjadi k bagian (fold), melatih k kali dengan masing-masing fold sebagai validasi. Tujuannya: estimasi generalisasi model jauh lebih stabil daripada mengandalkan satu split train/test saja.

Kenapa penting:
1. Mengecilkan pengaruh keberuntungan split: satu split buruk bisa buat model terlihat jelek (atau bagus) menyesatkan.
2. Menilai varians performa antar fold, bukan cuma satu angka.
3. Membantu membandingkan konfigurasi model (tuning hyperparameter) dengan ukuran yang konsisten.

**Stratification** memastikan tiap fold mempertahankan proporsi kelas yang mirip dengan populasi. Krusial saat kelas imbalance: tanpa stratifikasi, ada fold yang bisa kehilangan hampir semua sampel positif, sehingga skor valid abnormal.

Catatan praktis: stratification juga berguna saat balancing konteks waktu (mis. fold harus menghormati urutan waktu), tetapi itu kfold biasa yang diedit, bukan stratifikasi kelas murni.`,
    tags: "ml-theory,cross-validation,stratifikasi,validation",
  },

  // ---------------- AI Engineer ----------------
  {
    role: "ai-engineer",
    category: "llm",
    difficulty: "easy",
    question: "Kenapa arsitektur Transformer menggantikan RNN untuk bahasa?",
    answer: `Saat bisa: bisa dijalankan sekaligus memproses seluruh urutan dengan **self-attention**, sedangkan RNN memproses token berurutan satu per satu.

Perbedaan kunci:
1. **Parallelisasi**: seluruh token diproses bersamaan, sehingga pelatihan jauh lebih cepat di GPU (RNN bergantung pada langkah sebelumnya).
2. **Jarak jauh (long-range dependency)**: setiap token "memperhatikan" semua token lain secara langsung; RNN mengandalkan state yang rentan vanishing/exploding gradient untuk data panjang.
3. **Skalabilitas**: arsitektur ini terbukti naik sampai ratusan miliar parameter (GPT, Claude, Gemini).

Fondasi transformer: self-attention, multi-head attention (menangkap tipe relasi berbeda), feed-forward per posisi, dan positional encoding karena tidak ada recurrency untuk menyuntikkan urutan.`,
    tags: "llm,transformer,rnn,arsitektur",
  },
  {
    role: "ai-engineer",
    category: "llm",
    difficulty: "medium",
    question: "Apa itu tokenization dan kenapa memengaruhi biaya serta kualitas LLM?",
    answer: `Tokenization memecah teks menjadi unit subword (token) sebelum masuk model. Model yang berbeda memakai tokenizer berbeda: BPE, WordPiece, atau SentencePiece.

Kenapa ini penting buat AI engineer:
- **Biaya**: hampir semua provider API menjual per token. Prompt efisien = lebih murah.
- **Batas konteks**: input panjang memakai kuota token, meninggalkan ruang lebih kecil untuk output.
- **Non-English**: bahasa lain sering memakai token per kata lebih banyak (2-3x), jadi jawaban Indonesia kelihatan lebih mahal dan lebih gampang kena limit.
- **Kode dan format**: spasi, indentasi, dan simbol menyumbang token.
- **Jangan berasumsi 1 kata = 1 token**: "chatGPT" bisa 1-3 token tergantung tokenizer.

Patokan umum: sekitar 4 karakter ≈ 1 token untuk teks English.`,
    tags: "llm,tokenization,biaya,konteks",
  },
  {
    role: "ai-engineer",
    category: "rag",
    difficulty: "medium",
    question: "Jelaskan langkah-langkah pipeline RAG produksi.",
    answer: `RAG menggabungkan retrieval (pencarian) dengan generation (LLM). Alur:

Indeks:
Dokumen → chunking → embedding → vector DB

Saat query:
User query → embed query → similarity search → top-K chunks → (opsional) reranker → prompt (sistem + chunk relevan + query) → LLM → jawaban

Keputusan di tiap tahap:
1. **Chunking**: ukuran tetap (mis. 512 token), semantik (batas paragraf), atau recursive (header → paragraf → kalimat).
2. **Embedding model**: pilih yang cocok domain; kadang perlu fine-tune embedding untuk data khusus (medis, legal).
3. **Vector DB**: pilihan populer: pgvector (pakai Postgres yang sudah ada), Pinecone (managed), Qdrant, Weaviate, Milvus.
4. **Similarity**: cosine similarity paling umum, lalu dot product, Euclidean.
5. **Top-K**: biasanya 3-10 chunk. Lebih banyak bukan berarti lebih baik; noise mengencerkan sinyal.
6. **Reranker** (cross-encoder) menata ulang hasil retrieval awal untuk relevansi yang lebih baik.

RAG lawan dari: berharap model punya data terbaru atau domain-spesifik.`,
    tags: "rag,pipeline,embedding,vektor,retrieval",
  },
  {
    role: "ai-engineer",
    category: "rag",
    difficulty: "hard",
    question: "Sebutkan failure mode umum RAG dan perbaikannya.",
    answer: `| Gejala | Penyebab | Perbaikan |
|---|---|---|
| Relevansi terputus antar chunk | chunking buruk | overlap chunk (mis. 20%), chunking semantik per paragraf |
| Dokumen salah diretri | embedding mismatch | fine-tune embedding di data domain, pakai hybrid search |
| Jawaban benar tapi tidak lengkap | konteks kurang | naikkan top-K, filter metadata, parent-document retriever |
| Halusinasi walau konteks ada | LLM mengabaikan dokumen | system prompt dipertegas ("jawab hanya dari konteks"), turunkan temperature |
| Jawaban merujuk data lama | indeks basi | pipeline indexing inkremental, metadata freshness |
| Model "lupa" chunk di tengah | lost in the middle | letakkan chunk paling relevan di awal dan akhir (primacy/recency bias) |

Prinsip diagnosa: pisahkan mana yang gagal, retrieval atau generation. Kalau retrieval-nya salah, LLM sekeras apa pun tidak akan menyelamatkan. Evaluasi dua segmen itu terpisah: hitung recall@k untuk retrieval, dan nilai jawaban dengan konteks yang sudah benar.`,
    tags: "rag,debugging,halusinasi,retrieval",
  },
  {
    role: "ai-engineer",
    category: "prompt-engineering",
    difficulty: "medium",
    question: "Strategi prompting apa saja yang kamu kenal dan kapan memakainya?",
    answer: `- **Zero-shot**: instruksi saja, tanpa contoh. Untuk tugas sederhana atau model yang sudah kuat.
- **Few-shot**: beri 2-5 contoh di prompt. Saat format atau gaya jawaban penting.
- **Chain-of-Thought (CoT)**: "berpikir langkah demi langkah". Untuk aritmetika, logika, reasoning bertingkat.
- **Self-consistency**: generate beberapa jalur pemikiran lalu ambil mayoritas. Saat kebenaran adalah prioritas.
- **ReAct**: interleaving "Reason" dengan "Action" (memanggil tool/pencarian). Untuk agent yang butuh tool eksternal.
- **Tree-of-Thought**: menjelajah banyak jalur reasoning. Untuk problem solving kompleks.

Aturan pemilihan: mulai dari yang termurah (zero-shot), naik minimal yang memenuhi syarat. Jangan langsung few-shot 5 contoh untuk tugas yang zero-shot sudah cukup.`,
    tags: "prompt-engineering,zero-shot,few-shot,cot",
  },
  {
    role: "ai-engineer",
    category: "prompt-engineering",
    difficulty: "medium",
    question: "Bagaimana menyusun system prompt untuk produksi?",
    answer: `Struktur yang terbukti:

1. **Definisi peran**: "Kamu adalah agen support produk X".
2. **Batasan perilaku**: "Jangan pernah menyebut harga internal. Selalu sopan."
3. **Format output**: "Balas JSON dengan field: answer, confidence, sources".
4. **Guardrails**: "Jika tidak tahu, bilang 'saya alihkan ke manusia'."
5. **Contoh**: 1-2 contoh jawaban ideal.

Prinsip:
- Letakkan instruksi terpenting di paling awal (primacy effect).
- Eksplisit apa yang TIDAK boleh dilakukan, bukan hanya yang boleh.
- Uji secara adversarial (coba injeksi prompt).
- Prompt itu kode: versi-kan, review, dan simpan history perubahannya.

Sisakan pemisah yang jelas antara system prompt dan input user (delimiter), dan validasi output sesuai schema sebelum dipakai lebih lanjut.`,
    tags: "prompt-engineering,system-prompt,produksi,guardrail",
  },
  {
    role: "ai-engineer",
    category: "fine-tuning",
    difficulty: "medium",
    question: "Kapan kamu memilih prompt engineering, RAG, atau fine-tuning?",
    answer: `Urutan keputusan dari termurah ke termahal:

- **Prompt engineering**: ubah instruksi/format saja. Cepat, murah, tanpa data pelatihan. Untuk sebagian besar tugas cukup.
- **RAG**: data berubah sering, atau butuh keputusan berdasar dokumen internal/kini (produk, legal, FAQ) yang bisa dilacak ke sumber. Tidak ada retraining; update database cukup. Ini pola produksi yang paling umum.
- **Fine-tuning**: mengganti perilaku/stil/nada model (format output khusus, istilah internal konsisten, bahasa tertentu), atau meningkatkan akurasi pada tugas tetap yang volume-nya besar, dan kamu punya cukup data berlabel.

Sering diambil bersamaan: fine-tune untuk format/nada, RAG untuk fakta terkini. Fine-tuning tidak menambah fakta baru seperti RAG dan butuh data + biaya + proses evaluasi berkala.

Jangan langsung fine-tune: mulai dari prompt, tambah RAG saat butuh fakta, baru fine-tune saat (dan hanya saat) keduanya tidak cukup.`,
    tags: "fine-tuning,rag,prompt-engineering,decision",
  },
  {
    role: "ai-engineer",
    category: "fine-tuning",
    difficulty: "medium",
    question: "Apa itu LoRA dan kenapa efisien untuk fine-tuning LLM?",
    answer: `LoRA (**Low-Rank Adaptation**) fine-tune hanya menambahkan matriks weight baru yang ber-rank rendah (mis. r = 8-64), sementara semua bobot pre-trained dibekukan.

Ide: perubahan yang dibutuhkan saat adaptasi berada di subruang berdimensi rendah, cukup diwakili dua matriks kecil A x B ≈ ∆W.

Kenapa efisien:
1. Parameter yang dilatih jauh lebih sedikit: mis. <1% dari bobot model, bukan milyaran.
2. Memory dan VRAM turun drastis; fine-tune model 7B jadi mungkin di satu GPU konsumen.
3. Adapter kecil (ratusan MB) sebagai artefak terpisah; ganti task = ganti adapter, model dasar tetap.
4. Inferences hampir tanpa tambahan latency (adapter bisa di-fuse ke bobot utama sesudah training).

Alternatif dari PEFT lain: adapters (berurutan tiap layer), prefix/prompt tuning (tensor prompt yang dilatih). Berlaku prinsip yang sama: sedikit parameter terlatih, model besar beku.`,
    tags: "fine-tuning,lora,peft,efisiensi",
  },
  {
    role: "ai-engineer",
    category: "agents",
    difficulty: "easy",
    question: "Apa beda AI agent dengan LLM chain sederhana?",
    answer: `**Chain** menjalankan langkah yang sudah ditentukan oleh engineer dari awal: prompt A → output → prompt B → output. Flow statis; tidak ada keputusan di tengah jalan.

**Agent** membuat keputusan sendiri di tiap langkah: LLM menentukan aksi berikutnya berdasarkan state dan hasil aksi sebelumnya (perencanaan, eksekusi, observasi, perencanaan lagi).

Perbedaan inti:

| | Chain | Agent |
|---|---|---|
| Flow | urutan tetap | dinamis diputuskan LLM |
| Tool | tidak ada / statis | bisa memanggil API, pencarian, eksekusi kode |
| State | tidak dipertahankan antar langkah | dipertahankan antar aksi |
| Otonomi | rendah | tinggi |

Loop utama agent: sementara belum selesai → LLM memutuskan (observasi, tool, history) → eksekusi → observasi hasil → sampai mencapai jawaban akhir.

Aturan praktis: pakai chain jika langkahnya berapa pun yang pasti; pindah ke agent hanya jika langkahnya tidak bisa diprediksi sebelumnya (riset multi-sumber, mengulang tindakan berdasarkan hasil). Agent = lebih fleksibel, tapi lebih sulit diprediksi dan diuji.`,
    tags: "agents,chain,arsitektur,looping",
  },
  {
    role: "ai-engineer",
    category: "guardrails",
    difficulty: "hard",
    question: "Bagaimana melindungi aplikasi LLM dari prompt injection?",
    answer: `Prompt injection = input user mencoba memanipulasi system prompt atau alat yang tersedia. Pertahanan bertingkat (defense in depth), tidak ada satu pun yang sempurna:

1. **Validasi input**: panjang dibatasi, pola serangan diketahui disaring, input disanitasi.
2. **Isolasi delimiter**: pisahkan tegas sistem vs input user, dan perlakukan teks user sebagai "data", bukan instruksi.
3. **Validasi output**: cocokkan hasil LLM dengan schema/format yang diharapkan sebelum dieksekusi (parsing ketat, whitelist).
4. **Least privilege**: tool yang bisa dipanggil LLM diberi permission minimum; agent tidak diberi akses yang tidak perlu.
5. **Dual-LLM**: satu model menghasilkan, model lain memfilter/memeriksa.
6. **Instruction hierarchy**: gunakan fitur model yang mengutamakan system prompt atas konten user.
7. **Canary tokens**: sisipkan token rahasia di system prompt; jika muncul di output, kemungkinan prompt yang bocor.

Yang terpenting: jangan pernah andalkan satu lapis; anggap akan diserang, dan uji adversarial secara rutin (red team).`,
    tags: "guardrails,security,prompt-injection,red-team",
  },

  // ---------------- ML Engineer ----------------
  {
    role: "ml-engineer",
    category: "inference",
    difficulty: "medium",
    question: "Kenapa batching inference menaikkan throughput tapi bisa menaikkan latency?",
    answer: `Inference pada satu request memanfaatkan GPU dengan sangat buruk: GPU punya ribuan core, model besar, satu sample kecil. **Batch** menggabungkan banyak request dalam satu forward pass sehingga waktu komputasi rata-rata per sample turun drastis; throughput (sample/detik) naik berlipat.

Konsekuensi untuk latency:
- Throughput naik, tapi **latency per request naik** karena request harus menunggu lebih lama dikumpulkan menjadi batch (batching delay), dan giliran eksekusi lebih lambat.
- Ada trade-off head-of-line: request cepat ikut tertahan request yang lambat atau besar.

Praktik:
- **Dynamic batching**: kumpulkan request selama window kecil (mis. 32ms) lalu eksekusi satu batch; window singkat ini menekan tambahan latency.
- Padding: token terpanjang menentukan durasi batch; batch berisi teks pendek dicampur panjang tidak efisien.
- Ukur sendiri: umumnya throughput naik agregat, tetapi SLO latency p90 harus diverifikasi pada load produksi.

Kalau konsumen butuh latency sangat rendah: batching kecil, runtime tersendiri, atau model kecil.`,
    tags: "inference,batching,latency,throughput,serving",
  },
  {
    role: "ml-engineer",
    category: "inference",
    difficulty: "medium",
    question: "Apa trade-off quantisasi model untuk inference?",
    answer: `Quantisasi memampatkan bobot (dan kadang aktivasi) dari FP32/FP16 ke presisi lebih rendah seperti INT8, INT4, atau FP8. Trade-off utamanya:

**Keuntungan**:
- **Ukuran model turun** (mis. INT8 = seperempat FP32), biaya penyimpanan dan transfer turun.
- **Kecepatan naik** pada hardware yang punya int8 fast path (GPU modern, CPU), VRAM/heap terpakai turun sehingga lebih banyak batch.
- Bisa menjalankan model besar di perangkat yang lebih kecil (edge, mobile).

**Biaya**:
- **Akurasi berpotensi turun**, terutama: tugas numerik (code, math), model kecil (margin kecil lebih rapuh), hidden activations ekstrem (outlier).
- Perlu **calibration** (pilih range representasi valid) dan evaluasi; kadang butuh mixed precision (bobot INT8, lapisan penting tetap FP16).
- Adaptasi double: INT4 tanpa perlu kalibrasi lanjut lebih murah tapi lebih berisiko.

Aturan praktis: coba quantisasi termurah yang masih lolos metrik evaluasi di benchmark representatif; kalibrasi dan validasi pada data nyata, bukan sekadar cek size-nya turun.`,
    tags: "inference,quantization,presisi,serving",
  },
  {
    role: "ml-engineer",
    category: "feature-store",
    difficulty: "medium",
    question: "Apa itu feature store dan masalah apa yang ia selesaikan?",
    answer: `Feature store adalah lapisan pusat untuk menghitung, menyimpan, dan menyajikan fitur ML secara konsisten di training dan serving.

Masalah inti yang dipecahkan: **train/serve skew**. Di banyak tim, fitur dihitung dua kali dengan kode berbeda: notebook untuk training vs kode backend untuk serving. Hasilnya beda: missing value ditangani lain, waktu dihitung lain, unit beda, dan model yang terlihat akurat saat training meleset di produksi.

Fungsi utama:
1. **Satu definisi fitur** dipakai training dan serving (anti skew).
2. **Point-in-time correctness**: setiap baris training hanya melihat fitur dari masa lalu, tanpa bocoran masa depan (memakai timestamp).
3. **Online store & offline store** dari logika yang sama: offline untuk training batch, online (latency rendah) untuk serving request.
4. **Reuse fitur antar tim**: fitur yang sudah pernah dirancang tidak dihitung ulang dengan cara yang berbeda-beda.

Kalau proyek masih kecil, feature store bukan kebutuhan pertama: mulai dari fungsi pendefinisian fitur bersatu + timestamps; tambah store saat ada banyak model atau skew mulai terasa.`,
    tags: "feature-store,train-serving-skew,point-in-time",
  },
  {
    role: "ml-engineer",
    category: "data-pipelines",
    difficulty: "medium",
    question: "Jenis pemeriksaan kualitas data apa yang wajib ada sebelum model dipakai?",
    answer: `Inti kualitas data: mencegah lebih murah daripada mengoreksi. Data rusak yang lolos ke model jauh lebih mahal untuk diinvestigasi daripada dicegah di pipeline. Pemeriksaan wajib:

1. **Schema & tipe**: kolom ada, tipe betul, kolom baru/kurang terdeteksi (fail fast).
2. **Null dan empty**: null rate per kolom menjulang/berubah tiba-tiba.
3. **Rentang masuk akal**: umur 5-120 tahun, suhu dalam batas fisik; nilai di luar = sinyal bug.
4. **Distribusi fitur**: perbandingan statistik (mean, quantile, kardinalitas) antara data masuk vs ekspektasi history (monitor drift).
5. **Uniqueness & referential**: primary key unik, foreign key terpenuhi, join tidak menggandakan baris diam-diam.
6. **Ekspektasi pada label target**: proporsi kelas, format label, jumlah kelas yang wajar.

Implementasi: susun assertion di DAG (dbt test, Great Expectations, atau fungsi assert sederhana), fail pipeline (bukan cuma warning) untuk kesalahan yang jelas, dan alert berisi langkah diagnosa untuk perubahan halus.`,
    tags: "data-pipelines,kualitas,-data,validation,schema",
  },
  {
    role: "ml-engineer",
    category: "data-pipelines",
    difficulty: "hard",
    question: "Skema data upstream berubah. Bagaimana kamu melakukan backfill tanpa merusak model?",
    answer: `Konteks: schema berubah atau bug di writer ditemukan, sehingga data history perlu dihitung ulang. Risiko: versi model yang sedang produksi dilatih di data lama; mengganti semua data sekaligus bisa mengubah distribusi dan membuat performa produksi tidak bisa dibandingkan.

Prosedur yang aman:

1. **Buat versi data eksplisit**: tulis data ke tabel/path baru (data_v2) dengan tanggal dan hash skema. Jangan overwrite history in-place.
2. **Pertahankan lineage**: catat versi data + versi kode feature + versi skema yang membuatnya, supaya model bisa dilacak balik ke data mana ia dilatih.
3. **Backfill idempotent**: pipeline bisa dijalankan ulang dan menghasilkan hasil identik (upsert dengan primary key, tanpa efek ganda baris).
4. **Latih model baru di data_v2, evaluasi silang**: bandingkan offline metrics model baru (data_v2) dengan reproduksi model lama (data_v1) pada dataset holdout yang sama. Kalau metrik berubah drastis, ada masalah distribusi/bug, bukan sekadar update.
5. **Shadow / canary di produksi**: deploy model baru dalam shadow, bandingkan prediksi dengan produksi, lalu cutover bertahap.
6. **Rollback plan**: karena data lama masih ada, revert model + data terpisah.

Poin terpenting: jangan pernah mutasi history tanpa versi dan tanpa evaluasi.`,
    tags: "data-pipelines,backfill,lineage,versioning",
  },
  {
    role: "ml-engineer",
    category: "drift",
    difficulty: "medium",
    question: "Bedakan data drift dan concept drift. Kenapa penting?",
    answer: `- **Data drift** (atau covariate shift): distribusi **input** X berubah. Contoh: user produk berubah dari siang ke malam, atau kebijakan harga mengubah fitur harga. P(X) berubah, P(y|X) tidak harus berubah.
- **Concept drift**: hubungan antara input dan target berubah. P(y|X) berubah. Contoh: pembeli mulai membandingkan harga meski pola pembelian sama (model lama menilai wajar, padahal sekarang tidak), atau tren fashion mengubah "produk yang dibeli biasanya".

Kenapa penting: deteksi dan penanganannya beda.
- Data drift → cek kalibrasi ulang/retrain karena model belum tentu rusak; feature baru bisa jadi perlu.
- Concept drift → model memang basi; retrain mandatori, kadang perlu fitur/fitur baru atau window training diubah.

Monitoring: pantau distribusi fitur (PSI, KS) untuk data drift; untuk concept drift, evaluasi online performance saat label datang (atau proxy/reaction metric bila label terlambat).`,
    tags: "drift,covariate-shift,concept-drift,monitoring",
  },
  {
    role: "ml-engineer",
    category: "drift",
    difficulty: "hard",
    question: "Rancang sistem monitoring model produksi, termasuk pemilihan alert. Apa yang tidak boleh dilewatkan?",
    answer: `Rancangan lengkap:

1. **Ukur tiga lapis**:
   - **Input/feature**: PSI atau KS per fitur untuk mendeteksi data drift. Ini cepat tapi tidak selalu berarti salah secara bisnis.
   - **Output/prediction**: distribusi skor, pergeseran rate prediksi, ratio label positif per skor.
   - **Performance**: label aktual, meskipun sering datang terlambat (fraud 30 hari, churn 7 hari). Jadikan metrik ini sumber kebenaran; feature drift adalah peringatan awal, bukan pengganti.

2. **Umur label & delayed label**: tangani secara eksplisit dalam metrik (label belum ada ≠ negatif).

3. **Alert yang benar-benar berguna**:
   - Ambang berbasis **statistik + magnitudo bisnis**, bukan sekadar ">2 std".
   - Baseline jelas (bandingkan dengan 7/14 hari lalu, bukan rata-rata semua waktu).
   - **Bounded alerts**: batasi jumlah alert per minggu, cooldown, eskalasi; bila semuanya terus berbunyi, alert itu jadi bising dan diabaikan.
   - Annotate severity: warning (pantau) vs action (perlu intervensi).

4. **Jalur investigasi**: setiap alert harus menunjuk kombinasi (versi model, versi data, window waktu) supaya bisa menjawab pertanyaan "kenapa".

Jangan dilewatkan: **shadow/fallback** saat model memburuk, dan alert pada infrastruktur serving sendiri (latency, error rate), karena "model jelek" sering kali ternyata bug pipeline yang menyamar.`,
    tags: "drift,monitoring,alert,production",
  },
  {
    role: "ml-engineer",
    category: "mlops",
    difficulty: "easy",
    question: "Bedakan experiment tracking dan model registry. Apa hubungannya?",
    answer: `**Experiment tracking** merekam detail tiap percobaan training: parameter, dataset commit, kode, metrik, artefak model, lingkungan. Tujuannya: bisa mereproduksi percobaan dan membandingkan percobaan secara adil. Contoh: MLflow Tracking, Weights & Biases, Neptune.

**Model registry** menyimpan **artefak model yang siap dipromosikan** beserta metadata hidup: versi, staging (staging/production/archived), hasil evaluasi, definisi model, approval. Tujuannya: kontrol versi model produksi dan deployment/revert yang aman. Contoh: MLflow Model Registry, Sagemaker Model Registry.

Hubungan: tracking menghasilkan banyak percobaan; hanya beberapa yang lulus evaluasi lalu **didaftarkan** ke registry dengan stage. Registry juga bertugas supaya produksi, stage, dan reproducibilitas tetap konsisten: setiap artefak produksi bisa ditelusuri ke percobaan dan data training-nya.

Analoginya: experiment tracking = lab notebook; model registry = gudang artefak yang layak rilis.`,
    tags: "mlops,experiment-tracking,model-registry",
  },
  {
    role: "ml-engineer",
    category: "mlops",
    difficulty: "medium",
    question: "Seperti apa CI/CD untuk model ML yang baik?",
    answer: `CI/CD ML menangani dua artefak: **kode** dan **model**. Alur yang sehat:

**CI (setiap perubahan kode/data):**
1. Test unit + integrasi pipeline (data schema, feature encoding, impl baru dicek dulu).
2. Lint, type check, test library code.
3. Benchmark kecil pada data validasi untuk mendeteksi regresi model (mis. metrik harus naik/bertahan di baseline).
4. Validasi skema data: perubahan schema ditangkap fast fail.

**CD (deployment bertahap):**
1. **Reproducibility dipaksa**: commit data + kode + konfigurasi dicatat sebagai satu "run"; model yang bisa lolos harus punya trace lengkap.
2. Re-train terjadwal atau based on event (monitoring drift/performance), bukan ad hoc manusia.
3. Model baru di-validasi di staging: set evaluasi, fairness, bias check, dan target metrik minimal.
4. **Deploy bertahap**: shadow → canary (persentase kecil) → full. Bandingkan prediksi produksi vs shadow.
5. **Rollback cepat**: satu command untuk revert ke model/versi data sebelumnya.
6. **Trigger retrain eksplisit**: kapan retrain (threshold drift/perform, data baru tanggal cut-off) terdokumentasi, bukan "entah".

Tangent yang sering dilupakan: versi data harus di-pin layaknya versi kode, dan permission deploy ke produksi dibatasi + direview.`,
    tags: "mlops,ci-cd,reproducibility,deployment",
  },
  {
    role: "ml-engineer",
    category: "ml-theory",
    difficulty: "hard",
    question: "Kenapa akurasi menyesatkan di klasifikasi biner imbalance, dan metrik apa yang lebih informatif?",
    answer: `Akurasi = (TP+TN)/(total). Dengan kelas positif 1%, model yang selalu memprediksi negatif mendapat akurasi 99% dan sama sekali tidak berguna.

Metrik yang lebih informatif, masing-masing dengan trade-off:

- **Precision** = TP/(TP+FP): dari yang diprediksi positif, berapa benar. Sensitif terhadap FP.
- **Recall** = TP/(TP+FN): dari yang benar positif, berapa tertangkap. Sensitif terhadap FN.
- **F1** = harmonic mean precision & recall, satu angka untuk menilai keseimbangan; tapi tidak menghitung cost relatif FP vs FN (untuk fraud biayanya tidak simetris, F1 menyembunyikan ketimpangan biaya itu).
- **PR-AUC**: kurva precision vs recall untuk semua threshold; tidak memakai true negatives sehingga jujur di imbalance.
- **Calibration (reliability curve, Brier score)**: sudah berapa tepat probabilitas yang dikeluarkan, bukan sekadar urutan.

Keputusan praktis:
1. Pilih metrik berdasarkan **cost matriks**: salah positif vs salah negatif harganya berapa, threshold dipilih dari kurva precision-recall.
2. Rank-based (ROC-AUC, PR-AUC) untuk membandingkan model; threshold-based untuk beroperasi.
3. Jangan report akurasi sendirian saat imbalance; laporkan precision, recall, F1, tau PR-AUC sesuai konteks.`,
    tags: "ml-theory,imbalance,precision-recall,calibration,metrik",
  },
  // ---------------- Backend Engineer ----------------
  {
    role: "backend-engineer",
    category: "performance",
    difficulty: "easy",
    question: "Endpoint daftar pesanan pelanggan makin lambat seiring volume transaksi naik. Operasi apa yang paling wajar kamu periksa lebih dulu, dan kenapa?",
    answer: `Sebelum mengoptimalkan query atau menambah Redis, periksa dulu **bagaimana query dieksekusi**: cari full table scan yang tidak perlu.

1. **Lihat execution plan** (untuk SQLite: \`EXPLAIN QUERY PLAN\`; untuk Postgres: \`EXPLAIN ANALYZE\`). Kalau muncul \`SCAN table\` untuk filter di kolom yang sering dipakai, itu titik lemahnya.
2. **Cek indeks yang menunjang filter dan sort** yang dipakai endpoint: filter \`WHERE customer_id = ?\` plus \`ORDER BY created_at DESC\` cocok dengan indeks komposit:

\`\`\`sql
CREATE INDEX idx_orders_customer_created
  ON orders (customer_id, created_at DESC);
\`\`\`

3. **Hindari \`SELECT *\`** untuk list yang dirender sebagian; ambil kolom yang betul-betul dipakai agar bisa memanfaatkan covering index.
4. **Perhatikan pagination**: kalau sudah banyak halaman, \`OFFSET\` besar tetap mahal; pindah ke keyset pagination (\`WHERE (created_at, id) < (?, ?)\`).

Urutannya penting: ukur dulu dengan plan, baru ubah skema. "Tambah Redis untuk caching" adalah solusi yang menutupi query buruk: sering lebih cepat dulu dengan indeks yang tepat.`,
    tags: "sql,index,query-plan,performance,pagination",
  },
  {
    role: "backend-engineer",
    category: "api",
    difficulty: "medium",
    question: "Endpoint checkout butuh rate limit 10 request/detik per pelanggan. Desain implementasinya: algoritma apa, state disimpan di mana, dan respons seperti apa ke client?",
    answer: `**Algoritma: token bucket**, lebih cocok daripada fixed window: fixed window meledak saat batas (burst 2x) dan tidak menyerap burst pendek. Token bucket membatasi *average rate* plus *burst* yang terkontrol.

State wajib **shared** (Redis), bukan memori per proses, karena backend biasanya >1 instance. Implementasinya harus **atomik**: pakai script Lua di Redis supaya tidak ada race:

\`\`\`lua
-- KEYS[1] = bucket, ARGV[1] = laju per detik, ARGV[2] = burst, ARGV[3] = now
local token = redis.call("HMGET", KEYS[1], "tokens", "ts")
local tokens = tonumber(token[1]) or ARGV[2]
local ts = tonumber(token[2]) or ARGV[3]
local elapsed = ARGV[3] - ts
tokens = math.min(ARGV[2], tokens + elapsed * tonumber(ARGV[1]))
if tokens < 1 then
  return {1, 0, math.ceil((1 - tokens) / ARGV[1])} -- ditolak; retry_after dalam detik
end
redis.call("HMSET", KEYS[1], "tokens", tokens - 1, "ts", ARGV[3])
redis.call("EXPIRE", KEYS[1], 120)
return {0, tokens - 1, 0}
\`\`\`

Respons saat ditolak (HTTP 429 Too Many Requests):

- \`Retry-After: <detik>\` supaya client tahu kapan boleh mencoba lagi.
- \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`, \`X-RateLimit-Reset\` supaya client bisa self-throttle dan UI menonaktifkan tombol lebih awal.

Jangan lupa: rate limit per pelanggan memakai \`customer_id\` yang sudah diautentikasi, bukan dari query string, dan pertimbangkan lapisan gateway lebih dulu supaya backend tidak kebanjiran volume sebelum middlewares sempat bekerja.`,
    tags: "rate-limit,token-bucket,redis,lua,api",
  },
  {
    role: "backend-engineer",
    category: "architecture",
    difficulty: "hard",
    question: "Tim sinkron antar service internal: sebagian usul REST, sebagian gRPC. Beri kerangka keputusan berbasis trade-off, bukan selera.",
    answer: `Kerangka: tentukan dulu **siapa pemanggilnya dan pola trafiknya**, lalu cocokkan dengan sifat transport masing-masing.

**Pilih gRPC kalau:**
- Komunikasi **service-to-service internal**, traffic tinggi, dan kedua ujung memakai codegen (tipe diketatkan).
- Butuh **streaming** (request/response bidirectional): inference model, replikasi, feed.
- **Latency & ukuran payload** penting: HTTP/2 + protobuf biner jauh lebih ringkas daripada JSON, dan koneksi dipakai ulang.
- Butuh **deadline/timeout** yang tersebar ke seluruh rantai call (propagasi otomatis) dan backpressure bawaan (HTTP/2 flow control).

**Pilih REST kalau:**
- Pemanggil dari **browser** atau pihak eksternal yang sulit diberi protobuf.
- Ingin memanfaatkan **semantik HTTP**: caching (ETag/GET/HEAD, CDN), status code standar, dan proxy yang belum tentu paham HTTP/2 end-to-end.
- Observability umum: curl, browser devtools, mayoritas API testing tools.

Praktik yang meredam pertengkaran: lapisan edge/API gateway tetap **REST**, komponen internal yang butuh performa/streaming **gRPC**, dan percaya pada **contracts**: versioning, backward compatibility, serta codegen dari proto/OpenAPI. Intinya bukan "yang mana lebih modern", tapi di mana letak *coupling* yang paling mahal saat salah paham.`,
    tags: "system-design,gRPC,REST,arsitektur,trade-off",
  },
  // ---------------- DevOps / MLOps ----------------
  {
    role: "mlops-engineer",
    category: "docker",
    difficulty: "easy",
    question: "Image Docker service kamu 1,8 GB dan build 6 menit tiap push; download di staging lambat. Strategi paling berdampak dan urutannya?",
    answer: `**Multistage build** adalah perubahan paling berdampak: satu Dockerfile memisahkan **builder stage** (yang butuh SDK/kompiler, berat) dari **runtime stage** (hanya binary + dependensi runtime).

\`\`\`dockerfile
FROM golang:1.23 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /app/server .

FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
\`\`\`

Hasilnya: image runtime jauh lebih kecil (puluhan MB, bukan GB), permukaan serangan mengecil, dan download di staging cepat.

Urutan strategi:
1. **Multistage** + base image kurus (distroless/alpine): dampak terbesar.
2. **.dockerignore** (node_modules, .git, build cache): konteks yang dikirim ke daemon mengecil, build cepat.
3. **Urutan layer berpengaruh pada caching Docker**: copy go.mod/lockfile dulu (jarang berubah) baru source, agar cache dependensi tidak invalid tiap push.
4. Layered cache + build cache (BuildKit) untuk tahapan berat.

Bukan prioritas pertama: kompresi, image registry mirror, overkompresi binary: perbaiki dulu isi image-nya.`,
    tags: "docker,multistage,caching,image,ci-cd",
  },
  {
    role: "mlops-engineer",
    category: "model-serving",
    difficulty: "medium",
    question: "Kamu meng-serving 3 model sekaligus: LLM 7B chat, model embedding, dan model klasifikasi kecil, di GPU cluster. Kapan memakai Triton Inference Server vs vLLM untuk masing-masing?",
    answer: `**vLLM** dan **Triton** bukan pesaing murni: overlap di serving LLM, tapi desainnya berbeda:

**vLLM** dirancang khusus LLM:
- **PagedAttention**: K/V cache tidak dialokasi kontinu, sehingga memory tidak terfragmentasi dan batch LLM lebih besar.
- **Continuous batching**: request baru masuk ke batch saat slot prompt selesai: utilisasi GPU tinggi untuk LLM.
- OpenAI-compatible server, mudah dipakai (\`vllm serve model --gpu-memory-utilization 0.9\`), dukungan quantization (AWQ/GPTQ).
- Ada API server siap pakai: cocok untuk **LLM chat produksi**; TensorRT-LLM via Triton bila perlu performa puncak dan kontrol tracing lebih dalam.

**Triton** lebih general dan kuat untuk multi-model dalam satu GPU:
- Serving **embedding + klasifikasi kecil + LLM** dalam satu proses: dynamic batching per model, ensemble pipeline, resource management per model.
- Multiple framework backends: onnxruntime, tensorrt, python: satu titik kontrol untuk seluruh model.
- Metrics + tracing (OpenTelemetry) jadi satu tempat observasi.

Praktis: LLM-only → **vLLM**; banyak tipe model + butuh satu control plane + ensemble → **Triton**. Keduanya sering dipakai berdampingan dengan pemisahan segmen GPU.`,
    tags: "model-serving,vllm,triton,llm,inference,gpu",
  },
  {
    role: "mlops-engineer",
    category: "kubernetes",
    difficulty: "hard",
    question: "Rolling update Deployment berhenti: pod baru tidak pernah Ready. Selain \`kubectl describe pod\`, apa yang kamu periksa dan bagaimana urutannya?",
    answer: `Rolling update macet hampir selalu karena kondisi pod baru tidak memenuhi syarat. Urutan diagnosis:

1. **Status rollout & pod**: \`kubectl rollout status deploy/x\`, \`kubectl get pods -o wide\`. Status pod menjaring: \`ImagePullBackOff\` (image/tag salah atau registry butuh secret), \`CrashLoopBackOff\` (app exit non-zero), \`Pending\` (tidak terjadwal; resource/GPU tidak cukup).
2. **Events** (\`kubectl describe pod\`): baca bagian *Events*: di sinilah sebagian besar petunjuk: \`FailedScheduling\`, \`Insufficient nvidia.com/gpu\`, \`Killing\` karena probe, \`OOMKilled\`.
3. **Probe**: pod naik tapi tidak Ready ⇒ kegagalan **readiness**, bukan liveness. Beda keduanya krusial: liveness yang salah meng-restart pod yang hanya lambat; readiness hanya menunda masuknya pod ke Service endpoint. Cek \`startupProbe\` untuk app yang butuh warm-up lama (mis. muat model 40 detik) supaya liveness tidak membunuhnya saat boot.
4. **Log container** (\`kubectl logs deploy/x -c app\`, tambahkan \`--previous\` untuk CrashLoopBackOff): cari error startup nyata: env kosong, migrasi skema gagal, file model tidak ada.
5. **Resource & storage**: \`Pending\` + requests/limits yang tidak realistis, GPU node affinity kurang, PV/PVC tidak tersambung (pod stuck di \`ContainerCreating\`).

Setelah akar ditemukan, putuskan \`kubectl rollout undo\` atau perbaiki spec Deployment; jangan \`kubectl delete pod\` berulang: ReplicaSet lama tetap memakai spec yang sama.`,
    tags: "kubernetes,pod,rolling-update,probe,troubleshooting",
  },
  // ---------------- Data Engineer ----------------
  {
    role: "data-engineer",
    category: "sql",
    difficulty: "easy",
    question: "Query \`SELECT * FROM orders WHERE created_at BETWEEN ? AND ?\` di tabel 50 juta baris makin lambat tiap bulan. Apa yang kamu cek paling dahulu?",
    answer: `Cek **execution plan** dan **indeks yang dipakai**: jangan langsung berasumsi perlu partisi atau colocation.

1. **Explain plan**: untuk SQLite \`EXPLAIN QUERY PLAN\`; untuk Postgres \`EXPLAIN ANALYZE\`. Kalau muncul \`SCAN orders\` padahal ada filter \`created_at\`, berarti belum ada indeks yang menunjang.

2. **Buat indeks yang sesuai pola query**:

\`\`\`sql
CREATE INDEX idx_orders_created_at ON orders (created_at);
\`\`\`

Indeks B-tree mendukung range scan untuk \`BETWEEN\`/komparasi. Kalau query sering difilter kolom lain (mis. status), indeks **komposit** dengan urutan kolom yang tepat lebih efisien.

3. **Kurangi kerja ekstra**: \`SELECT *\` menarik semua kolom, termasuk yang berat (text/blob). Ambil kolom yang dipakai, atau jadikan covering index.

4. Baru setelah itu pertimbangkan **partisi per bulan** (kalau query selalu menembak rentang) atau arsip/rollup: perubahan skema yang besar, bukan pilihan pertama.

Aturan yang sering dilupakan: *indeks adalah trade-off*: mempercepat read, memperlambat write tiap baris. Di tabel 50 juta baris, satu indeks yang tepat lebih berharga daripada tiga indeks spekulatif.`,
    tags: "sql,index,query-plan,partisi,performance",
  },
  {
    role: "data-engineer",
    category: "pipelines",
    difficulty: "medium",
    question: "Pipeline ETL dijalankan ulang karena sumber berubah; hasilnya jadi duplikat. Bagaimana membuat pipeline idempotent?",
    answer: `Pipeline "idempotent" berarti menjalankan ulang dengan input yang sama menghasilkan output yang sama: tidak menjadi duplikat. Cara mewujudkannya:

1. **Upsert, bukan insert-only**. Untuk warehouse modern pakai \`MERGE\`/upsert berbasis natural key:

\`\`\`sql
MERGE INTO dim_customer AS target
USING (
  SELECT id, name, updated_at, etl_run_ts AS _source_ts
  FROM staging_customer WHERE etl_run_ts = %(run_id)s
) AS source
ON target.id = source.id
WHEN MATCHED THEN
  UPDATE SET name = source.name, updated_at = source.updated_at
WHEN NOT MATCHED THEN
  INSERT (id, name, updated_at) VALUES (source.id, source.name, source.updated_at);
\`\`\`

2. **Beban paket stage → atomik**: tulis batch ke staging/delta table, commit, lalu swap. Metadata run (\`run_status\`) diperbarui hanya setelah sukses: partial run tidak terlihat.

3. **Overwrite ke partisi yang sama**, bukan append. Di Spark:

\`\`\`python
df.write.mode("overwrite").partitionBy("dt").saveAsTable("fct_sales")
\`\`\`

4. **Watermark/incremental**: simpan *high-watermark* (batas timestamp yang sudah terbaca) + *slice window* di metadata, bukan diambil dari waktu eksekusi.

5. **Run id per record**: kolom \`_run_id\` di setiap baris untuk menelusuri asal baris dan membuang run yang gagal secara deterministik.

Kunci mental: jangan "bersihkan duplikat setelah kejadian", melainkan buat **run ulang tidak pernah menghasilkan baris ganda** sejak desain.`,
    tags: "etl,idempotency,upsert,pipeline,warehouse",
  },
  {
    role: "data-engineer",
    category: "spark",
    difficulty: "hard",
    question: "Job Spark yang tadinya 20 menit jadi 1,5 jam setelah data naik 10x; sebagian besar core menganggur dan banyak shuffle. Diagnosa + perbaikan?",
    answer: `Gejala klasik **data skew + shuffle boros**. Pastikan dulu dengan pengukuran, bukan tebakan:

- **Spark UI → tab Stage**: ada stage dengan 1 task raksasa (durasi tidak merata)? Itu skew.
- **Tab Shuffle Read/Write** menunjukkan banyak record keluar-masuk; jika disertai disk spill, shuffle hampir pasti biang keroknya.

Penyebab umum & perbaikan:

1. **Join key skew** (mis. beberapa user_id super-aktif mendominasi). **Salting** mendistribusikan kembali:

\`\`\`python
from pyspark.sql import functions as F

small = small.withColumn("salt", F.explode(F.array([F.lit(i) for i in range(16)])))
big = big.withColumn("salt", F.monotonically_increasing_id() % 16)
joined = big.join(small, ["id", "salt"], "inner").drop("salt")
\`\`\`

2. **Broadcast join** untuk dimensi kecil (di bawah \`spark.sql.autoBroadcastJoinThreshold\`): menghilangkan shuffle sisi besar.

3. **Sesuaikan jumlah partisi dengan parallelisme**: cek \`spark.sql.shuffle.partitions\`; mulailah di sekitar (core aktif × 2-4) atau biarkan **AQE** menangani (\`spark.sql.adaptive.enabled=true\` + same-partitions coalesce) supaya tidak over-partition.

4. **Disk spill / OOM di worker kecil**: naikkan memory fraction atau perbanyak partisi; pastikan \`spark.memory.offHeap\` tidak melonjak tak terkontrol.

Langkah sesudahnya: pantau **Spark UI lagi setelah perubahan**: skew sering muncul kembali saat distribusi data berubah.`,
    tags: "spark,shuffle,skew,broadcast-join,aqe,performance",
  },
  // ---------------- AI Product Manager ----------------
  {
    role: "ai-product-manager",
    category: "llm-metrics",
    difficulty: "easy",
    question: "Tim chatbot support berbasis LLM bilang 'akurasi' tidak relevan untuk mengevaluasi output. Setuju? Metrik yang kamu pakai apa saja?",
    answer: `**Setuju sebagian**. Akurasi (proporsi jawaban benar) tidak punya ground-truth tunggal untuk pertanyaan terbuka: banyak jawaban "benar" yang sama baiknya, jadi satu angka benar/salah menyesatkan.

Yang dipakai sebagai gantinya:

**Evaluasi offline (sebelum rilis):**
- **Golden/test set**: puluhan sampai ratusan pasangan (pertanyaan → jawaban referensi) yang mencakup kasus edge.
- **LLM-as-judge**: model kedua menilai dengan *rubric konkret* (mis. "mencakup langkah refund, bahasa sesuai brand, tidak mengarang"); kalibrasi dulu dengan annotator manusia dan ukur agreement.
- **Reference-free metrics** (faithfulness, answer relevancy, groundedness) untuk menangkap **halusinasi**: apakah klaim didukung konteks dokumen RAG.

**Evaluasi online (produk sungguhan):**
- **Deflection rate**: % percakapan yang tuntas tanpa eskalasi manusia.
- **Resolution rate & CSAT/NPS** di sesi chatbot.
- **Escalation rate** + penyebabnya (di-slice per kategori tiket).

Pola yang disepakati: offline eval = *guardrail* (gerbang regression), online eval = *value* (bisnis). Satu jenis evaluasi saja tidak cukup untuk sesuatu yang mempertaruhkan keakuratan, kepatuhan, dan kepuasan sekaligus.`,
    tags: "llm-metrics,eval,llm-as-judge,groundedness,deflection",
  },
  {
    role: "ai-product-manager",
    category: "ai-ux",
    difficulty: "medium",
    question: "User butuh jawaban LLM, tapi time-to-first-token bisa 3-8 detik. Desain UX yang membuatnya tidak terasa lambat/rusak?",
    answer: `Waktu tunggu itu nyata (kondisi antrean, model besar), tapi *persepsi* bisa diperbaiki lewat desain:

1. **Streaming dari token pertama**: TTFT dihitung dari token pertama, bukan dari jawaban selesai. UI menampilkan token yang terus mengalir: tidak ada lompatan "kosong → penuh".
2. **Feedback segaris dengan state**:
   - Saat menunggu TTFT > 1-2 detik: tampilkan status ("Sedang menyiapkan jawaban…") yang **jelas indeterminate**, bukan spinner ambigu.
   - Sambil menunggu: perlihatkan **echo input** (pertanyaan user, judul topik yang dicari), supaya user yakin permintaannya sampai dan sedang diproses.
3. **Antisipasi kegagalan**: siapkan *error state*: tampilkan output parsial, beri tombol **Ulangi** dan opsi perbaiki prompt; jangan reset seluruh kolom sehingga user mengetik ulang.
4. **Cegah double-submit**: selama generate, tombol kirim dinonaktifkan → mencegah pembayaran token ganda dan kebingungan.
5. **Ukur yang benar**: p50/p95 TTFT dan inter-token latency; target TTFT < 8 detik dan jitter token rendah. Kalau p95 tinggi, itu persoalan infrastruktur (antrean, batching), bukan sekadar bagian UX.

Pola penting: streaming + instant acknowledgement + rencana error lebih bernilai daripada sekadar animasi.`,
    tags: "ai-ux,streaming,time-to-first-token,feedback,error-state",
  },
  {
    role: "ai-product-manager",
    category: "roi",
    difficulty: "hard",
    question: "Diusulkan mengganti 30% kerja tim support 20 orang dengan chatbot RAG. Beri kerangka menghitung ROI yang jujur: biaya token murah saja tidak cukup.",
    answer: `ROI chatbot bisa menipu kalau hanya menghitung penghematan biaya token. Kerangka lengkap:

**1. Basis kerja nyata (ukur, jangan asumsikan):** total tiket/hari, distribusi durasi per kategori, dan % yang butuh tindakan sistem (refund, akun) vs hanya informasi. Tanpa baseline, estimasi bersifat spekulatif.

**2. Deflection rate yang realistis:** sistem yang baik bisa mengalihkan 30-50% dari pertanyaan *informasional saja*. Yang butuh aksi biasanya naik ke manusia.

**3. Susun beban biaya:**
- Token: input + output × harga per M token; **prompt caching** menekan input berulang.
- Infra serving (GPU/VM), retrieval (embedding + vector store), eval/tuning berkala.
- Biaya manusia: labeling data, menyusun golden set, human-in-the-loop di kasus edge.

**4. Biaya kegagalan yang sering disembunyikan:**
- Chatbot **salah jawab** yang tak terdeteksi → user frustrasi → tiket baru (biaya 2x) atau churn. Biaya "satu jawaban salah" harus masuk model.
- **Eskalasi ganda**: bot menangani dulu, lalu manusia membenahi: total waktu 2x, bukan 2x lebih cepat.
- **Deflect palsu**: tiket yang "berhasil" ditutup bot justru muncul lagi besoknya.

**5. Kalibrasi angka:** RAG yang terawat bisa mengalihkan 30-60% volume yang jelas-jelas informasi, dengan CSAT netral atau naik tipis setelah iterasi. Angka di atas itu tanpa data pendukung sebaiknya dipertanyakan.

**Kesimpulan keputusan**: ROI sehat kalau deflect *bersih* (tidak menambah tiket ulang) dan waktu manusia dialihkan ke tiket kompleks. Targetkan itu, bukan sekadar "mengganti 30% support".`,
    tags: "roi,produk,llm-economics,deflection,costing",
  },
  // ---------------- Frontend / Fullstack ----------------
  {
    role: "frontend-fullstack-engineer",
    category: "react",
    difficulty: "easy",
    question: "Daftar 10.000 item di dashboard terasa janky saat scroll. Apa akar masalahnya dan solusi yang tepat?",
    answer: `Akar masalahnya bukan jumlah data di memori, melainkan **10.000 node DOM** yang dirender sekaligus: layout/paint tiap frame untuk node di luar viewport = kerja percuma, dan tiap re-render App merender ulang semuanya. Solusi berpatokan pada pola penggunaan:

1. **Virtualisasi**: dipakai ketika user **scroll kontinu dan butuh respons cepat** (log, realtime feed): hanya node yang terlihat yang di-render.
   - \`react-window\` kecil dan tepat untuk ukuran baris tetap; \`@tanstack/react-virtual\` (hooks) lebih baik untuk tinggi baris dinamis. Fixed height paling sederhana; hindari tinggi acak tanpa measurement.
2. **Pagination / infinite scroll + debounce**: kalau polanya "cari lalu baca beberapa" bukan "scroll sampai habis":
   - Server-side pagination mengecilkan data yang dikirim; infinite scroll bisa dikombinasikan dengan virtualisasi kalau butuh scroll yang halus.
3. **Stabilkan key + memo baris**: \`key\` memakai id data (bukan index) supaya React tidak salah-merge state; untuk item berat pakai \`React.memo\` dan prop yang stabil.
4. Untuk item rich-text yang render-nya mahal, debounce scroll handler dengan \`requestAnimationFrame\`.

Prinsip: output DOM sekecil mungkin yang bisa menampilkan apa yang terlihat. Virtualisasi menjawab "janky", pagination menjawab "data besar": pilih sesuai pola pakai.`,
    tags: "react,virtualisasi,performance,scroll,memo",
  },
  {
    role: "frontend-fullstack-engineer",
    category: "streaming",
    difficulty: "medium",
    question: "Fitur chat AI: backend mengirim token jawaban per event (SSE). Implementasikan streaming di React: dari fetch sampai token dirender inkremental tanpa memblokir UI.",
    answer: `Pakai \`fetch\` + \`ReadableStream\` + \`TextDecoder\` ({stream:true}): setiap chunk byte yang sampai bisa langsung dirender, tanpa menunggu seluruh respons:

\`\`\`tsx
import { useRef, useState } from "react";

type Msg = { id: string; text: string };

async function streamAnswer(prompt: string, signal: AbortSignal, onToken: (t: string) => void) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error("HTTP " + res.status);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onToken(decoder.decode(value, { stream: true }));
  }
}

export function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const send = async (prompt: string) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const id = crypto.randomUUID();
    setMessages((m) => [...m, { id, text: "" }]);
    try {
      await streamAnswer(prompt, ctrl.signal, (t) =>
        setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, text: msg.text + t } : msg))),
      );
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setMessages((m) =>
          m.map((msg) => (msg.id === id ? { ...msg, text: msg.text + " [gagal]" } : msg)),
        );
      }
    }
  };

  return (
    <div>
      {messages.map((m) => (
        <p key={m.id}>{m.text || "…"}</p>
      ))}
      <button onClick={() => void send("jelaskan SQL join")}>Kirim</button>
    </div>
  );
}
\`\`\`

Hal penting: \`TextDecoder({stream:true})\` menangani pemecahan multi-byte UTF-8 di antara chunk (tanpa ini, emoji/aksara rusak); state di-update per token tanpa memicu loading global; \`AbortController\` disediakan untuk pembatalan; tambahkan autoscroll (mis. \`scrollIntoView\`) supaya token terbaru selalu terlihat. SSE = satu koneksi HTTP yang terus mengalir; polling tidak.`,
    tags: "streaming,react,sse,readablestream,llm",
  },
  {
    role: "frontend-fullstack-engineer",
    category: "ai-sdk",
    difficulty: "hard",
    question: "Tombol 'Ringkas dokumen' memanggil LLM yang mahal per-token. User dobel-klik, pindah tab, lalu menekan lagi: bagaimana mencegah double-charge dan render yang basi?",
    answer: `Biaya nyata → lindungi di **dua lapisan**: UI (mencegah pengiriman ganda) dan server (menggagalkan duplikat yang lolos).

**Lapis UI:**
1. **Disabled + loading state**: saat request berjalan, tombol \`disabled\` + \`aria-busy\`: dobel-klik tidak mengirim dua request.
2. **AbortController + cleanup**: kalau user pindah tab atau komponen unmount, batalkan stream yang basi:

\`\`\`tsx
const ctrl = useRef<AbortController | null>(null);
useEffect(() => () => ctrl.current?.abort(), []); // cleanup saat unmount

const summarize = async () => {
  ctrl.current?.abort(); // request lama digantikan
  const c = new AbortController();
  ctrl.current = c;
  const res = await fetch("/api/summarize", { body, signal: c.signal });
  // pastikan response yang tiba masih untuk request terbaru
};
\`\`\`

3. **Stale guard**: simpan \`requestId\` (mis. dari hash dokumen + timestamp); saat setState, cek apakah requestId masih terbaru: kalau iya abaikan. Ini mencegah respon lama menimpa yang baru.

**Lapis server (pertahanan terakhir):**
- **Idempotency key**: client mengirim \`Idempotency-Key: <hash isi dokumen + user>\`; server menyimpan key di cache TTL dan menggagalkan request berikutnya dengan key yang sama (dikembalikan hasil yang sama tanpa tagihan kedua).

\`\`\`ts
// contoh route handler Next.js
const cached = await cache.get("summarize:" + key);
if (cached) return Response.json(cached); // tanpa memanggil LLM lagi
const text = await callLLM(doc);
await cache.set("summarize:" + key, text, { ttl: 60 * 60 * 24 });
return Response.json(text);
\`\`\`

- **Cache hasil per input**: kalau hash dokumen sama, kembalikan jawaban yang sudah ada: menghemat double-charge sekaligus.

Urutan kunci: disabled/loading → abort + cleanup → idempotency key + cache di server. API yang hanya mengandalkan UI adalah cacat.`,
    tags: "ai-sdk,idempotency,abort,streaming,optimistic-ui",
  },
  // ---------------- Backend Engineer (tambahan) ----------------
  {
    role: "backend-engineer",
    category: "api",
    difficulty: "easy",
    question: "Library client-mu melakukan retry otomatis setelah timeout di endpoint pembayaran, dan ternyata terjadi 2x charge. Hubungan HTTP method dengan idempotensi: kenapa GET/PUT/DELETE aman di-retry tapi POST tidak, dan apa solusinya?",
    answer: `**Idempotensi**: pemanggilan yang sama diulang berapa kali pun menghasilkan efek (state) yang sama.

- **GET/PUT/DELETE** idempotent secara semantik: PUT ke resource dengan body sama → state akhir tetap sama; DELETE dua kali → tetap terhapus (yang kedua biasanya 404, tapi state tidak berubah).
- **POST** bukan idempotent: setiap pemanggilan adalah aksi baru ("buat order", "charge kartu") → retry bisa memicu dobel.

Solusi untuk pembayaran:
1. **Idempotency key**: client kirim header \`Idempotency-Key: <UUID unik per aksi>\`; server simpan key + hasilnya (mis. di Redis/DB dengan TTL), jika key yang sama datang lagi → kembalikan respons yang sama tanpa charge ulang.
2. **Unique constraint di DB sebagai arbiter terakhir** (mis. kolom \`idempotency_key\` UNIQUE): dua request yang sama gagal di lapisan DB, bukan hanya logika aplikasi.
3. Pastikan efek berbayar hanya terjadi pada insert pertama yang sukses.

Pola: idempotency key + cache hasil per key adalah kuncinya.`,
    tags: "api,idempotency,retry,http-method,pembayaran",
    source: "https://blog.masteringbackend.com/backend-interview-questions/ + https://shubhambansal.site/backend-interview-qna.html",
  },
  {
    role: "backend-engineer",
    category: "databases",
    difficulty: "easy",
    question: "Tim bilang mau pindah semua relasi ke MongoDB karena 'lebih cepat', padahal domainnya penuh join, transaksi, dan constraint. Setuju? Kapan NoSQL/document DB justru pilihan yang tepat?",
    answer: `**Tidak setuju.** Kecepatan tidak datang dari mengganti penyimpanan; biasanya masalnya ada di query yang tidak berindex, N+1, atau cache yang hilang.

Pilih **relational (SQL/Postgres)** ketika:
- Domain butuh integrity: FK, transaksi ACID, constraint (unique, check), konsistensi antar-entitas.
- Query yang sering join, report/ad-hoc yang dinamis, aggregation fleksibel.

Pilih **document/NoSQL** ketika:
- Schema benar-benar berkembang cepat dan tiap dokumen ditulis/dibaca utuh (access pattern per-entity, sedikit relasi).
- Butuh horizontal write scaling / throughput tinggi dengan trade-off konsistensi yang bisa diterima (pahami posisi Anda di segitiga CAP dan trade-off-nya).
- Tidak ada kebutuhan join lintas "collection" yang berat pada hot path.

Aturan praktis: ajukan sebagai pertanyaan "apa pola aksesnya", bukan silver bullet "X lebih cepat". Kalau aksesnya ternyata butuh join+transaksi, NoSQL malah memindahkan masalah ke lapisan aplikasi.`,
    tags: "databases,sql,nosql,mongodb,arsitektur-data",
    source: "https://hellointerview.com/learn/system-design/system-design-primer/backend-questions + https://blog.masteringbackend.com/backend-interview-questions/",
  },
  {
    role: "backend-engineer",
    category: "performance",
    difficulty: "medium",
    question: "Setelah serangan bot selama 2 menit, semua query tiba-tiba timeout dan aplikasi tidak bisa melayani apa pun, bahkan setelah bot berhenti. Apa yang sebenarnya terjadi pada connection pool dan bagaimana mencegahnya?",
    answer: `Gejalanya **connection pool exhaustion**:

- Pool dibuka (actual connection ke DB) untuk setiap request. Kalau ada path yang **bocor**: koneksi di-*acquire* tapi tidak pernah di-*release* (mis. exception terjadi sebelum \`close()\`/mis. tanpa \`finally\`, transaksi dibiarkan menggantung), koneksi akan terkunci.
- Di bawah beban spike (bot), pool cepat habis; permintaan antre menunggu koneksi dan akhirnya timeout: dan masa idle yang panjang (\`wait_timeout\`) membuat koneksi yang menggantung membusuk perlahan, bukan langsung bersih.

Pencegahan:
1. **Pastikan release koneksi di \`finally\`/resource sanitizer**: jalankan exception path sebagai baris kode, bukan hanya happy path.
2. **Jangan pegang transaksi lama**: semua transaksi pendek dan selalu dibersihkan (commit/rollback); koneksi yang menggantung \`idle-in-transaction\` mempercepat habisnya pool.
3. **Ukur dulu, bukan tebak**: pool sizing (min/max) diset sesuai puncak concurrency, tambah connection validation (\`jdbc.validationQuery\`) untuk membuang koneksi mati.
4. **Circuit breaker di sisi app**: batasi permintaan ke DB saat sedang kewalahan supaya pool tidak dibanjiri.
5. Pantau metrik pool (\`wait\`, \`active\`, \`idle-in-transaction\`) sebelum menaikkan angka.`,
    tags: "performance,connection-pool,database,resilience,monitoring",
    source: "https://gronex.id/output/backend-performance-interview-questions-2025",
  },
  {
    role: "backend-engineer",
    category: "architecture",
    difficulty: "medium",
    question: "Boss ingin 'meng-ubah monolith 5 tahun menjadi microservices' bulan depan karena katanya itu 'cara modern'. Beri kerangka kapan ini layak dilakukan dan langkah aman memulainya.",
    answer: `Tolak mundur dari jadwal berbasis buzzword. Microservices memberi nilai hanya ketika: **deploy & scale independen, kepemilikan tim per-boundary, dan isolasi kegagalan**: bukan sekadar "banyak service".

Kerangka keputusan:
- **Jangan** pecah kalau tim kecil, domain masih berubah cepat, atau belum ada seam (batas natural antar-modul). Modular monolith lebih murah dulu.
- **Pecah** ketika satu batas domain punya ritme release/scale yang sangat beda dari yang lain (mis. billing vs catalog), dan bisa ditetapkan kepemilikan (ownership) yang jelas.

Langkah aman:
1. Pecah dari **seam yang sudah ada** (coupling yang nyata), bukan struktur ideal fiksi.
2. Prioritaskan **boundary dengan data sendiri**; hindari database bersama lintas service.
3. Pisahkan secara **inkremental per service** sambil tetap mengukur.
4. Pikirkan "apa yang system lakukan saat service-X down": degradasi yang terencana adalah setengah desain.
5. Serap biaya yang nyata: distributed transactions, observability terdistribusi, network failure.

Hasilnya: microservices yang dilahirkan dari kebutuhan, bukan dari roadmap.`,
    tags: "architecture,microservices,monolith,perpecahan,bounded-context",
    source: "https://shubhambansal.site/backend-interview-qna.html + https://blog.masteringbackend.com/backend-interview-questions/",
  },
  {
    role: "backend-engineer",
    category: "messaging",
    difficulty: "medium",
    question: "Consumer Kafka membaca pesan dua kali (semantik at-least-once) dan mencatat duplikasi di DB. Jika offset tidak boleh di-commit lebih awal, bagaimana membuat proses menjadi effectively-once?",
    answer: `Semantik Kafka: producer di-*ack* begitu pesan dipersist (at-least-once); consumer yang crash setelah memproses tapi sebelum commit offset akan membaca ulang batch yang sama → duplikat.

Kuncinya: **offset jangan dicommit terlalu awal**, dan buat **proses jadi idempotent** di lapisan data: bukan sekadar "hindari double-read".

Pola yang bekerja:
1. **Idempotency key per pesan**: beri tiap pesan \`event_id\` (dari producer); consumer menulis \`processed_event\` di tabel khusus dengan **unique constraint** pada \`event_id\`.
2. Tiap kali membaca pesan: \`INSERT INTO processed_event(id) VALUES(?)\`: jika melanggar unique → pesan sudah diproses, skip.
3. Proses utama (mis. debit saldo) dilakukan dalam **transaksi yang sama/pijak gabungan** dengan pencatatan \`event_id\`: kalau commit transaksi gagal, event tidak tercatat sehingga retry aman.
4. Jangan commit offset sebelum transaksi di-atom-kan; gunakan commit/posisi bersama atau \`read_committed\`.

Sehingga duplicate delivery menghasilkan efek tunggal: duplikat ditolak oleh constraint, bukan oleh pengecekan in-memory yang mudah salah.`,
    tags: "messaging,kafka,idempotency,at-least-once,effectively-once",
    source: "https://shubhambansal.site/backend-interview-qna.html + https://levelup.gitconnected.com/backend-interview-kafka-72f07e73eeea",
  },
  {
    role: "backend-engineer",
    category: "databases",
    difficulty: "hard",
    question: "Kamu harus melahirkan kolom baru (mis. menambah kolom status_batch untuk 100M baris) pada database produksi tanpa downtime. Jelaskan pola expand-and-contract (expand/contract) dan apa saja jebakannya.",
    answer: `Pola **expand-contract / dual-write** untuk schema migration tanpa downtime:

**Fase 1 (Expand):**
- Buat elemen baru tanpa menghapus yang lama: tambahkan kolom baru (\`status_batch\`): di Postgres di belakang \`ALTER TABLE ... ADD COLUMN\` instan (fail native DDL yang membutuhkan rewrite).
- Mulai **tulis ke dua tempat** (dual-write): aplikasi menulis ke kolom baru dan lama.

**Fase 2 (Backfill):**
- **Isi baris lama secara batch kecil** (mis. chunk per PK/secondary key, dalam transaksi pendek, di batas tertentu): bukan satu transaksi raksasa (mengunci lama).
- Jalankan secara paralel bersama proses write yang terus berjalan; **gate completion based on data state, bukan cursor**: periksa "berapa baris dari kohort sudah penuh" sebagai sumber kebenaran.

**Fase 3 (Switch read):**
- Setelah backfill selesai + data konsisten, alihkan **reads** ke kolom baru.
- Pantau kecepatan error/divergensi sebelum lanjut.

**Fase 4 (Contract):**
- Setelah semua orang di lapisan baca benar dan grace period berlalu, hapus kolom lama.

Jebakan: lupa fase backfill (query lama membaca NULL), dual-write tidak siap-bersih, atau menghapus kolom lama terlalu dini.`,
    tags: "databases,migration,expand-contract,zero-downtime,backfill",
    source: "https://gronex.id/output/backend-performance-interview-questions-2025",
  },
  {
    role: "backend-engineer",
    category: "api",
    difficulty: "hard",
    question: "Desain endpoint charge kartu yang aman dari 'double tap' dan retry, sampai ke level database. Bagaimana idempotency key berpindah dari header HTTP ke lapisan penyimpanan?",
    answer: `Lapisannya dari luar ke dalam:

1. **Header** \`Idempotency-Key: <UUID v4 per aksi>\` dikirim client. Client membuat **satu key yang sama** untuk semua retry dari aksi yang sama, dan key baru untuk aksi baru.

2. **Lapisan cache/Redis**: simpan (key → respons + status), TTL misal 24 jam. Retry dengan key sama → kembalikan respons tersimpan tanpa charge ulang. Bagus untuk kecepatan, tapi bukan sumber kebenaran.

3. **Database sebagai arbiter terakhir**: ini yang melindungi dari race/duplikasi:
\`\`\`sql
INSERT INTO charge (idempotency_key, amount, status)
VALUES (:key, :amount, 'PROCESSING')
ON CONFLICT (idempotency_key) DO NOTHING
RETURNING id;
\`\`\`
Hanya insert yang benar-benar baru yang bikin efek charge (sekali). Kalau \`RETURNING\` kosong → duplikat, kembalikan apa yang sudah ada.

4. Transaksi: jalankan charge sebenarnya **dalam transaksi yang sama** setelah insert berhasil; kegagalan → \`ROLLBACK\` membuat retry aman.

Tambahan: ledger/activity log, plus reconciliation berkala. Pola inilah yang bikin "double tap" teruji di sisi data, bukan sekadar flag di UI.`,
    tags: "api,idempotency,payment,race-condition,transaction",
    source: "https://shubhambansal.site/backend-interview-qna.html + https://blog.masteringbackend.com/backend-interview-questions/",
  },
  // ---------------- MLOps / DevOps Engineer (tambahan) ----------------
  {
    role: "mlops-engineer",
    category: "ci-cd",
    difficulty: "easy",
    question: "Bandingkan strategi deploy blue-green dan canary untuk model serving: kapan tiap strategi cocok dan bagaimana rollback-nya bekerja?",
    answer: `**Blue-green:**
- Dua environment penuh (blue = live, green = rilis baru).
- Cutover per *switch* router/LB: sempurna untuk zero-downtime dan rollback adalah balik switch (instan dan bisa diprediksi). Cocok untuk perubahan infrastruktur besar, model service baru, atau saat butuh transisi yang deterministik.
- Biaya: infra 2x; sesudah periode, environment lama dibuang.

**Canary:**
- Rilis dipindahkan sebagian kecil trafik (mis. 5-10%) lalu dinaikkan bertahap sambil memantau metrik (error rate, latensi p95, TTFT, refusal/hallucination).
- Rollback = atur ulang ke 0% atau mulai lagi dari persentase kecil; tidak perlu kapasitas 2x seperti blue-green, tapi butuh observability yang tajam untuk tahu kapan harus berhenti.
- Cocok untuk perubahan **perilaku** model (update weight, prompt, prompt version) di mana impact persisnya tak pasti.

Kombinasi umum: canary lalu full switch, dengan monitor SLO pada tiap step.`,
    tags: "ci-cd,deployment,blue-green,canary,rollback",
    source: "https://devops.dev/questions/interview-question-how-do-you-approach-canary-and-blue-green-deployments/",
  },
  {
    role: "mlops-engineer",
    category: "kubernetes",
    difficulty: "easy",
    question: "Jelaskan peran Deployment, Service, dan Ingress di Kubernetes. Kapan masing-masing benar-benar dibutuhkan untuk sebuah model serving API?",
    answer: `- **Deployment**: mendefinisikan *desired state* pod (image, replicas, resources) dan mengelola rollout/rollback via ReplicaSet. Untuk model serving: image container model + config GPU/limits.
- **Service**: memberi *virtual IP + DNS stabil* dan load-balancing ke pod (label selector). Tanpa Service, IP pod berubah saat pod restart, jadi Service dibutuhkan untuk discovery internal antar-servis.
- **Ingress**: pintu masuk eksternal layer-7 (HTTP) yang merutekan hostname/path ke Service (plus TLS). Dibutuhkan saat API model diekspos ke luar cluster (mis. gateway /api/v1/query).

Urutan: Deployment menyediakan pod → Service memuat-balancing internal → Ingress mengekspos ke luar. Kalau hanya dipanggil internal (antar-servis), Ingress belum tentu perlu.`,
    tags: "kubernetes,deployment,service,ingress,model-serving",
    source: "https://raw.githubusercontent.com/95deepansh/k8s-INTERVIEW/questions/k8s.md",
  },
  {
    role: "mlops-engineer",
    category: "monitoring",
    difficulty: "medium",
    question: "Model churn yang di-deploy 2 bulan lalu tidak pernah diupdate, tapi akurasi drop dari 89% ke 71%. Apa yang terjadi secara teknis dan bagaimana anda mendeteksinya lebih awal?",
    answer: `Code tidak berubah tapi **data berubah** → ini *model decay/drift*:

- **Data drift**: distribusi fitur input berubah (mis. populasi pengguna baru, musim). Dideteksi dengan statistik distribusi (PSI/KL/KS) per fitur; tim menetapkan threshold per fitur.
- **Concept drift**: relasi P(y|x) berubah (mis. apa yang berarti "churn" sekarang berbeda), walaupun input tampak sama. Lebih sulit: perlu label yang terlambat naik atau monitoring output.
- **Model decay**: akurasi turun karena kualitas label/feedback berubah, atau karena dunia bergerak (model non-stationary).

Monitoring yang harus dipasang:
1. **Drift detection** pada fitur & prediksi (tools: Evidently, Fiddler, WhyLabs).
2. **Label timbul tertunda** vs **prediksi** untuk mengukur akurasi offline secara kontinu.
3. **Output distribution**: bandingkan distribusi prediksi dengan baseline (mis. % prediksi churn naik-turun).
4. **Alert + retrain trigger**: SLO drift (mis. PSI > 0.2) memicu alarm, review, dan retrain window.`,
    tags: "monitoring,drift,concept-drift,data-drift,retrain,evidently",
    source: "https://www.goodsource.ai/blog/mlops-interview-questions + https://skphd.medium.com/mlops-interview-questions-and-answers-76e8e7b67060",
  },
  {
    role: "mlops-engineer",
    category: "ci-cd",
    difficulty: "medium",
    question: "Pada pipeline deploy model otomatis, apa yang harus MEM-BLOCK rilis secara otomatis (automated gate), dan apa yang sebaiknya tetap membutuhkan persetujuan manusia (human sign-off)?",
    answer: `**Otomatis mem-block (harus copot dari pipeline):**
- Data validation gagal (schema drift, missing data di atas threshold, referensi distribusi melonjak).
- Training/smoke tidak lolos, metric training hilang/nan.
- Metric kandidat **lebih buruk dari baseline/incumbent** pada gold-set yang sama (mis. accuracy/F1 naik tidak konsisten).
- Regresi di metrik kualitas spesifik: drift, fairness/equity, security/license compliance.
- Artifact corrupt / signature mismatch.

**Butuh human sign-off (jangan digate otomatis):**
- Release ke produksi dengan **dampak hukum/biaya tinggi**, atau keputusan non-reversible di sisi user (mis. model yang memengaruhi keputusan kredit).
- Keputusan yang membutuhkan konteks bisnis: interpretability/explainability review, komunikasi perubahan perilaku model ke user.
- Promosi antar-stage tertentu (mis. staging → production) dengan kebijakan approval.

Prinsipnya: **pipeline image-gate apa yang bisa diuji objektif; manusia meng-approve apa yang berisiko dan ambigu.** Semakin lolos gate otomatis semakin cepat iterasi, tapi jangan biarkan model batas mengubah perilaku user besar tanpa manusia.`,
    tags: "ci-cd,model-deployment,automated-gate,approval,best-practice",
    source: "https://superml.io/resources/mlops-answers-hiring/tell-me-about-your-experience-with-cicd-pipelines-in-mlops",
  },
  {
    role: "mlops-engineer",
    category: "gitops",
    difficulty: "medium",
    question: "Kenapa pendekatan GitOps (mis. Argo CD) lebih baik daripada deploy manual ke Kubernetes untuk workload MLOps? Apa yang dimaksud 'instant rollback' di sini?",
    answer: `**GitOps** = Git adalah *single source of truth* untuk desired state; operator (Argo CD) menyelaraskan cluster ke keadaan itu.

Kelebihan untuk MLOps:
1. **Audit & traceability**: semua perubahan (config, image model, versi prompt) adalah commit yang bisa di-review/dilacak: krusial saat terjadi incident.
2. **Drift detection**: operator memantau cluster; config yang berubah manual akan di-revert ke keadaan git (menghilangkan config drift yang sering bikin produksi "aneh").
3. **Rollback instan**: rollback = revert commit / set ref release, lalu Argo sync ulang: bukan perbaikan manual via kubectl satu-per-satu.

Kenapa relevan untuk model: model service bergantung pada image + config yang harus konsisten di banyak env; manusia yang mengetik kubectl tidak meninggalkan jejak, dan "7 kali lipat lebih banyak error pada perubahan yang tidak dites" (DORA research) justru dicegah audit.

Pola: Argo CD + evaluasi gates di pipeline → artifact (image + manifest) yang satu versi, deploy konsisten.`,
    tags: "gitops,argo-cd,kubernetes,rollback,drift,mlops",
    source: "https://kodekloud.com/blog/mlops-interview-questions-answers/",
  },
  {
    role: "mlops-engineer",
    category: "model-serving",
    difficulty: "hard",
    question: "Autoscale deployment vLLM pakai HPA berbasis CPU: saat request naik, TTFT melejit. Kenapa HPA CPU gagal untuk LLM serving, dan metrik apa yang seharusnya dipakai?",
    answer: `**Kenapa HPA CPU gagal:** LLM inference tidak mengikat resource ke CPU; bottleneck-nya adalah **memory (KV cache)** dan **batch scheduling**.

- Satu request menyedot sebagian KV cache; kehabisan cache → preemption/recompute atau paksa batch mengecil → TTFT naik drastis.
- CPU % bisa rendah bahkan saat GPU penuh/cache penuh, jadi HPA CPU melihat "aman" sementara request antri panjang.

**Metrik yang tepat (custom metrics):**
1. **\`num_requests_waiting\`** (antrean per engine): sinyal utama scaling; scale naik ketika antrean melewati ambang, scale turun ketika kosong.
2. **\`gpu_cache_usage_perc\`**: utilisasi KV-cache; kapasitas penuh saat mendekati 100% (naikkan replika).
3. **TTFT p95 (time-to-first-token) sebagai backstop SLO**: kalau p95 naik di atas ambang padahal GPU di bawah, sudah waktunya naik.
4. **Latency weighted** untuk menggabungkan request sederhana/kompleks.

Catatan implementasi: scrape exporter tiap 5-10s (bukan 60s default), atur **min replicas** mengingat cold start memuat weight (bisa puluhan detik), dan jangan justru turun terlalu cepat saat kejutan request.`,
    tags: "model-serving,vllm,autoscaling,hpa,ttft,kv-cache,kubernetes",
    source: "https://raw.githubusercontent.com/ombharatiya/DevOps-Bash-tools/refs/heads/main/devops-platform-engineer-interview-practice.md",
  },
  {
    role: "mlops-engineer",
    category: "kubernetes",
    difficulty: "hard",
    question: "Lima tim berbagi 64 GPU untuk training dan inference. Bagaimana mendesain scheduling, kuota/prioritas, dan mengapa model inference produksi tidak boleh ditaruh di instance spot?",
    answer: `Desain yang masuk akal untuk shared GPU:

1. **Layer device/autoscaler**: GPU device plugin per node dan node pool per jenis GPU (A100 vs L4): supaya workload cocok dengan kapasitas GPU yang tersedia, bukan dipaksakan.
2. **Multi-tenancy quota**: pakai admission controller berbasis kuota (Kueue, Volcano, atau Yunikorn) yang mendukung **hard floor + borrowable ceiling**: setiap tim dijamin kuota tertentu, tapi bisa pinjam sisa yang menganggur (mencegah hard partition yang membuang chip).
3. **Prioritas**: training long-running di prioritas rendah; inference produksi di prioritas tinggi dengan **PreemptionPolicy: PreferDoNotSchedule**: jangan biarkan satu workload usir yang lain.

**Kenapa inference produksi tidak boleh di spot:**
- Spot berpreempting setara kapan saja (lazim 2 menit pemberitahuan) → cold start memuat model bisa 10 menit; TTFT/SLO hancur, cost of failure tinggi (pelanggan kena timeout).
- Bagus untuk training yang *cheap & restartable* / batch besar, bukan live inference.

Tambahan: **bin-packing** (isi dulu node yang tersedia, baru pakai node baru) + **cost attribution per tim** (namespace label + billing) supaya pemakaian GPU bisa dialokasikan dengan adil.`,
    tags: "kubernetes,gpu,quota,scheduling,spot-instance,bin-packing,mlops",
    source: "https://raw.githubusercontent.com/ombharatiya/DevOps-Bash-tools/refs/heads/main/devops-platform-engineer-interview-practice.md + https://kodekloud.com/blog/mlops-interview-questions-answers/",
  },
  // ---------------- Data Engineer (tambahan) ----------------
  {
    role: "data-engineer",
    category: "spark",
    difficulty: "easy",
    question: "Setelah operasi filter yang membuang 80% baris, job tetap menghasilkan 200 partisi kecil. Jelaskan beda repartition() vs coalesce() dan kapan memakai yang mana.",
    answer: `- **\`repartition(n)\`**: *wide*: melakukan full shuffle semua data untuk **menaikkan/menurunkan** partisi dan **menyeimbangkan** ulang. Cocok saat butuh partisi lebih banyak (meningkatkan paralelisme) atau menyeimbangkan setelah skew.
- **\`coalesce(n)\`**: *narrow* (jika hanya menurunkan): menggabungkan partisi **dari bawah tanpa full shuffle**, jauh lebih murah. Cocok setelah filter yang menyisakan sedikit data: hasilnya partisi lebih sedikit, murah, tapi bisa tidak merata kalau dipaksa turun drastis.

Pola yang benar untuk kasus ini: setelah filter → **\`coalesce\`** untuk mengurangi partisi murah-mahal. Kalau partisi yang tersisa masih berat dan tidak merata, barulah pakai \`repartition\` (atau biarkan AQE meng-coalesce sendiri). Ingat: \`coalesce\` hanya *menurunkan*, tidak boleh dipakai untuk menaikkan.`,
    tags: "spark,repartition,coalesce,shuffle,performance",
    source: "https://medium.com/@anupchakole/mastering-the-senior-data-engineer-interview-a-comprehensive-guide-45334e72c830 + https://dev.to/yusufkaratoprak/40-databricks-data-engineer-interview-questions-tailored-for-senior-engineers-44fo",
  },
  {
    role: "data-engineer",
    category: "sql",
    difficulty: "easy",
    question: "Tulis query untuk mengambil gaji tertinggi kedua di tiap departemen dengan window function. Kenapa memilih DENSE_RANK dibanding ROW_NUMBER?",
    answer: `Query-nya (mis. PostgreSQL):

\`\`\`sql
WITH ranked AS (
  SELECT
    emp_id,
    name,
    dept_id,
    salary,
    DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk
  FROM employee
)
SELECT emp_id, name, dept_id, salary
FROM ranked
WHERE rnk = 2;
\`\`\`

Bedanya:
- **\`ROW_NUMBER()\`**: memberi 1, 2, 3 untuk tiga baris dengan gaji sama: tie diputus semaunya → yang "peringkat 2" belum tentu benar-benar gaji tertinggi kedua.
- **\`DENSE_RANK()\`**: memberi rank tanpa gap → dua orang gaji sama dapat rank sama (1 dan 1), orang berikutnya +1. Cocok untuk "top-N berdasarkan nilai".

Kalau definisi bisnisnya "dua orang gaji sama = keduanya peringkat 1, tidak ada yang ke-2", DENSE_RANK menang. Kalau butuh TEPAT satu baris per peringkat (mis. untuk pagination/list), ROW_NUMBER + tie-breaker (id) adalah pilihan.`,
    tags: "sql,window-function,dense_rank,row_number,sorting",
    source: "https://pyspark.in/page/join-pyspark-interview-questions-answers-part-2 + https://www.databricks.com/discover/pages/interview-questions/data-engineer",
  },
  {
    role: "data-engineer",
    category: "spark",
    difficulty: "medium",
    question: "Job dengan input hanya 10 partisi tiba-tiba menjalankan 200 tasks setelah operasi groupBy. Dari mana angka 200 itu berasal dan apa dampaknya?",
    answer: `Angka 200 adalah **\`spark.sql.shuffle.partitions\` = 200 (default)**.

Operasi \`groupBy\`/\`reduceByKey\` memicu **shuffle** dan output stage dipecah menjadi **200 partisi shuffle**, tanpa peduli ukuran input. Prognosis:
- Data kecil → 200 *file part* kecil di disk, banyak task overhead (task scheduling, shuffle read kecil) dan file sprawl pada penulisan.
- Data besar → 200 partisi bisa terlalu sedikit/menjadi bottleneck, atau terlalu banyak tergantung cluster.

Perbaikan:
1. Turunkan/sesuaikan \`spark.sql.shuffle.partitions\` untuk job kecil (mis. 8-32): "fixed to 200" tidak berlaku untuk semua workload.
2. Lepaskan pada **\`spark.sql.adaptive.enabled=true\` (AQE)**: Spark 3.2+ meng-*coalesce* partisi hasil shuffle secara dinamis sesuai ukuran data (sehingga partisi kecil yang sia-sia berkurang).
3. Cek **Spark UI** setelah perubahan: lihat distribusi duration task per stage.`,
    tags: "spark,shuffle,partitions,groupby,aqe,tuning",
    source: "https://dev.to/yusufkaratoprak/40-databricks-data-engineer-interview-questions-tailored-for-senior-engineers-44fo",
  },
  {
    role: "data-engineer",
    category: "pipelines",
    difficulty: "medium",
    question: "Tim ingin 'realtime' untuk dashboard dan agregasi harian untuk report. Jelaskan pola Lambda vs Kappa architecture, dan trade-off utama masing-masing.",
    answer: `**Lambda:**
- Dua jalur paralel: **batch layer** (akurat, reprocessable: memproses seluruh data kembali) dan **speed layer** (streaming, fast, approximate).
- Hasil digabung saat query: memberi keduanya: latensi rendah dari stream serta akurasi dari batch.
- Kelemahan: **duplicated logic** di dua codebase (batch vs stream), bisa divergensi, dan complexity besar di lapisan merge/consistent.

**Kappa:**
- Semua data lewat **satu jalur streaming** (mis. Kafka) dan disimpan untuk replay; batch = "stream yang diproses dengan window besar".
- Lebih sederhana (satu pipeline), salah satu kelebihan besar: log-based replay memungkinkan perhitungan ulang tanpa dual-code.
- Kelemahan: butuh **stream processing yang benar**: windowing, exactly-once, backpressure, dan kalau kebutuhan historis/jumlah data besar & lambat, kappa bisa mahal untuk recompute.

Pilihnya: latency SLA & kebutuhan reprocessing. Kalau sudah punya batch yang solid dan hanya butuh "fresh-ish" → tambah speed layer (Lambda); kalau tim masih kecil & data cukup kecil → Kappa lebih mudah dioperasikan.`,
    tags: "pipelines,lambda-architecture,kappa-architecture,streaming,batch",
    source: "https://pyspark.in/page/join-pyspark-interview-questions-answers-part-2",
  },
  {
    role: "data-engineer",
    category: "pipelines",
    difficulty: "medium",
    question: "Batch pagi dijadwalkan 06:00 tapi sebagian data sumber baru masuk siang hari sehingga total hari kemarin dianggap rendah. Apa itu watermark & bagaimana menangani late-arriving data?",
    answer: `Ini masalah *late-arriving data*: standar di pipeline incremental.

**Watermark table:**
- Simpan tabel kecil berisi **maximum timestamp yang sudah berhasil diproses** (mis. \`max_event_ts\` per partition/source).
- Query incremental hanya menarik baris dengan timestamp > watermark, supaya tidak mengulang data yang sudah diproses.

**Tetapi** baris terlambat (event_ts kemarin sore baru tiba pagi) punya timestamp **di bawah** watermark → ditolak. Solusi:
1. **Upsert/MERGE**: alih-alih insert-only, aplikasikan operasi idempotent (mis. \`MERGE DELETE+INSERT\` ke target keyed by natural key) sehingga batch baru dengan ts lama tetap bisa **update** baris yang sudah ada tanpa duplikat.
2. Simpan event dengan *arrival log* & **niat dedup by natural key** (event_id/admin_id) supaya baris yang sama di-reprocess aman.
3. Jadwalkan **retry/finalize** untuk window late (mis. batch 06:00, lalu "late window" 13:00) dengan batch yang sama idempotent: hasil akhir konsisten meski data datang terlambat.

Kuncinya: watermark = kebenaran inkremental; idempoten-join = penanganan keterlambatan.`,
    tags: "pipelines,watermark,late-arriving-data,merge,idempotency",
    source: "https://medium.com/@krthiak/pyspark-pipeline-watermarking-idempotent-data-engineering-interview-questions-answers-30c18c2a3fd3",
  },
  {
    role: "data-engineer",
    category: "sql",
    difficulty: "hard",
    question: "Halaman 3 dari daftar transaksi berubah isinya di tengah pagination karena ada insert baru, menghasilkan baris duplikat/terlewat. Jelaskan beda LIMIT/OFFSET vs keyset pagination dan tie-breaker-nya.",
    answer: `**LIMIT/OFFSET:**
- Setiap halaman: DB men-scan dan men-skip offset baris pertama (semakin dalam semakin mahal, O(N)).
- **Dengan insert/delete bersamaan** (tidak statis), set hasil ber-*shift* → baris bisa terduplikat atau terlewati antar-halaman. Tidak ada jaminan stabilitas selama traversal.

**Keyset (seek) pagination:**
- Stabilitas berbasis **kolom urutan (sort key) + tie-breaker unik**:
\`\`\`sql
SELECT *
FROM transactions
WHERE (created_at, id) < (:last_created_at, :last_id)  -- halaman berikutnya
ORDER BY created_at DESC, id DESC
LIMIT 10;
\`\`\`
- Kondisi perbandingan pada pasangan (created_at, id) membuat page boundary ditetapkan sekali; insert baru hanya menambah di ujung, tidak menggeser set → stabil.
- **Index-ish**: pakai index (created_at, id) supaya seek murah.
- Trade-off: tidak bisa "loncat ke halaman 5" tanpa tahu cursor, dan butuh kolom urutan yang deterministic + unique.

Pilih keyset untuk aplikasi dengan volume besar dan data yang berubah-ubah (transactions, notifications); LIMIT/OFFSET ok untuk data kecil/statis.`,
    tags: "sql,pagination,keyset,limit-offset,index,stability",
    source: "https://gronex.id/output/backend-performance-interview-questions-2025",
  },
  {
    role: "data-engineer",
    category: "spark",
    difficulty: "hard",
    question: "Join dua tabel besar (10TB total) terus OOM. Jawaban yang benar bukan sekadar 'naikkan memory'. Bagaimana proses menyelesaikannya?",
    answer: `Jawaban berlapis, dimulai dari **mengukur**, bukan menebak:

1. **Lihat physical plan & Spark UI**: cek apakah ada **skew** pada join key (satu key mendominasi satu partisi): gejala: satu task raksasa tapi yang lain kecil.
2. **Broadcast** dulu untuk sisi kecil: kalau salah satu tabel (atau hasil filter-nya) di bawah \`spark.sql.autoBroadcastJoinThreshold\`, Spark broadcast menghapus shuffle total. Untuk dimensi yang besar tapi bisa dipartisi/reduksi, filter dulu.
3. **Handle skew**:
   - **Salting**: tambahkan prefix acak ke key dominan di sisi besar dan kecil (mendistribusikan ulang tanpa skew).
   - **AQE optimize skew join** (\`spark.sql.adaptive.enabled\` + \`spark.sql.adaptive.skewJoin.enabled\` di Spark 3.x+) yang memecah partisi skewed otomatis.
4. **Bucketing**: jika kedua tabel di-bucket by join key, join bisa dilakukan antara bucket yang sama *tanpa shuffle*: tapi partition design ini harus direncanakan dari awal (one-time cost).
5. **Tuning**: sesuaikan \`spark.sql.shuffle.partitions\` sesuai volume nyata (core × 2-4), periksa disk spill (\`spark.memory.local\` management, overhead fraction), bukan menaikkan executor RAM tanpa arah.

Urutan jawaban yang dipandang senior: diagnose → broadcast → salting/AQE → bucketing → tuning.`,
    tags: "spark,join,oom,skew,salting,broadcast,aqe,bucketing",
    source: "https://dev.to/yusufkaratoprak/40-databricks-data-engineer-interview-questions-tailored-for-senior-engineers-44fo + https://medium.com/@anupchakole/mastering-the-senior-data-engineer-interview-a-comprehensive-guide-45334e72c830",
  },
  // ---------------- AI Product Manager (tambahan) ----------------
  {
    role: "ai-product-manager",
    category: "rag",
    difficulty: "easy",
    question: "Klien minta model 'mengerti' dokumen internal perusahaan (1000 halaman kebijakan). RAG vs fine-tuning: beri kerangka keputusan dan tunjukkan dari mana mulainya.",
    answer: `Gunakan kerangka "masalah mana yang dipecahkan":

- **RAG** (default untuk knowledge/business docs): jawaban disusun dari dokumen yang di-*retrieve*, fakta bisa diperbarui **tanpa retrain** (update = re-index), dan tanya-jawab bisa dilacak ke sumber (grounded). Cocok saat data berubah, butuh citeable, atau domain berkembang cepat.
- **Fine-tuning**: mengubah *behavior*: gaya, format, tone, struktur output, atau mempelajari knowledge tetap yang kecil dan stabil. Tidak ideal untuk knowledge yang sering berubah (harus retrain ulang).

Mulai dari **RAG**: set up retrieve dari dokument internal → build eval set kecil (50-100 QA dengan referensi) → kalau jawaban salah karena retrieval (dokumen tidak terambil), tingkatkan retrieval (chunking, embedding, re-ranking); kalau sudah terambil tapi jawaban salah format → baru pertimbangkan fine-tuning retriever/embedding atau generator.

Aturan praktis: kalau ditanya "aturan apa" (knowledge) → RAG; kalau ditanya "gaya bicara yang bagaimana" (behavior) → fine-tune.`,
    tags: "rag,fine-tuning,llm,produk-ai,knowledge",
    source: "https://callsphere.com/blog/ai-product-manager-interview-questions-and-answers/ + https://www.northeastern.edu/graduate/blog/ai-product-manager-interview-questions/",
  },
  {
    role: "ai-product-manager",
    category: "rag",
    difficulty: "medium",
    question: "Bagaimana mengevaluasi sistem RAG: kenapa mengevaluasi retrieval dan generator harus DIPISAH, dan metrik apa di tiap lapisan?",
    answer: `Karena **failure berpropagasi**: kalau retrieval mengembalikan dokumen yang salah, sebaik apa pun generator-nya jawaban tetap salah. Mengevaluasi end-to-end saja tidak memberitahu lapisan mana yang rusak.

**Lapis 1: Retrieval (kualitas dokumen terambil):**
- \`Precision@K\`, \`Recall@K\`, \`MRR\`, \`nDCG\`: seberapa baik dokumen RELEVAN tertangkap di top-K.

**Lapis 2: Generation (kualitas jawaban terhadap konteks):**
- \`Faithfulness/Groundedness\`: apakah jawaban **didukung** konteks (tidak mengarang).
- \`Answer relevancy\`: apakah menjawab pertanyaan yang diajukan.
- \`Context relevancy\`: apakah konteks yang dipakai relevan.
- (Mengukur **halusinasi**: klaim yang tidak bersumber di konteks.)

**Lapis 3: End-to-end:** kualitas akhir jawaban vs pertanyaan, skor oleh LLM-judge/rubric.

Best practice: dashboard dengan breakdown per lapisan: kalau \`faithfulness\` bagus tapi \`recall@k\` rendah, perbaiki retrieval; bukan ganti model.`,
    tags: "rag,rag-evaluation,metrics,retrieval,faithfulness,groundedness",
    source: "https://skphd.medium.com/rag-evaluation-metrics-interview-questions-answers-92d9193cfb51 + https://www.ibm.com/think/tutorials/advanced-rag-evaluation-techniques + https://learn.microsoft.com/en-us/azure/ai-studio/concepts/rag-evaluation",
  },
  {
    role: "ai-product-manager",
    category: "llm-metrics",
    difficulty: "medium",
    question: "Ada usulan 'pakai GPT untuk menilai jawaban GPT sendiri' (LLM-as-judge) supaya hemat evaluasi manual. Kapan pendekatan ini sah, apa risikonya, dan bagaimana mengkalibrasinya?",
    answer: `**Kapan sah:** untuk pertanyaan/teks **terbuka** di mana jawaban benar tidak unik dan human evaluation mahal. Valid bila rubric penilaiannya **konkret** (mis. "mencakup langkah refund, gaya sesuai brand, tidak mengarang fakta").

**Risiko utama:**
1. **Bias posisi/urutan**: judge memilih jawaban pertama/terakhir bukan karena kualitas.
2. **Bias verbosity**: menjawab panjang dianggap lebih baik walau tidak lebih benar.
3. **Self-preference**: judge model bias memuji model yang sama (self-preference bias).
4. **Agreeability**: judge "menyenangkan" daripada objektif.

**Kalibrasi (harus dilakukan):**
1. Ambil **100-300 kasus** yang di-score human terlebih dahulu.
2. Jalankan judge pada kasus yang sama, hitung **agreement (Cohen's kappa)** antara LLM-judge vs manusia.
3. Hanya pakai jika korelasi cukup tinggi (mis. κ > 0.7 pada kasus khas); kalau rendah, perbaiki rubric, ganti judge, atau tambah beberapa judge.
4. **Monitoring berkelanjutan**: kalau distribusi output berubah, korelasi judge bisa turun: evaluasi ulang berkala.

Jadi LLM-as-judge = alat penghemat, bukan pengganti manusia: ia harus dikalibrasi ke standar manusia dulu.`,
    tags: "llm-metrics,llm-as-judge,evaluasi,kalibrasi,bias,rubric",
    source: "https://learn.microsoft.com/en-us/azure/ai-studio/concepts/evaluation-approach-gen-ai + https://www.goodsource.ai/blog/why-non-executive-ai-product-managers-fail",
  },
  {
    role: "ai-product-manager",
    category: "ai-ux",
    difficulty: "medium",
    question: "Hasil riset: pengguna percaya jawaban chatbot yang salah-sangka benar (confident but wrong), lalu rugi. Google pernah 'near-miss' seperti ini. Bagaimana memperbaikinya dari sisi produk?",
    answer: `Masalahnya bukan hanya "salah jawab", tapi **keyakinan yang tidak dikalibrasi dengan kebenaran**. Perbaikan berlapis:

1. **Kalibrasi kepercayaan**: beri sinyal kapan sistem tidak yakin: margin skor groundedness/retrieval, alihkan ke manusia saat rendah + kasus mahal.
2. **Grounding & citation**: tampilkan sumber/context yang diambil; pengguna bisa cek sendiri. Ini menurunkan "blind trust" yang berbahaya.
3. **Design guardrail untuk aksi mahal**: untuk keputusan yang sulit dibalik (refund besar, hukum, kesehatan), terapkan human-in-the-loop/config dengan threshold sebelum bertindak otomatis.
4. **Eval spesifik "confident-wrong"**: tambahkan set uji yang sengaja mencari pertanyaan menjebak; ukur *confidence calibration* (Brier/ECE), bukan hanya akurasi.
5. **Recovery**: tampilkan disclaimer pintar + cara melaporkan error; ukur escalation rate & CSAT sesudah perbaikan.

Ukur keberhasilan dengan side-effect yang bisa diukur: rasio eskalasi, tingkat "user mengembalikan aksi", dan penurunan tiket komplain: bukan hanya "akurasi jawaban".`,
    tags: "ai-ux,confident-but-wrong,calibration,grounding,guardrail,produk-ai",
    source: "https://www.northeastern.edu/graduate/blog/ai-product-manager-interview-questions/",
  },
  {
    role: "ai-product-manager",
    category: "metrics",
    difficulty: "hard",
    question: "Definisikan north-star metric (NSM) untuk fitur AI Anda (contoh: AI copilot untuk tim sales) dan guardrail/counter-metric-nya. Bagaimana pengujiannya?",
    answer: `**North-star = SATU metrik nilai inti yang berkorelasi dengan retensi/perolehan nilai**: bukan metrik aktivitas semata.

Contoh untuk AI copilot sales: **"jumlah sesi mingguan di mana saran AI mempercepat satu langkah kerja"**: metrik outcome (dampak), bukan "kali dipakai" (usage bisa itu-itu saja). Atau bila ingin lebih behavioral: **\`weekly_active_users_who_completed_>1_sales_outcome_with_AI\`**.

**Guardrail / counter-metric (harus ditetapkan paralel):**
- **Hallucination/false-positive rate** pada saran (mis. < 4%).
- **Escalation rate** (saran AI → dibatalkan user/manual re-kerja).
- **Cost per active user** (token/model): jangan sampai NSM naik tapi biaya memakan margin.
- **Time-to-value & churn counterfactual**: tanpa saran AI, berapa yang selesai manual?

**Cara menguji:**
1. A/B; ukur NSM & semua guardrail **bersamaan**: optimasi NSM yang menaikkan hallucination adalah kegagalan.
2. Uji per segmen (sales senior vs baru) supaya tidak satu angka menutupi masalah.
3. Pantau berlanjut: NSM yang "naik" tapi churn naik = tanda sinyal salah.

Jawaban kuat menunjukkan: menolak metrik vanity, menetapkan counter-metric, dan memilih *outcome* bukan *aktivitas*.`,
    tags: "metrics,north-star-metric,guardrail,ab-test,produk-ai",
    source: "https://www.northeastern.edu/graduate/blog/ai-product-manager-interview-questions/ + https://www.goodsource.ai/blog/why-non-executive-ai-product-managers-fail",
  },
  {
    role: "ai-product-manager",
    category: "metrics",
    difficulty: "hard",
    question: "Provider model diperbarui diam-diam; semalam refusal rate produk melonjak 3x dan user churn. Bagaimana post-mortem-nya, dan apa pencegahannya secara sistem?",
    answer: `Insiden ini menunjukkan **dependensi buta pada model provider**. Pencegahan berlapis:

1. **Pin & version model** secara eksplisit (bukan "latest"): tentukan versi model di config artifact; upgrade = sengaja, ketat.
2. **Canary untuk model change**: perubahan model dipromosikan lewat canary, lalu bandingkan metrik online (refusal rate, error, TTFT, eskalasi) terhadap baseline sebelum 100%.
3. **Eval-gate offline** sebelum promote: jalankan model baru pada gold-set tetap (bias refusal, truthfulness): perubahan perilaku harus terdeteksi di staging, bukan saat produksi.
4. **Online guardrail/drift monitoring**: alarem refusal/drift mengikuti rilis; **rollback otomatis** ke versi sebelumnya jika SLO dilanggar (bukan hanya "buat manual").
5. **Throttle & blast radius**: ukuran rollout dan semaphore supaya penyimpangan tidak kena semua user sekaligus.

Post-mortem yang baik: timeline rilis, metrik kapan mulai naik, keputusan rollback, dan perubahan yang mencegah terulang (pinning + canary + alert otomatis). Peluncur yang "baru update model" harus ter-*trace* sebagai keputusan bernilai.`,
    tags: "metrics,model-rollout,rollback,canary,provider,dependensi-gpt,produk-ai",
    source: "https://learn.microsoft.com/en-us/azure/ai-studio/concepts/evaluation-approach-gen-ai + https://raw.githubusercontent.com/ombharatiya/DevOps-Bash-tools/refs/heads/main/devops-platform-engineer-interview-practice.md",
  },
  {
    role: "ai-product-manager",
    category: "prompting",
    difficulty: "medium",
    question: "Prompt chat helper diedit manual tiap minggu oleh copywriter tanpa jejak, dan karakter tanggapan berubah-ubah. Bagaimana memperlakukan prompt sebagai artefak produk yang dikontrol versi?",
    answer: `Prompt yang baik diperlakukan sebagai **kode/artefak ber-version**, bukan teks longgar yang dihapus:

1. **Versioning & Git**: prompt tinggal sebagai file (prompt template + policy) di repo, setiap perubahan = commit + review. Setiap versi bisa di-*rollback*.
2. **Eval gates di CI/CD**: setiap PR prompt harus lolos evaluasi: run pada golden set & ukur tone, format, dan stabilitas (tidak berubah liar); ganti model saja tidak cukup tanpa gate.
3. **Canary per versi prompt**: perubahan prompt di-release ke persentase trafik; bandingkan metrik kualitas (refusal, escalasi, CSAT, tone-analysis) terhadap baseline.
4. **Parameterisasi**: simpan variabel yang dimanipulasi (tone, length, persona) sebagai **konfigurasi terpisah** supaya tim copy menyesuaikan tanpa menyentuh kode.
5. **Linked dengan eval set**: tiap perubahan prompt meng-update referensi hasil; riwayat "mengapa berubah" terdokumentasi.

Hasil: perubahan karakter bisa di-trace, di-rollback, dan dipantau dampaknya terhadap metrik bisnis: bukan hasil yang berubah liar tiap kali copywriter "membenahi" prompt.`,
    tags: "prompting,prompt-engineering,versioning,productops,produk-ai",
    source: "https://www.northeastern.edu/graduate/blog/ai-product-manager-interview-questions/ + https://callsphere.com/blog/ai-product-manager-interview-questions-and-answers/",
  },
  // ---------------- Frontend / Fullstack Engineer (tambahan) ----------------
  {
    role: "frontend-fullstack-engineer",
    category: "react",
    difficulty: "easy",
    question: "Menambah item di tengah daftar list menyebabkan semua baris di bawahnya ke-render ulang dan input textnya reset. Kenapa dan bagaimana key yang benar di React?",
    answer: `React memutuskan komponen mana yang di-update/remount dari **key** (defaultnya index/posisi). Penyebabnya:

1. **Key index**: kalau key = \`index\`, menambah item di tengah menggeser semua item berikutnya; React mengira item "berpindah posisi" dan **me-remount/menukar state** termasuk input yang diisi user → reset.
2. Yang benar: **key stabil unik** berdasarkan identitas data (mis. \`item.id\`), bukan posisi:

\`\`\`tsx
{items.map((item) => (
  <Row key={item.id} item={item} />  // stabil
))}
\`\`\`

Dengan key = \`id\`, React bisa melihat "item A tetap di sini, hanya satu diinsert di tengah" → state lokal (input, scroll) item lain dipertahankan, hanya yang baru di-mount.

**Catatan**: key index untuk urutan statis masih boleh (list yang tidak pernah ditambah/diurutkan ulang). Untuk UI dinamis dan form/list panjang, key = id adalah aturan; hindari key acak (Math.random) yang membuat mount ulang tiap render.`,
    tags: "react,reconciliation,key,rerender,list",
    source: "https://sumitsingh4411.github.io/frontend-interview-questions/banks/react + https://www.react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key",
  },
  {
    role: "frontend-fullstack-engineer",
    category: "performance",
    difficulty: "easy",
    question: "Dropdown menu terasa lambat tapi kamu tidak tahu langkah mana yang lambat. Sebutkan tahap-tahap yang bisa menjadi penyebab (JS vs layout vs paint vs network) dan bagaimana mengukurnya masing-masing.",
    answer: `Langkah penyebab lambat di frontend & cara mengukur:

1. **JavaScript (CPU)**: handler/event sibuk, re-render React berlebihan. Ukur di **React DevTools Profiler**: flamegraph per komponen; cari "Render" yang lama (komponen raksasa, \`useMemo\` hilang, ctx besar ikut).
2. **Layout**: mengubah layout thrash (baca offset lalu tulis lebar berkali-kali), kolom besar. Ukur di **Performance tab (Chrome)**: segmen *Recalculate Style* & *Layout*; hindari pembacaan layout berulang, batch WRITE.
3. **Paint/Composite**: shadow/backdrop besar, \`will-change\` berlebihan, blur. Ukur segment *Paint* & *Layer*; hindari filter/shadow yang bergerak tiap frame; pertimbangkan compositing layer.
4. **Network**: banyak request paralel untuk data besar. Ukur di **Network tab** (waterfall, bukti blocking) + **Web Vitals** (LCP, INP, CLS): INP menangkap interaksi lambat yang kadang muncul dari JS, bukan jaringan.

Alur: hasil ukur dulu (Profile → isolate → optimasi), bukan tebakan. Prioritaskan yang menyumbang bagian paling besar di profile.`,
    tags: "performance,react-dev-tools,web-vitals,performance-profile,layout-thrash",
    source: "https://www.greatfrontend.com/questions/quiz/module/react + https://www.greatfrontend.com/questions/quiz/netflix-performance-and-routing-systems-design",
  },
  {
    role: "frontend-fullstack-engineer",
    category: "security",
    difficulty: "medium",
    question: "Tim menggunakan dangerouslySetInnerHTML untuk merender konten berita dari CMS. Jelaskan mengapa XSS muncul di React (yang di-escape default) dan bagaimana mengamankannya.",
    answer: `**React meng-escape output teks secara default**: kalau kamu merender \`{userContent}\` sebagai string, karakter seperti \`<\` di-escape sehingga tidak bisa jadi tag. XSS muncul lewat **jalan tidak wajar**:

1. **\`dangerouslySetInnerHTML\`**: melewatkan escaping sepenuhnya: kalau konten berisi \`<script>\` atau \`<img onerror=...>\`, itu dieksekusi.
2. **Atribut berbahaya**: bisa jadi di-escape tapi atribut seperti \`href="javascript:alert(1)"\` atau \`src\` mengeksekusi; selain itu **\`src\` vs \`href\`** pada element yang di-render string: url javascript.
3. **JSON yang disisipkan dalam \`<script>\`**: data berisi \`</script>\` atau karakter \`<\` bisa mengacaukan parser HTML.
4. **Web requests ke CSP lemah** dan \`innerHTML\` lain menerima input.

**Pencegahan:**
- Jangan pakai \`dangerouslySetInnerHTML\` untuk konten tak tepercaya; kalau rich-text edit, **sanitize dulu** (mis. DOMPurify dengan allowlist tag/atribut) sebelum di-inject.
- Set **CSP** kuat (\`script-src\` allowlist, nonce) sebagai pertahanan kedua.
- Validasi/escape sisi server; jangan pernah render html dari input user langsung.`,
    tags: "security,xss,dangerouslysetinnerhtml,sanitasi,csp,react",
    source: "https://theseniordev.com/react-question-indios/index.html",
  },
  {
    role: "frontend-fullstack-engineer",
    category: "architecture",
    difficulty: "medium",
    question: "Mewarisi codebase React lama (3 tahun, tanpa test, minim dokumentasi). Apa langkah-langkah pertama untuk mulai memperbaikinya dengan aman?",
    answer: `Jangan refactor besar-besaran tanpa jaring pengaman. Urutan yang aman:

1. **Inventory & pahami alur kritis**: jalan utama (login, checkout, render data utama) & komponen yang paling sering dipakai/sakit. Buat peta alur data sederhana.
2. **Tulis integration/component test untuk alur kritis dulu** (React Testing Library + Vitest/Jest): bukan unit-test utility dulu. Test = jaring pengaman untuk refactor.
3. **Unit test untuk bagian shared**: util, formatter, hooks yang dipakai banyak tempat: refactor mereka berdampak besar.
4. **Tambah lint/CI & coverage baseline**: supaya perubahan tidak memperburuk tanpa terlihat.
5. **Refactor bertahap**: setiap PR kecil, pertahankan test hijau; ganti tipe \`any\` menjadi tipe spesifik per file yang disentuh.
6. **Dokumentasi minim**: README pendek tentang struktur & keputusan bertahan (surviving decisions).

Prinsipnya: "fix the urgent + build the safety net before you modernize", bukan "rewrite all at once". Full rewrite tanpa test = pindah masalah.`,
    tags: "architecture,refactor,react,testing,legacy,petunjuk-aman",
    source: "https://arminshaikhy.github.io/react-question-practice/index.html#how-would-you-refactor",
  },
  {
    role: "frontend-fullstack-engineer",
    category: "state",
    difficulty: "medium",
    question: "State aplikasi tumbuh besar: prop drilling menyebar dan semua komponen di bawah provider re-render setiap update kecil. Kapankah pakai Context dan kapan pindah ke Zustand/Redux?",
    answer: `**Context** bagus untuk **state global yang jarang berubah & komponen konsumen sedikit** (theme, user session): murah, tanpa dependensi tambahan.

Jebakan: perubahan **apapun** pada nilai context me-render ulang **semua consumer** yang meng-*subscribe*: jadi untuk state yang berubah sangat sering (daftar item, search typing), one-context-for-everything adalah resep re-render boros.

Kapan pindah ke **store luar (Zustand/Redux)**:
- Update **frequent** & hanya sebagian kecil komponen yang berarti (mouse position, live list, form besar): selector \`useSyncExternalStore\`/Zustand menghindari re-render yang tidak perlu.
- Butuh **derived state & logic transisi** terpusat (reducer/middleware).
- State **server vs client** dipisah; store dipakai untuk client state yang benar-benar global.

Resolusi praktis: **split context** per domain (per-domain providers) + \`use-memo\`-select; kalau update masif memicu re-render seluruh consumer dan profiling menunjukkannya, baru bawa store. Satu provider raksasa untuk semua, bukan.`,
    tags: "state,context,re-render,zustand,redux,prop-drilling",
    source: "https://sumitsingh4411.github.io/frontend-interview-questions/banks/react + https://www.youtube.com/watch?v=DEPwA3mv_R8",
  },
  {
    role: "frontend-fullstack-engineer",
    category: "api",
    difficulty: "medium",
    question: "Aplikasi diintegrasikan dengan API pihak ketiga yang membatasi 10 request/menit. Bagaimana desain di sisi frontend supaya UX tidak rusak dan account tidak diblokir?",
    answer: `Desain lapis depan untuk API ber-rate-limit:

1. **Cache respons (TTL)**: simpan hasil per query key (mis. \`cacheKey = endpoint + params\`) selama TTL tertentu di memory/IndexedDB; render dari cache dulu.
2. **Dedupe inflight**: kalau 2 komponen minta data yang sama dalam ms yang sama, **share satu promise** (in-flight map) bukan request ganda: ini penghemat request paling mudah.
3. **Retry dengan exponential backoff + jitter** saat 429: tunggu \`2^n * base ± random\`; hormati header \`Retry-After\`.
4. **Queue & throttling**: antrekan request dengan batas (rate limiter di sisi klien) supaya tidak pernah melebihi kuota/menit.
5. **Fallback UX**: render cached/stale-while-revalidate, tombol manual "refresh", kondisi offline → tampil pesan; jangan spinner tak berujung.
6. **UI aware**: disable tombol aksi saat kuota sisa rendah; tampilkan estimasi waktu pulih.

Inti jawaban: jangan hanya "catch error"; kuota dihadapi dengan cache + dedupe + backoff + queue, dan UX tetap jalan walau API melambat.`,
    tags: "api,caching,rate-limit,dedupe,backoff,third-party,frontend",
    source: "https://arminshaikhy.github.io/react-question-practice/index.html#how-would-you-integrate-an-API-with-rate-limits",
  },
  {
    role: "frontend-fullstack-engineer",
    category: "streaming",
    difficulty: "hard",
    question: "Chat AI memungkinkan user mengirim pesan baru saat respons sebelumnya masih streaming. Bagaimana desain state supaya chunk dari stream lama tidak menimpa percakapan yang sudah lanjut (race, stale closure)?",
    answer: `Masalah: dua stream berjalan paralel; setState naif menggunakan state lama (stale closure) → chunk yang sampai belakangan menulis ke pesan yang salah atau list rusak, atau chunk "yang sudah selesai" menulis setelah digantikan.

Desain yang benar:

1. **Setiap stream identitas unik & stabil**: \`messageId\`/\`streamId\` diterima di tiap chunk (dari server atau dibuat client saat mulai). Semua state disimpan **per \`messageId\`**, bukan satu variabel "current streaming".
2. **Jangan tangkap state dalam closure**: pakai **functional updater**:
\`\`\`ts
setMessages(prev =>
  prev.map(m =>
    m.id === streamId ? { ...m, text: m.text + chunk } : m
  )
);
\`\`\`
ini membaca state terbaru, jadi update tidak merusak pesan yang lain.
3. **Bookkeeping terpisah**: peta \`activeStreams: Map<streamId, {cancelled}>\`. Saat pesan baru dikirim, stream lama di-*cancel*/\`abort\`; di listener, cek dulu apakah stream masih aktif: \`if (cancelled) return;\` sebelum setState.
4. **Menggunakan reducer**: \`dispatch({type:'CHUNK', streamId, chunk})\`, \`STREAM_STARTED\`, \`STREAM_COMPLETED\`: logika transisi berada di satu tempat, lebih mudah diuji daripada setState di dalam async callback.
5. **Abort dan cleanup**: \`AbortController\` per stream; pada unmount/timeout, cleanup listener biar tidak leak.

Pola ini secara efektif menjadikan "siapa yang boleh menulis UI" ditentukan oleh streamId + flag aktif, bukan urutan selesai-nya jaringan.`,
    tags: "streaming,ai-chat,race-condition,reducer,functional-updater,abortcontroller,react",
    source: "https://www.youtube.com/watch?v=o4gTz_lOsoU (PrachuB: OpenAI answer)",
  },
];
