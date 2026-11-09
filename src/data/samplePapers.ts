export interface PaperAnalysis {
  paperDetails: {
    title: string;
    authors: string;
    year: string;
    venueOrArxiv: string;
    publication?: string;
    citationCount?: string;
    githubUrl?: string;
    category: string;
    url?: string;
  };
  coreContext: {
    problemStatement: string;
    primeMethodology: string;
    keyMathematicalAlgorithmic: string;
    keyConcepts?: string[];
    fullSummaryUnder300Words: string;
    wordCount?: number;
  };
  architecturalFlowchart: {
    mermaidCode: string;
    flowchartLabeledText: string;
    pipelineStages?: {
      stageName: string;
      description: string;
      keyOperations: string[];
    }[];
  };
  futureWorkAndInternships: {
    projectTitle: string;
    exactExtension: string;
    targetedPerformance: string;
    recommendedTechStack: string[];
    implementationMilestones: string[];
    resumeBulletPoint: string;
    difficultyLevel: string;
    estimatedWeeks: string;
  }[];
  tokenEfficiencyReport: {
    estimatedInputTokens: number;
    estimatedOutputTokens: number;
    totalEstimatedTokens: number;
    underConstraint25k: boolean;
    efficiencyNotes: string;
  };
  rawFormattedAgentOutput?: string;
}

