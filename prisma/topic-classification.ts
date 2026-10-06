// Which of the 8 topic groups a category falls into. Some categories split across
// groups; those rows carry an explicit `topic` in CONCEPTS below and win over this.
const CATEGORY_TOPIC: Record<string, string> = {
  // SQL & Query
  sql: "sql",
  spark: "sql",
  // Statistik
  statistics: "statistics",
  probability: "statistics",
  "ab-testing": "statistics",
  experimentation: "statistics",
  "model-evaluation": "statistics",
  calibration: "statistics",
  "data-quality": "statistics",
  // ML Teori
  "ml-theory": "ml-theory",
  coding: "ml-theory",
  recommender: "ml-theory",
  ranking: "ml-theory",
  "feature-engineering": "ml-theory",
  // Deep Learning
  "deep-learning": "deep-learning",
  // LLM & RAG
  llm: "llm",
  rag: "llm",
  "llm-metrics": "llm",
  "prompt-engineering": "llm",
  prompting: "llm",
  "fine-tuning": "llm",
  agents: "llm",
  guardrails: "llm",
  "ai-sdk": "llm",
  evaluation: "llm",
  // MLOps & Infra
  mlops: "mlops",
  kubernetes: "mlops",
  "ci-cd": "mlops",
  docker: "mlops",
  gitops: "mlops",
  "model-serving": "mlops",
  inference: "mlops",
  monitoring: "mlops",
  pipelines: "mlops",
  "data-pipelines": "mlops",
  "feature-store": "mlops",
  messaging: "mlops",
  geospatial: "mlops",
  drift: "mlops",
  // System Design
  "system-design": "system-design",
  architecture: "system-design",
  databases: "system-design",
  api: "system-design",
  performance: "system-design",
  react: "system-design",
  state: "system-design",
  streaming: "system-design",
  security: "system-design",
  // Behavioral & Product
  behavioral: "behavioral",
  "product-sense": "behavioral",
  metrics: "behavioral",
  roi: "behavioral",
  "ai-ux": "behavioral",
};

type Entry = TopicEntry;