export const SAMPLE_PAPERS: { id: string; name: string; tag: string; url: string; analysis: PaperAnalysis }[] = [
  {
    id: 'attention-is-all-you-need',
    name: 'Attention Is All You Need',
    tag: 'Foundational LLM',
    url: 'https://arxiv.org/abs/1706.03762',
    analysis: {
      paperDetails: {
        title: 'Attention Is All You Need',
        authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, et al.',
        year: '2017',
        venueOrArxiv: 'NeurIPS 2017 / arXiv:1706.03762',
        publication: 'NeurIPS 2017 (Advances in Neural Information Processing Systems 30)',
        citationCount: '135,000+',
        githubUrl: 'https://github.com/tensorflow/tensor2tensor',
        category: 'Sequence Modeling & Natural Language Processing'
      },
      coreContext: {
        problemStatement: 'Existing sequence transduction models relied heavily on complex recurrent or convolutional neural networks (RNNs/LSTMs), which process tokens sequentially. This sequential nature prevents parallelization across token positions during training, creating severe compute bottlenecks on long sequences and struggling to retain distant context.',
        primeMethodology: 'The authors introduce the Transformer, an architecture eschewing recurrence entirely in favor of stacked Multi-Head Self-Attention mechanisms. Both encoder and decoder blocks map sequence inputs to continuous representations entirely via dot-product attention paired with sinusoidal positional encodings, enabling complete GPU parallelization across all tokens simultaneously.',
        keyMathematicalAlgorithmic: 'The foundational equation is Scaled Dot-Product Attention: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V. Query, Key, and Value vectors are projected into h subspaces (Multi-Head Attention), allowing the model to jointly attend to information from different representation subspaces at different positions.',
        keyConcepts: [
          'Multi-Head Self-Attention',
          'Scaled Dot-Product Attention',
          'Sinusoidal Positional Encodings',
          'Transformer Encoder-Decoder Stacks',
          'Residual Connections & Layer Normalization'
        ],
        fullSummaryUnder300Words: 'Traditional sequence models like RNNs process language token-by-token, inhibiting hardware parallelism and causing training bottlenecks on modern GPUs. Vaswani et al. solved this by introducing the Transformer, completely eliminating recurrence and convolutions. Instead, it relies entirely on Multi-Head Self-Attention to compute dependencies between all tokens in parallel. Scaled dot-product attention computes attention weights between projected Query and Key matrices, scaled by the square root of key dimensionality to prevent gradient vanishing in the softmax, then applies these weights across Value vectors. Paired with sinusoidal positional embeddings to preserve token order, residual connections, and layer normalization, the Transformer enables massive batch parallelization, drastically faster training convergence, and superior BLEU scores.',
        wordCount: 114
      },
      architecturalFlowchart: {
        mermaidCode: `graph TD
    InputTokens["Input Tokens (Src & Tgt)"] --> Embed["Token Embeddings + Sinusoidal Positional Encoding"]
    Embed --> EncBlock["Encoder Stack (Nx Layers)"]
    
    subgraph EncoderLayer ["Encoder Layer"]
      EncBlock --> MultiHeadAttn["Multi-Head Self-Attention (Q, K, V)"]
      MultiHeadAttn --> AddNorm1["Add & LayerNorm"]
      AddNorm1 --> FeedForward["Position-wise Feed-Forward (FFN)"]
      FeedForward --> AddNorm2["Add & LayerNorm"]
    end
    
    AddNorm2 --> CrossAttention["Cross-Attention (Keys & Values from Encoder)"]
    
    TgtTokens["Shifted Target Tokens"] --> TgtEmbed["Target Embeddings + Positional Encoding"]
    TgtEmbed --> MaskedAttn["Masked Multi-Head Self-Attention"]
    MaskedAttn --> DecAddNorm1["Add & LayerNorm"]
    
    subgraph DecoderLayer ["Decoder Layer"]
      DecAddNorm1 --> CrossAttention
      CrossAttention --> DecAddNorm2["Add & LayerNorm"]
      DecAddNorm2 --> DecFFN["Position-wise Feed-Forward (FFN)"]
      DecFFN --> DecAddNorm3["Add & LayerNorm"]
    end
    
    DecAddNorm3 --> Linear["Linear Projection"]
    Linear --> Softmax["Softmax Token Probabilities"]
    Softmax --> OutputTokens["Predicted Output Tokens"]`,
        flowchartLabeledText: `(FLOWCHART)
graph TD
    InputTokens["Input Tokens (Src & Tgt)"] --> Embed["Token Embeddings + Sinusoidal Positional Encoding"]
    Embed --> EncBlock["Encoder Stack (Nx Layers)"]
    
    subgraph EncoderLayer ["Encoder Layer"]
      EncBlock --> MultiHeadAttn["Multi-Head Self-Attention (Q, K, V)"]
      MultiHeadAttn --> AddNorm1["Add & LayerNorm"]
      AddNorm1 --> FeedForward["Position-wise Feed-Forward (FFN)"]
      FeedForward --> AddNorm2["Add & LayerNorm"]
    end
    
    AddNorm2 --> CrossAttention["Cross-Attention (Keys & Values from Encoder)"]
    
    TgtTokens["Shifted Target Tokens"] --> TgtEmbed["Target Embeddings + Positional Encoding"]
    TgtEmbed --> MaskedAttn["Masked Multi-Head Self-Attention"]
    MaskedAttn --> DecAddNorm1["Add & LayerNorm"]
    
    subgraph DecoderLayer ["Decoder Layer"]
      DecAddNorm1 --> CrossAttention
      CrossAttention --> DecAddNorm2["Add & LayerNorm"]
      DecAddNorm2 --> DecFFN["Position-wise Feed-Forward (FFN)"]
      DecFFN --> DecAddNorm3["Add & LayerNorm"]
    end
    
    DecAddNorm3 --> Linear["Linear Projection"]
    Linear --> Softmax["Softmax Token Probabilities"]
    Softmax --> OutputTokens["Predicted Output Tokens"]`
      },
      futureWorkAndInternships: [
        {
          projectTitle: 'Edge-Optimized Attention with FlashAttention & INT8 Quantization',
          exactExtension: 'Replacing vanilla O(N^2) memory-bound attention with hardware-aware tiled FlashAttention and post-training dynamic INT8 weight quantization for edge deployment on low-memory micro-devices.',
          targetedPerformance: 'Reduce peak GPU VRAM consumption by 65% and accelerate inference latency by 3.4x on sequence lengths >= 2048 with < 0.2 BLEU degradation.',
          recommendedTechStack: ['PyTorch', 'FlashAttention-2', 'Triton', 'ONNX Runtime', 'HuggingFace Transformers'],
          implementationMilestones: [
            'Milestone 1: Profile baseline PyTorch Transformer attention kernel memory footprint and memory access bottlenecks using PyTorch Profiler.',
            'Milestone 2: Implement FlashAttention IO-aware tiling kernel integration, comparing SRAM vs HBM memory roundtrips.',
            'Milestone 3: Apply post-training INT8 dynamic quantization and evaluate inference latency benchmarks on edge CPU/GPU.'
          ],
          resumeBulletPoint: 'Engineered hardware-aware FlashAttention and INT8 quantization pipeline in PyTorch/Triton, slashing memory footprint by 65% and boosting inference throughput 3.4x on edge sequence lengths.',
          difficultyLevel: 'Intermediate',
          estimatedWeeks: '3-4 weeks'
        },
        {
          projectTitle: 'Hybrid Mamba-Transformer Sequence Model for Sub-Quadratic Scaling',
          exactExtension: 'Interleaving lightweight Mamba selective state-space model (SSM) blocks within Transformer layers, substituting 50% of self-attention heads with linear-time state space transitions.',
          targetedPerformance: 'Achieve linear O(N) computational complexity during generation, cutting time-to-first-token by 42% on 8k context lengths while preserving language modeling perplexity.',
          recommendedTechStack: ['PyTorch', 'Mamba (state-spaces/mamba)', 'HuggingFace Datasets', 'Weights & Biases'],
          implementationMilestones: [
            'Milestone 1: Set up a modular PyTorch character/byte-level language model bench testing standard GPT-2 vs Mamba layers.',
            'Milestone 2: Construct hybrid alternating architecture (1 Mamba block : 1 Attention block) and train on TinyStories/WikiText-103.',
            'Milestone 3: Benchmark generation throughput across sequence lengths 512 through 8192, visualizing memory curves.'
          ],
          resumeBulletPoint: 'Architected a hybrid Mamba-Transformer language model combining selective state-space blocks with attention, lowering long-context generation latency by 42% with linear memory scaling.',
          difficultyLevel: 'Advanced',
          estimatedWeeks: '4-5 weeks'
        },
        {
          projectTitle: 'Rotary Position Embedding (RoPE) & Context Extension Engine',
          exactExtension: 'Replacing the fixed absolute sinusoidal positional encodings with RoPE (Rotary Position Embeddings) and implementing YaRN interpolation to extend effective context window from 512 to 4096 tokens.',
          targetedPerformance: 'Extend receptive field 8x (512 to 4096 tokens) with zero retraining from scratch, maintaining < 1.0% perplexity drift on retrieval evaluation.',
          recommendedTechStack: ['PyTorch', 'vLLM', 'HuggingFace Transformers', 'Llama-Factory'],
          implementationMilestones: [
            'Milestone 1: Implement rotary 2D complex matrix rotation on query and key projections in custom PyTorch attention module.',
            'Milestone 2: Implement YaRN frequency interpolation to scale position angles for 8x context extrapolation.',
            'Milestone 3: Validate retrieval accuracy with the Needle-In-A-Haystack benchmark test suite.'
          ],
          resumeBulletPoint: 'Implemented Rotary Position Embeddings (RoPE) with YaRN interpolation in PyTorch, expanding effective context length 8x (512 to 4096 tokens) while retaining 99% retrieval accuracy on long-context benchmarks.',
          difficultyLevel: 'Intermediate',
          estimatedWeeks: '3 weeks'
        }
      ],
      tokenEfficiencyReport: {
        estimatedInputTokens: 1120,
        estimatedOutputTokens: 1450,
        totalEstimatedTokens: 2570,
        underConstraint25k: true,
        efficiencyNotes: 'Ingested paper abstract, equations, and structure. Completed full context extraction, flowchart, and 3 extension projects using 2,570 tokens (89.7% token buffer remaining).'
      }
    }
  },
  {
    id: 'lora-low-rank-adaptation',
    name: 'LoRA: Low-Rank Adaptation of Large Language Models',
    tag: 'Parameter-Efficient Fine-Tuning',
    url: 'https://arxiv.org/abs/2106.09685',
    analysis: {
      paperDetails: {
        title: 'LoRA: Low-Rank Adaptation of Large Language Models',
        authors: 'Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, et al.',
        year: '2021',
        venueOrArxiv: 'ICLR 2022 / arXiv:2106.09685',
        publication: 'ICLR 2022 (International Conference on Learning Representations)',
        citationCount: '6,500+',
        githubUrl: 'https://github.com/microsoft/LoRA',
        category: 'Efficient Deep Learning & PEFT'
      },
      coreContext: {
        problemStatement: 'Full fine-tuning of multi-billion parameter LLMs is prohibitively expensive, requiring updating and saving all weights for each downstream task. This creates enormous storage overhead, massive GPU memory footprints for optimizer states (e.g. AdamW), and deployment friction.',
        primeMethodology: 'LoRA freezes the pre-trained model weights W_0 and injects trainable rank decomposition matrices into the Transformer architecture layers. Specifically, the weight update delta-W is constrained by parameterizing it as the product of two low-rank matrices A and B (rank r << min(d, k)), drastically shrinking trainable parameters.',
        keyMathematicalAlgorithmic: 'For a pre-trained weight matrix W_0 in R^(d x k), the forward pass modification is: h = W_0 * x + (alpha / r) * (B * A) * x, where B in R^(d x r) initialized to zeros, and A in R^(r x k) initialized with Gaussian noise. At inference time, B * A can be directly folded into W_0 without adding any inference latency.',
        keyConcepts: [
          'Low-Rank Matrix Decomposition (B * A)',
          'Intrinsic Dimensionality Hypothesis',
          'Parameter-Efficient Fine-Tuning (PEFT)',
          'Zero-Latency Inference Weight Merging',
          'Rank & Scaling Hyperparameters (r, alpha)'
        ],
        fullSummaryUnder300Words: 'Fine-tuning modern foundation models requires updating hundreds of billions of parameters, causing staggering VRAM requirements and redundant storage across different tasks. Hu et al. introduce LoRA (Low-Rank Adaptation), grounded in the empirical hypothesis that weight updates during adaptation have a low intrinsic dimension. Instead of updating the original frozen matrix W_0, LoRA injects two small trainable matrices A and B such that delta-W = B * A, where the rank r is typically 4 to 16. During training, optimizer states are only tracked for the tiny fraction (<0.1%) of low-rank parameters, cutting VRAM by up to 3x and storage by 10,000x. Most crucially, during deployment, the low-rank delta-W can be algebraically folded into W_0, incurring zero additional runtime inference latency.',
        wordCount: 122
      },
      architecturalFlowchart: {
        mermaidCode: `graph TD
    InputActivation["Input Activation x [B, d_in]"] --> FrozenBranch["Frozen Base Weights: W_0 * x"]
    InputActivation --> LoRABranch["Trainable Low-Rank Path"]
    
    subgraph LoRAAdapter ["LoRA Decomposition (Rank r << d)"]
      LoRABranch --> MatrixA["Matrix A: Down-Projection [r, d_in]<br/>(Gaussian Init)"]
      MatrixA --> Bottleneck["Rank-r Latent Space [B, r]"]
      Bottleneck --> MatrixB["Matrix B: Up-Projection [d_out, r]<br/>(Zero Init)"]
      MatrixB --> Scaling["Scaling Factor: (alpha / r)"]
    end
    
    FrozenBranch --> Summation["Algebraic Addition (+)"]
    Scaling --> Summation
    Summation --> OutputActivation["Output Activation h [B, d_out]"]
    
    subgraph InferenceZeroLatency ["Zero-Latency Inference Mode"]
      MatrixB -.-> Fold["Fold: W_eff = W_0 + (alpha/r) * B * A"]
      Fold -.-> InstantInference["Single Matmul Forward Pass (0ms overhead)"]
    end`,
        flowchartLabeledText: `(FLOWCHART)
graph TD
    InputActivation["Input Activation x [B, d_in]"] --> FrozenBranch["Frozen Base Weights: W_0 * x"]
    InputActivation --> LoRABranch["Trainable Low-Rank Path"]
    
    subgraph LoRAAdapter ["LoRA Decomposition (Rank r << d)"]
      LoRABranch --> MatrixA["Matrix A: Down-Projection [r, d_in]<br/>(Gaussian Init)"]
      MatrixA --> Bottleneck["Rank-r Latent Space [B, r]"]
      Bottleneck --> MatrixB["Matrix B: Up-Projection [d_out, r]<br/>(Zero Init)"]
      MatrixB --> Scaling["Scaling Factor: (alpha / r)"]
    end
    
    FrozenBranch --> Summation["Algebraic Addition (+)"]
    Scaling --> Summation
    Summation --> OutputActivation["Output Activation h [B, d_out]"]
    
    subgraph InferenceZeroLatency ["Zero-Latency Inference Mode"]
      MatrixB -.-> Fold["Fold: W_eff = W_0 + (alpha/r) * B * A"]
      Fold -.-> InstantInference["Single Matmul Forward Pass (0ms overhead)"]
    end`
      },
      futureWorkAndInternships: [
        {
          projectTitle: 'Dynamic Rank-Adaptive LoRA (AdaLoRA) on Consumer GPUs',
          exactExtension: 'Implementing dynamic SVD-based importance scoring to allocate variable ranks r across Transformer layers on the fly, assigning higher rank to critical attention heads and pruning redundant layers.',
          targetedPerformance: 'Reduce trainable parameter count by another 35% compared to static LoRA r=8 while increasing downstream task accuracy by 1.2% on GLUE/MMLU benchmarks.',
          recommendedTechStack: ['PyTorch', 'HuggingFace PEFT', 'BitsAndBytes (4-bit/8-bit)', 'Accelerate'],
          implementationMilestones: [
            'Milestone 1: Implement custom LoRA Linear module in PyTorch with singular value parametrization W = P * Lambda * Q.',
            'Milestone 2: Add gradient magnitude importance metric to dynamically prune and expand ranks per layer during training steps.',
            'Milestone 3: Benchmark fine-tuning on a single 8GB consumer GPU (RTX 3070 / T4) tracking memory and convergence.'
          ],
          resumeBulletPoint: 'Built dynamic SVD-based adaptive rank LoRA framework in PyTorch/PEFT, reducing adapter parameters by 35% and fine-tuning a 7B LLM on a single 8GB consumer GPU.',
          difficultyLevel: 'Intermediate',
          estimatedWeeks: '3-4 weeks'
        },
        {
          projectTitle: 'Multi-LoRA Serving Router for Sub-Millisecond Task Switching',
          exactExtension: 'Designing an asynchronous multi-tenant inference server that dynamically hot-swaps task-specific LoRA adapters into a single shared frozen foundation model base in GPU memory.',
          targetedPerformance: 'Support 50+ concurrent domain-specific tasks on a single GPU instance with < 2ms adapter switching overhead vs full model duplicating.',
          recommendedTechStack: ['FastAPI', 'vLLM (Multi-LoRA API)', 'PyTorch CUDA Streams', 'Docker', 'Locust'],
          implementationMilestones: [
            'Milestone 1: Train 3 distinct specialized LoRA adapters (Code, Medical QA, Legal summarization) on Llama-3-8B.',
            'Milestone 2: Integrate vLLM multi-LoRA batching or build custom CUDA stream adapter cache.',
            'Milestone 3: Run stress load test with Locust simulating interleaved concurrent user requests across domains.'
          ],
          resumeBulletPoint: 'Engineered high-throughput multi-LoRA inference engine serving 50+ specialized adapters concurrently over a single shared base model, reducing serving infrastructure costs by 78%.',
          difficultyLevel: 'Advanced',
          estimatedWeeks: '4 weeks'
        },
        {
          projectTitle: 'QLoRA: 4-Bit NormalFloat Quantized LoRA for Mobile / Embedded Devices',
          exactExtension: 'Integrating 4-bit NormalFloat (NF4) base model quantization with double quantization and paged optimizers to fine-tune state-of-the-art models on ultra-constrained devices.',
          targetedPerformance: 'Slash fine-tuning VRAM from 16GB down to 5.2GB for 7B models, enabling fine-tuning on Apple Silicon MacBooks (M1/M2/M3 unified memory).',
          recommendedTechStack: ['PyTorch', 'MLX (Apple Silicon)', 'BitsAndBytes', 'TRL (Transformer Reinforcement Learning)'],
          implementationMilestones: [
            'Milestone 1: Implement NF4 quantization lookup table and dequantization forward hook in pure PyTorch/MLX.',
            'Milestone 2: Fine-tune instruction-following model on alpaca dataset measuring peak unified memory.',
            'Milestone 3: Compile optimized model using CoreML/GGUF for local on-device inference.'
          ],
          resumeBulletPoint: 'Implemented NF4 4-bit quantized LoRA pipeline on Apple Silicon MLX, shrinking training memory to 5.2GB and enabling local edge fine-tuning of 7B LLMs on consumer laptops.',
          difficultyLevel: 'Intermediate',
          estimatedWeeks: '3 weeks'
        }
      ],
      tokenEfficiencyReport: {
        estimatedInputTokens: 980,
        estimatedOutputTokens: 1390,
        totalEstimatedTokens: 2370,
        underConstraint25k: true,
        efficiencyNotes: 'Targeted synthesis of LoRA parameterization equations, zero-latency inference proof, and edge fine-tuning projects. Consumed 2,370 tokens (~90.5% buffer remaining).'
      }
    }
  },
  {
    id: 'mamba-linear-time-ssm',
    name: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    tag: 'Next-Gen Architecture',
    url: 'https://arxiv.org/abs/2312.00752',
    analysis: {
      paperDetails: {
        title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
        authors: 'Albert Gu, Tri Dao',
        year: '2023',
        venueOrArxiv: 'arXiv:2312.00752 / ICML 2024',
        publication: 'ICML 2024 (International Conference on Machine Learning) / arXiv:2312.00752',
        citationCount: '1,200+',
        githubUrl: 'https://github.com/state-spaces/mamba',
        category: 'State Space Models & Long-Context Architectures'
      },
      coreContext: {
        problemStatement: 'Transformers suffer from fundamental computational bottlenecks: quadratic computational complexity O(N^2) during training and linear memory cache growth (KV cache) during inference, making million-token contexts infeasible on hardware.',
        primeMethodology: 'Mamba introduces Selective State Space Models (SSMs). Unlike prior time-invariant SSMs (such as S4) that cannot perform content-based reasoning, Mamba makes the SSM parameters (B, C, delta) functions of the input token. To maintain GPU efficiency despite losing convolution equivalence, the authors designed a hardware-aware parallel scan algorithm on SRAM.',
        keyMathematicalAlgorithmic: 'Continuous state-space equations: h\'(t) = A*h(t) + B*x(t), y(t) = C*h(t). In Mamba, B = Linear(x), C = Linear(x), and delta = Softplus(Parameter + Linear(x)). Discretization yields A_bar = exp(delta * A) and B_bar = (delta * A)^(-1) * (exp(delta * A) - I) * delta * B. The selective scan maps inputs to outputs in O(N) linear time and O(1) state memory per token.',
        keyConcepts: [
          'Selective State Space Models (SSMs)',
          'Hardware-Aware Parallel Scan (SRAM)',
          'Input-Dependent Time-Varying Parameters',
          'Linear-Time Generation O(1) State Cache',
          'Sub-Quadratic Long Context Scaling'
        ],
        fullSummaryUnder300Words: 'While Transformers dominate deep learning, their quadratic attention mechanism and ballooning KV-cache make long-sequence generation memory-intensive. Gu and Dao present Mamba, a fast linear-time architecture based on Selective State Space Models (SSMs). Prior continuous SSMs were computationally linear but time-invariant, meaning they processed all tokens uniformly regardless of content. Mamba solves this by making the discretization parameters input-dependent (selective), allowing the network to dynamically filter irrelevant information and retain key tokens indefinitely. To overcome the loss of convolution speed, Mamba uses a hardware-aware parallel scan kernel that computes state recurrences directly in fast SRAM rather than slow HBM. Mamba achieves 5x higher inference throughput than Transformers of comparable parameter size, scales to 1M+ token contexts with linear memory, and matches Transformer performance across standard NLP benchmarks.',
        wordCount: 134
      },
      architecturalFlowchart: {
        mermaidCode: `graph TD
    InputTokens["Input Tokens [B, L, D]"] --> InLinear["Linear Expansion Projection (2x Dimension)"]
    InLinear --> SplitPath["Branching Split"]
    
    subgraph MambaBlock ["Mamba Selective SSM Block"]
      SplitPath --> Conv1D["1D Causal Convolution (kernel=4)"]
      Conv1D --> SiLU1["SiLU Activation"]
      
      SiLU1 --> SelectivityBranch["Input-Dependent Parameter Projections"]
      SelectivityBranch --> DeltaProj["Delta Parameter Projection (dt = Softplus(W_dt * x))"]
      SelectivityBranch --> BProj["B Matrix Projection: B(x)"]
      SelectivityBranch --> CProj["C Matrix Projection: C(x)"]
      
      DeltaProj --> Discretization["Hardware-Aware Discretization: A_bar, B_bar"]
      BProj --> Discretization
      
      Discretization --> ParallelScan["Parallel Selective Scan in GPU SRAM (O(L) Complexity)"]
      CProj --> ParallelScan
      
      SplitPath --> GatingBranch["Gating Projection Path"]
      GatingBranch --> SiLU2["SiLU Gating"]
      
      ParallelScan --> ElementMul["Element-wise Multiplication (*)"]
      SiLU2 --> ElementMul
    end
    
    ElementMul --> OutLinear["Linear Output Projection [D]"]
    OutLinear --> Residual["Residual Connection (+)"]
    Residual --> OutputState["Next Layer / Token Logits"]`,
        flowchartLabeledText: `(FLOWCHART)
graph TD
    InputTokens["Input Tokens [B, L, D]"] --> InLinear["Linear Expansion Projection (2x Dimension)"]
    InLinear --> SplitPath["Branching Split"]
    
    subgraph MambaBlock ["Mamba Selective SSM Block"]
      SplitPath --> Conv1D["1D Causal Convolution (kernel=4)"]
      Conv1D --> SiLU1["SiLU Activation"]
      
      SiLU1 --> SelectivityBranch["Input-Dependent Parameter Projections"]
      SelectivityBranch --> DeltaProj["Delta Parameter Projection (dt = Softplus(W_dt * x))"]
      SelectivityBranch --> BProj["B Matrix Projection: B(x)"]
      SelectivityBranch --> CProj["C Matrix Projection: C(x)"]
      
      DeltaProj --> Discretization["Hardware-Aware Discretization: A_bar, B_bar"]
      BProj --> Discretization
      
      Discretization --> ParallelScan["Parallel Selective Scan in GPU SRAM (O(L) Complexity)"]
      CProj --> ParallelScan
      
      SplitPath --> GatingBranch["Gating Projection Path"]
      GatingBranch --> SiLU2["SiLU Gating"]
      
      ParallelScan --> ElementMul["Element-wise Multiplication (*)"]
      SiLU2 --> ElementMul
    end
    
    ElementMul --> OutLinear["Linear Output Projection [D]"]
    OutLinear --> Residual["Residual Connection (+)"]
    Residual --> OutputState["Next Layer / Token Logits"]`
      },
      futureWorkAndInternships: [
        {
          projectTitle: 'Vision Mamba (Vim) for High-Resolution Medical Image Segmentation',
          exactExtension: 'Adapting bidirectional selective state space blocks to 2D image patch sequences for gigapixel whole-slide pathology images without downsampling.',
          targetedPerformance: 'Achieve 4.8x lower GPU memory usage compared to Swin-Transformer and Vision Transformers, enabling processing 4096x4096 images on a single 16GB GPU.',
          recommendedTechStack: ['PyTorch', 'Mamba-SSM', 'Monai (Medical Open Network for AI)', 'CUDA / Triton'],
          implementationMilestones: [
            'Milestone 1: Implement bidirectional patch scanning (forward and backward scan across horizontal & vertical raster order).',
            'Milestone 2: Integrate into U-Net encoder-decoder backbone replacing standard convolutional / transformer bottleneck.',
            'Milestone 3: Benchmark Dice similarity coefficient and VRAM usage on the ISIC / Camelyon pathology dataset.'
          ],
          resumeBulletPoint: 'Implemented bidirectional 2D Vision Mamba segmentation architecture in PyTorch, reducing peak VRAM by 4.8x and processing 4K gigapixel medical images on a single GPU.',
          difficultyLevel: 'Advanced',
          estimatedWeeks: '4-5 weeks'
        },
        {
          projectTitle: 'Mamba ONNX Runtime & WebAssembly (Wasm) Edge Inference',
          exactExtension: 'Exporting Mamba selective scan operations into customized ONNX operators and compiling to WebGPU / WASM for zero-install browser LLM execution.',
          targetedPerformance: 'Run 130M Mamba model entirely client-side in Google Chrome at 35+ tokens/second on an Apple M1 MacBook with zero server costs.',
          recommendedTechStack: ['ONNX Runtime Web', 'WebGPU', 'Triton / C++', 'TypeScript / React'],
          implementationMilestones: [
            'Milestone 1: Rewrite parallel selective scan into clean loop/tensor operations compatible with ONNX opset 18.',
            'Milestone 2: Build ONNX custom operator with WebGPU shader implementation for state updates.',
            'Milestone 3: Deploy interactive browser demonstration with real-time token streaming and memory meter.'
          ],
          resumeBulletPoint: 'Built zero-dependency WebGPU/ONNX Runtime inference runtime for Mamba models, achieving 35 tokens/sec local execution in-browser with zero server infrastructure overhead.',
          difficultyLevel: 'Intermediate',
          estimatedWeeks: '3-4 weeks'
        },
        {
          projectTitle: 'Streaming Audio Speech Recognition with Recurrent Mamba',
          exactExtension: 'Replacing the conformer/transformer attention blocks in Whisper with streaming Mamba SSM blocks for ultra-low latency live speech-to-text.',
          targetedPerformance: 'Reduce audio recognition latency from 450ms chunk buffers to < 60ms real-time streaming latency with zero accuracy drop on LibriSpeech.',
          recommendedTechStack: ['PyTorch', 'Torchaudio', 'Whisper / HuggingFace', 'Weights & Biases'],
          implementationMilestones: [
            'Milestone 1: Extract mel-spectrogram streaming audio pipeline in PyTorch with circular ring buffers.',
            'Milestone 2: Train causal Mamba acoustic model with Connectionist Temporal Classification (CTC) loss.',
            'Milestone 3: Measure Word Error Rate (WER) and real-time factor (RTF) across noisy audio streams.'
          ],
          resumeBulletPoint: 'Engineered streaming speech-to-text pipeline substituting Transformer attention with causal Mamba SSMs, reducing end-to-end latency to <60ms for live transcription.',
          difficultyLevel: 'Intermediate',
          estimatedWeeks: '3 weeks'
        }
      ],
      tokenEfficiencyReport: {
        estimatedInputTokens: 1040,
        estimatedOutputTokens: 1410,
        totalEstimatedTokens: 2450,
        underConstraint25k: true,
        efficiencyNotes: 'Extracted continuous-to-discrete equations, selective scan SRAM memory mechanism, and 3 production edge project proposals using 2,450 tokens (90.2% buffer conserved).'
      }
    }
  }
];