const CONCEPTS: Entry[] = [
  // ── sql / statistics ────────────────────────────────────────────────────────
  { q: "Apa kesalahan umum dalam menginterpretasikan p-value pada uji A/B", kc: "p-value,null hypothesis,significance level,type i error,multiple comparisons" },
  { q: "Bagaimana menghitung ukuran sampel yang dibutuhkan sebelum menjalankan A/B test", kc: "sample size,power analysis,minimum detectable effect,significance level" },
  { q: "Di eBay ratusan A/B test jalan setiap hari", kc: "sample ratio mismatch,chi-square test,randomization,probability partition,allocation bug" },
  { q: "Apa itu p-value dan bagaimana menginterpretasikannya", kc: "p-value,null hypothesis,statistical inference,significance,type i error" },
  { q: "Apa perbedaan statistik deskriptif dan inferensial", kc: "descriptive statistics,inferential statistics,population,parameter" },
  { q: "Jelaskan perbedaan Type I dan Type II error", kc: "type i error,type ii error,alpha,beta,statistical power" },
  { q: "Apa itu Central Limit Theorem dan kenapa penting", kc: "central limit theorem,sampling distribution,confidence interval,population mean" },
  { q: "A/B test menunjukkan hasil signifikan, tapi kamu menguji 5 metrik", kc: "multiple comparisons,false discovery rate,bonferroni correction,familywise error rate" },
  { q: "Apa perbedaan distribusi Bernoulli dan Binomial", kc: "bernoulli distribution,binomial distribution,trial independence,expected value" },
  { q: "Jelaskan beda antara probability dan likelihood", kc: "likelihood,maximum likelihood estimation,parameter estimation,inference" },
  { q: "Kapan lebih baik pakai PR-AUC daripada ROC-AUC", kc: "pr auc,roc auc,class imbalance,precision recall curve,threshold selection" },
  { q: "Model prediksi klik iklan punya AUC 0.96", kc: "calibration,isotonic regression,average predicted probability,ranking by score,bidding auction" },
  { q: "Google Flu Trends memperkirakan prevalensi flu AS", kc: "big data trap,media bias,confounding variable,proxy variable,selection bias" },

  // ── sql ────────────────────────────────────────────────────────────────────
  { q: "Tulis query untuk mengambil gaji tertinggi kedua di tiap departemen", kc: "dense_rank,row_number,window function,partition by,tie handling" },
  { q: "Tulis query untuk mencari gaji tertinggi kedua dari tabel employees", kc: "window function,subquery,self join,max value,second highest" },
  { q: "Hitung running total penjualan per hari", kc: "window function,running total,over clause,frame clause,analytic query" },
  { q: "Halaman 3 dari daftar transaksi berubah isinya di tengah pagination", kc: "keyset pagination,cursor pagination,limit offset,index stability,duplicate rows" },
  { q: "Query `SELECT * FROM orders WHERE created_at BETWEEN", kc: "query plan,index usage,sargable predicate,table partitioning,column order" },
  { q: "Job Spark yang tadinya 20 menit jadi 1,5 jam setelah data naik 10x", kc: "data skew,broadcast join,adaptive query execution,shuffle partition,salting" },
  { q: "Job dengan input hanya 10 partisi tiba-tiba menjalankan 200 tasks", kc: "adaptive query execution,skew join,partition coalescing,spark tuning" },
  { q: "Join dua tabel besar (10TB total) terus OOM", kc: "out of memory,data skew,salting,bucketing,broadcast join" },
  { q: "Setelah operasi filter yang membuang 80% baris, job tetap menghasilkan 200 partisi kecil", kc: "repartition,coalesce,shuffle partition,small file problem" },

  // ── ml-theory ──────────────────────────────────────────────────────────────
  { q: "Apa itu embedding dan kenapa berguna untuk semantic search", kc: "embedding,semantic search,vector database,distance metric,similarity" },
  { q: "Apa perbedaan Random Forest dan Gradient Boosting", kc: "random forest,gradient boosting,bagging,boosting,ensemble" },
  { q: "Apa perbedaan supervised dan unsupervised learning", kc: "supervised learning,unsupervised learning,label,training data" },
  { q: "Jelaskan overfitting, underfitting, dan bias-variance tradeoff", kc: "overfitting,underfitting,bias variance tradeoff,regularization,model capacity" },
  { q: "Jelaskan precision, recall, dan kapan memakai F1-score", kc: "precision,recall,f1 score,false positive,false negative" },
  { q: "Kenapa akurasi menyesatkan di klasifikasi biner imbalance", kc: "class imbalance,baseline accuracy,precision recall,metric choice" },
  { q: "Kenapa cross-validation penting dan apa gunanya stratification", kc: "cross validation,stratified sampling,variance estimate,data leakage" },
  { q: "Implementasikan algoritma k-means dari nol", kc: "k-means,centroid initialization,distance metric,cluster assignment,convergence" },
  { q: "Implementasikan cosine similarity dengan NumPy", kc: "cosine similarity,dot product,vector norm,vectorization,numpy" },
  { q: "Implementasikan gradient descent untuk linear regression sederhana", kc: "gradient descent,learning rate,loss function,convergence criterion,linear regression" },
  { q: "Bagaimana mengecek apakah dua string merupakan anagram di Python", kc: "character frequency,hash map,time complexity,string comparison" },
  { q: "Apa risiko target encoding dan bagaimana memitigasinya", kc: "target encoding,data leakage,overfitting,cross-fold encoding" },
  { q: "Bagaimana menangani class imbalance yang parah pada klasifikasi biner", kc: "class imbalance,smote,resampling,precision recall metric,minority class" },
  { q: "Airbnb memakai GBDT untuk search ranking dan hasilnya plateau", kc: "learning to rank,gradient boosted tree,ndcg,listwise objective,deep learning ranking", topic: "ml-theory" },
  { q: "Netflix Prize 2009 dinilai dengan metrik RMSE", kc: "rmse,mae,ranking quality,ensemble submission,accuracy metric" },
  { q: "Netflix hanya menampilkan SATU artwork per judul per member", kc: "contextual bandit,propensity score,inverse propensity scoring,exploration,feedback bias" },
  { q: "Spotify Discover Weekly dibangun dari hack week 2014", kc: "collaborative filtering,embedding normalization,cosine similarity,model ensemble,music recommendation" },

  // ── deep-learning ──────────────────────────────────────────────────────────
  { q: "Apa itu self-attention di arsitektur Transformer", kc: "self-attention,query key value,softmax,positional encoding,transformer" },
  { q: "Kenapa scaled dot-product attention dibagi dengan sqrt", kc: "scaled dot-product attention,softmax saturation,variance of dot product,gradient stability" },
  { q: "Kapan memakai RAG, fine-tuning, atau prompt engineering", kc: "rag,fine-tuning,prompt engineering,decision criteria,cost trade-off" },

  // ── llm ────────────────────────────────────────────────────────────────────
  { q: "Kenapa arsitektur Transformer menggantikan RNN untuk bahasa", kc: "transformer,self-attention,parallel training,long range dependency,rnn" },
  { q: "Apa itu tokenization dan kenapa memengaruhi biaya serta kualitas LLM", kc: "tokenization,vocabulary,context window,cost per token" },
  { q: "Jelaskan langkah-langkah pipeline RAG produksi", kc: "chunking,embedding,vector index,retrieval,reranking" },
  { q: "Bagaimana mengevaluasi sistem RAG: kenapa mengevaluasi retrieval dan generator", kc: "rag evaluation,retrieval recall,faithfulness,groundedness,separate evaluation" },
  { q: "Sebutkan failure mode umum RAG dan perbaikannya", kc: "hallucination,retrieval failure,chunking strategy,reranking,debugging" },
  { q: "Klien minta model 'mengerti' dokumen internal perusahaan", kc: "rag,fine-tuning,internal knowledge,data privacy,decision trade-off" },
  { q: "Bagaimana mengevaluasi kualitas aplikasi LLM", kc: "llm evaluation,rubric,llm-as-judge,human calibration,groundedness" },
  { q: "Ada usulan 'pakai GPT untuk menilai jawaban GPT sendiri'", kc: "llm-as-judge,calibration,rubric,inter-rater agreement,bias" },
  { q: "Tim chatbot support berbasis LLM bilang 'akurasi' tidak relevan", kc: "groundedness,deflection rate,llm-as-judge,rubric,quality metric" },
  { q: "Apa itu LoRA dan kenapa efisien untuk fine-tuning LLM", kc: "lora,parameter efficient fine tuning,low-rank adaptation,frozen base weights,memory efficiency" },
  { q: "Kapan kamu memilih prompt engineering, RAG, atau fine-tuning", kc: "prompt engineering,rag,fine-tuning,decision criteria,maintenance cost" },
  { q: "Apa beda AI agent dengan LLM chain sederhana", kc: "agent loop,tool use,planning,state management,chain of steps" },
  { q: "Bagaimana melindungi aplikasi LLM dari prompt injection", kc: "prompt injection,input sanitization,output validation,least privilege,red teaming" },
  { q: "Apa itu prompt injection dan bagaimana mitigasinya", kc: "prompt injection,input sanitization,output validation,guardrail,least privilege", topic: "llm" },
  { q: "Bagaimana menyusun system prompt untuk produksi", kc: "system prompt,instruction hierarchy,guardrail,production readiness" },
  { q: "Strategi prompting apa saja yang kamu kenal dan kapan memakainya", kc: "zero-shot,few-shot,chain of thought,prompt strategy" },
  { q: "Prompt chat helper diedit manual tiap minggu oleh copywriter", kc: "prompt versioning,regression testing,prompt management,product operations" },
  { q: "Tombol 'Ringkas dokumen' memanggil LLM yang mahal per-token", kc: "idempotency,request deduplication,abort controller,streaming,optimistic ui" },
  { q: "Desain sistem RAG untuk tanya jawab dokumen internal", kc: "rag,vector database,chunking,retrieval,system design", topic: "llm" },
  { q: "Bagaimana strategi menurunkan latency dan biaya serving LLM", kc: "batching,kv cache,quantization,semantic caching,token streaming", topic: "llm" },

  // ── mlops ──────────────────────────────────────────────────────────────────
  { q: "Apa itu data leakage dan bagaimana mendeteksinya", kc: "data leakage,cross validation,validation split,temporal split" },
  { q: "Apa itu model drift dan bagaimana menanganinya", kc: "model drift,monitoring,retraining,distribution shift" },
  { q: "Apa itu feature store dan kapan kamu membutuhkannya", kc: "feature store,train serving skew,feature reuse,consistency" },
  { q: "Model performanya bagus offline tapi buruk di produksi", kc: "train serving skew,distribution shift,debugging,validation gap,monitoring" },
  { q: "Bedakan experiment tracking dan model registry", kc: "experiment tracking,model registry,lineage,artifact store,model promotion" },
  { q: "Seperti apa CI/CD untuk model ML yang baik", kc: "ci cd,reproducibility,model pipeline,versioning,deployment" },
  { q: "Netflix membangun Metaflow", kc: "metaflow,workflow dag,reproducibility,artifact store,data scientist productivity" },
  { q: "Apa itu feature store dan masalah apa yang ia selesaikan", kc: "feature store,train serving skew,point-in-time correctness,feature reuse" },
  { q: "Train-serving skew adalah salah satu penyebab paling umum", kc: "train serving skew,point-in-time join,feature reuse,data leakage" },
  { q: "Jenis pemeriksaan kualitas data apa yang wajib ada sebelum model dipakai", kc: "data validation,schema contract,null rate,distribution check,freshness" },
  { q: "Skema data upstream berubah", kc: "schema evolution,backfill,data lineage,versioning,idempotent write" },
  { q: "Batch pagi dijadwalkan 06:00 tapi sebagian data sumber baru masuk siang hari", kc: "watermark,late arriving data,idempotent merge,batch pipeline,data completeness" },
  { q: "Pipeline ETL dijalankan ulang karena sumber berubah", kc: "idempotency,upsert,etl,reprocessing,data warehouse" },
  { q: "Tim ingin 'realtime' untuk dashboard dan agregasi harian", kc: "lambda architecture,kappa architecture,streaming,batch,operational complexity" },
  { q: "Netflix mengganti pipeline streaming lama mereka dengan Data Mesh", kc: "data mesh,change data capture,kafka,decentralized ownership,orchestration" },
  { q: "Model churn yang di-deploy 2 bulan lalu tidak pernah diupdate", kc: "concept drift,data drift,retraining trigger,accuracy monitoring" },
  { q: "Bedakan data drift dan concept drift", kc: "data drift,concept drift,covariate shift,monitoring,retraining", topic: "ml-theory" },
  { q: "Rancang sistem monitoring model produksi, termasuk pemilihan alert", kc: "drift detection,alert threshold,feature monitoring,label delay,production monitoring" },
  { q: "Apa trade-off quantisasi model untuk inference", kc: "quantization,precision,memory footprint,accuracy tradeoff,serving" },
  { q: "Kenapa batching inference menaikkan throughput", kc: "batching,throughput,latency,queueing,continuous batching" },
  { q: "Autoscale deployment vLLM pakai HPA berbasis CPU", kc: "kv cache,gpu utilization,autoscaling,time to first token,hpa limitation" },
  { q: "Kamu meng-serving 3 model sekaligus", kc: "vllm,triton,dynamic batching,multi model serving,gpu utilization" },
  { q: "Jelaskan peran Deployment, Service, dan Ingress di Kubernetes", kc: "deployment,service,ingress,kubernetes networking,model serving" },
  { q: "Lima tim berbagi 64 GPU untuk training dan inference", kc: "gpu quota,scheduling,bin packing,spot instance,multi tenancy" },
  { q: "Rolling update Deployment berhenti", kc: "readiness probe,liveness probe,startup probe,rolling update,debugging" },
  { q: "Image Docker service kamu 1,8 GB", kc: "multistage build,layer caching,image size,registry,pull time" },
  { q: "Kenapa pendekatan GitOps (mis. Argo CD)", kc: "gitops,declarative config,drift detection,rollback,audit trail" },
  { q: "Bandingkan strategi deploy blue-green dan canary", kc: "blue-green,canary,rollback,routing shift,model serving" },
  { q: "Pada pipeline deploy model otomatis, apa yang harus MEM-BLOCK rilis", kc: "automated gate,model test,inference contract,rollback plan,approval" },
  { q: "Consumer Kafka membaca pesan dua kali", kc: "kafka,at-least-once,idempotency,effectively-once,offset commit" },
  { q: "Kafka menyimpan data di disk broker dan tidak bisa murah", kc: "tiered storage,kafka retention,broker disk,object storage,partition" },
  { q: "Uber membuat H3, grid heksagonal hierarkis", kc: "h3,hexagon grid,hierarchical indexing,geospatial index,uniform cell size" },

  // ── system-design ──────────────────────────────────────────────────────────
  { q: "Boss ingin 'meng-ubah monolith 5 tahun menjadi microservices'", kc: "monolith,microservices,bounded context,team topology,migration cost" },
  { q: "Shopify punya monolith Ruby on Rails 2.8 juta baris", kc: "modular monolith,packwerk,bounded context,dependency direction,encapsulation" },
  { q: "Tim sinkron antar service internal", kc: "rest vs grpc,latency,contract evolution,coupling,trade-off" },
  { q: "Mewarisi codebase React lama", kc: "legacy refactor,characterization test,seams,incremental refactor,safety" },
  { q: "Desain sistem rekomendasi untuk jutaan pengguna", kc: "candidate generation,ranking,scalability,recommendation,retrieval" },
  { q: "Discord menyimpan triliun-an pesan di Cassandra", kc: "hot partition,sharding,cassandra,write amplification,migration" },
  { q: "Kamu harus melahirkan kolom baru", kc: "expand-contract,zero downtime migration,backfill,backward compatibility" },
  { q: "Tim bilang mau pindah semua relasi ke MongoDB", kc: "sql vs nosql,data modelling,relational integrity,schema flexibility,migration cost" },
  { q: "Endpoint checkout butuh rate limit 10 request/detik per pelanggan", kc: "token bucket,redis,atomic increment,distributed rate limit,429" },
  { q: "Desain endpoint charge kartu yang aman dari 'double tap'", kc: "idempotency key,transaction,unique constraint,race condition,retry" },
  { q: "Library client-mu melakukan retry otomatis setelah timeout", kc: "idempotency,http method semantics,retry safety,payment,at-least-once" },
  { q: "Stripe punya fitur idempotency key untuk semua POST", kc: "idempotency key,request fingerprint,response replay,storage ttl,atomic claim" },
  { q: "Aplikasi diintegrasikan dengan API pihak ketiga yang membatasi 10 request/menit", kc: "rate limit,client side throttling,backoff,caching,batch request" },
  { q: "Endpoint daftar pesanan pelanggan makin lambat seiring volume transaksi naik", kc: "query plan,index usage,n plus one,pagination,database index" },
  { q: "Setelah serangan bot selama 2 menit, semua query tiba-tiba timeout", kc: "connection pool,cascading failure,resilience,rate limiting,monitoring" },
  { q: "Dropdown menu terasa lambat tapi kamu tidak tahu langkah mana yang lambat", kc: "rendering pipeline,layout thrash,web vitals,performance profile,paint timing" },
  { q: "Netflix menghapus React dari client-side", kc: "time to interactive,bundle size,server side rendering,hydration,vanilla javascript" },
  { q: "Daftar 10.000 item di dashboard terasa janky saat scroll", kc: "virtualization,memoization,scroll performance,render cost,windowing" },
  { q: "Menambah item di tengah daftar list menyebabkan semua baris di bawahnya ke-render ulang", kc: "reconciliation,key prop,list rendering,state identity,rerender" },
  { q: "State aplikasi tumbuh besar", kc: "context,prop drilling,state management library,selector,re-render" },
  { q: "Tim menggunakan dangerouslySetInnerHTML untuk merender konten berita", kc: "xss,html sanitization,content security policy,html escaping,react" },
  { q: "Fitur chat AI: backend mengirim token jawaban per event", kc: "server sent events,readablestream,react state,streaming render,backpressure" },
  { q: "Chat AI memungkinkan user mengirim pesan baru saat respons sebelumnya masih streaming", kc: "race condition,stream id,functional updater,abort controller,state isolation" },

  // ── behavioral ─────────────────────────────────────────────────────────────
  { q: "Bagaimana kamu memutuskan model LLM untuk sebuah use case", kc: "model selection,trade-off,evaluation criteria,cost latency quality,decision framework" },
  { q: "Bagaimana kamu menjelaskan model kompleks ke stakeholder non-teknis", kc: "communication,stakeholder,analogy,storytelling,business impact" },
  { q: "Bedakan north-star metric dan vanity metric", kc: "north star metric,vanity metric,product analytics,metric selection" },
  { q: "Booking.com menjalankan lebih dari seribu A/B test secara simultan", kc: "experiment interference,ranking effect,multiple testing,guardrail metric" },
  { q: "Saat A/B test, kamu punya metrik utama dan guardrail metrics", kc: "guardrail metric,primary metric,experiment design,risk control" },
  { q: "DoorDash mengukur bahwa interleaving experiment punya sensitivity gain", kc: "interleaving,experiment design,sensitivity,ranking evaluation,a b test", topic: "statistics" },
  { q: "Di marketplace (seperti DoorDash), A/B test per-user tidak valid", kc: "switchback,cluster randomization,marketplace interference,statistical power,network effect" },
  { q: "Duolingo mengoptimasi notifikasi harian dengan bandit", kc: "multi armed bandit,novelty effect,sleeping arms,exploration exploitation,softmax sampling" },
  { q: "Definisikan north-star metric (NSM) untuk fitur AI Anda", kc: "north star metric,guardrail metric,counter metric,ai product" },
  { q: "Provider model diperbarui diam-diam", kc: "model rollout,canary release,rollback,provider dependency,incident postmortem" },
  { q: "Hasil riset: pengguna percaya jawaban chatbot yang salah-sangka benar", kc: "overconfidence,calibration,grounding,guardrail,transparency" },
  { q: "User butuh jawaban LLM, tapi time-to-first-token bisa 3-8 detik", kc: "streaming,time to first token,skeleton loading,progress feedback,error state" },
  { q: "Diusulkan mengganti 30% kerja tim support 20 orang dengan chatbot RAG", kc: "roi,cost of ownership,deflection rate,llm economics,total cost" },
];

export type TopicEntry = {
  // Distinctive prefix of the question. Long enough to be unambiguous.
  q: string;
  // Comma-separated rubric, lowercase, 3-5 concepts drawn from the question and
  // its answer.
  kc: string;
  // Only where the category default lands in the wrong group.
  topic?: string;
};

type MinimalClient = {
  question: {
    findMany(args: unknown): Promise<{ id: string; category: string; question: string }[]>;
    update(args: { where: { id: string }; data: { topic: string; keyConcepts: string } }): Promise<unknown>;
    count(args: unknown): Promise<number>;
  };
};

/**
 * Assign topic + keyConcepts to every row whose question matches the table above.
 *
 * Matches on a question prefix rather than on id, because the seed scripts and the
 * backfill both go through this and ids differ between a fresh seed and an
 * existing dev.db.
 *
 * Returns the questions that matched nothing. The caller decides what to do about
 * them: the backfill exits non-zero, the seeds only warn. A question with no entry
 * keeps topic "" and an empty rubric, which is visible and fixable rather than
 * silently wrong.
 */
export async function applyTopicClassification(prisma: MinimalClient): Promise<string[]> {
  const rows = await prisma.question.findMany({
    select: { id: true, category: true, question: true },
  });

  const unmatched: string[] = [];
  const updates: { id: string; topic: string; keyConcepts: string }[] = [];

  for (const row of rows) {
    const hits = CONCEPTS.filter((entry: TopicEntry) => row.question.startsWith(entry.q));
    if (hits.length !== 1) {
      unmatched.push(`[${row.category}] ${row.question}`);
      continue;
    }
    const entry = hits[0];
    const topic = entry.topic ?? CATEGORY_TOPIC[row.category];
    if (!topic) {
      unmatched.push(`[${row.category}] ${row.question}`);
      continue;
    }
    updates.push({ id: row.id, topic, keyConcepts: entry.kc });
  }

  // Only topic and keyConcepts are ever written. question, answer, category, tags,
  // role, difficulty and status are not in the payload, so running this twice
  // cannot damage a row.
  for (const update of updates) {
    await prisma.question.update({
      where: { id: update.id },
      data: { topic: update.topic, keyConcepts: update.keyConcepts },
    });
  }

  const stillUnclassified = await prisma.question.count({ where: { topic: "" } });

  return [
    ...unmatched,
    ...(stillUnclassified > 0 && unmatched.length === 0
      ? [`${stillUnclassified} row(s) still have an empty topic but every question matched`]
      : []),
  ];
}

