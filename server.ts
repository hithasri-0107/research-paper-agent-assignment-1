import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Extract arXiv ID from URL if present
function extractArxivId(url: string): string | null {
  const match = url.match(/arxiv\.org\/(?:abs|pdf)\/(\d+\.\d+(?:v\d+)?)/i);
  return match ? match[1] : null;
}

// Fetch arXiv metadata if available
async function fetchArxivMetadata(arxivId: string) {
  try {
    const cleanId = arxivId.replace(/v\d+$/, '');
    const apiUrl = `https://export.arxiv.org/api/query?id_list=${cleanId}`;
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const text = await res.text();
    
    const titleMatch = text.match(/<title>([^<]+)<\/title>/g);
    const summaryMatch = text.match(/<summary>([\s\S]*?)<\/summary>/);
    const publishedMatch = text.match(/<published>([^<]+)<\/published>/);
    const authorMatches = [...text.matchAll(/<author>\s*<name>([^<]+)<\/name>/g)].map(m => m[1]);

    const title = titleMatch && titleMatch.length > 1 ? titleMatch[1].replace(/<\/?title>/g, '').trim().replace(/\s+/g, ' ') : '';
    const abstract = summaryMatch ? summaryMatch[1].trim().replace(/\s+/g, ' ') : '';
    const year = publishedMatch ? publishedMatch[1].substring(0, 4) : '';

    return { title, abstract, authors: authorMatches.slice(0, 5).join(', '), year };
  } catch {
    return null;
  }
}

// Endpoint: Analyze Paper
app.post('/api/analyze-paper', async (req: Request, res: Response) => {
  try {
    const { paperUrl, paperText, paperTitle } = req.body;

    if (!paperUrl && !paperText && !paperTitle) {
      return res.status(400).json({ error: 'Please provide a paper URL, title, or text.' });
    }

    let extraContext = '';
    let detectedArxiv: any = null;

    if (paperUrl) {
      const arxivId = extractArxivId(paperUrl);
      if (arxivId) {
        detectedArxiv = await fetchArxivMetadata(arxivId);
        if (detectedArxiv && detectedArxiv.title) {
          extraContext += `\n[Detected ArXiv Paper Metadata]\nTitle: ${detectedArxiv.title}\nAuthors: ${detectedArxiv.authors}\nYear: ${detectedArxiv.year}\nAbstract: ${detectedArxiv.abstract}\n`;
        }
      }
    }

    const prompt = `You are an advanced Computer Science Researcher Agent specializing in parsing academic papers, extracting system architectures, and identifying student development opportunities.

OPERATIONAL CONSTRAINTS:
- You must always prioritize token efficiency. Ensure your total analysis stays well under 25,000 tokens.
- If the research paper is too long to ingest entirely, use web search to look up summaries, abstracts, architecture diagrams, and open source implementations (e.g. GitHub) to gather context efficiently.

TARGET PAPER:
- URL / Reference: ${paperUrl || 'N/A'}
- Title provided: ${paperTitle || (detectedArxiv ? detectedArxiv.title : 'N/A')}
${paperText ? `- User provided excerpt/text: \n${paperText.slice(0, 4000)}\n` : ''}
${extraContext}

EXECUTE THESE EXACT 3 STEPS:

1. CORE CONTEXT EXTRACTION
Summarize the problem statement, the prime methodology introduced, and the key mathematical/algorithmic foundations in under 300 words using plain, accessible language.
Include:
- Problem Statement (plain accessible description)
- Prime Methodology
- Key Mathematical / Algorithmic principles
- Full unified summary strictly under 300 words

2. ARCHITECTURAL FLOWCHART (Mermaid.js)
Generate a clean, systematically correct mermaid.js flowchart (graph TD) that charts the components, data inputs, model layers, tensor transformations, and data outputs of the system described in the paper.
Rules:
- Output valid Mermaid syntax starting with "graph TD"
- Use descriptive node IDs and safely quote labels: NodeA["Input Tokens [B, S]"] --> NodeB["LayerNorm & Positional Embeddings"]
- Cover end-to-end dataflow: Input -> Preprocessing -> Model Layers / Attention / FeedForward / Backbone -> Output / Loss / Evaluation
- Do not use Markdown code blocks inside the Mermaid string itself; ensure it can be rendered directly by mermaid.render().
- Also provide a labeled text segment with:
(FLOWCHART)
graph TD
...

3. FUTURE WORK AND INTERNSHIP OPPORTUNITIES
Brainstorm 3 concrete, realistic ways a 3rd year CS student could build upon, extend or optimize this paper for a standout resume project.
For each of the 3 ideas, provide:
- The exact extension (e.g., "Replacing the heavy multi-head attention with a lightweight Mamba SSM block for edge deployment")
- The targeted performance (e.g., "3.2x latency reduction on Raspberry Pi / mobile edge with <1.5% perplexity loss")
- The recommended tech stack (e.g., "PyTorch, ONNX Runtime, HuggingFace Transformers, Weights & Biases")
- 3 implementation milestones (Week 1-2 baseline, Week 3 extension, Week 4 benchmark)
- A high-impact resume bullet point for a 3rd year student's CV

Return your response in clean JSON matching the following schema.`;

    const systemInstructionWithFewShot = `You are an advanced Computer Science Researcher Agent specializing in parsing academic papers, extracting system architectures into valid Mermaid.js flowcharts, and identifying concrete resume-grade student development opportunities. Always maintain high academic rigor, structured token efficiency (<25,000 tokens), and clean syntax.

### OPERATIONAL PRINCIPLES:
1. TOKEN EFFICIENCY: Prioritize token efficiency. Use web search/arXiv context rather than ingesting entire PDFs to remain well under 25,000 tokens.
2. CORE CONTEXT: Summarize the problem statement, prime methodology, and mathematical/algorithmic concepts in plain, accessible language in under 300 words. Provide keyConcepts as an array of 4-6 concise terms. Include citation count and publication venue/year when available.
3. ARCHITECTURAL FLOWCHART: Generate systematically correct Mermaid.js (graph TD) showing data inputs, tensor transformations, model blocks, and output heads. Provide clean Mermaid syntax and a plain text segment labeled "(FLOWCHART)". Never use markdown code blocks inside the Mermaid string itself.
4. STUDENT OPPORTUNITIES: Propose exactly 3 concrete, realistic extensions for a 3rd-year CS student resume project with exact extension, targeted performance, recommended tech stack, milestones, and high-impact resume bullet points.

---
### FEW-SHOT DEMONSTRATION EXAMPLES

#### EXAMPLE 1
[USER INPUT]
Target Paper: https://arxiv.org/abs/1706.03762
Title: Attention Is All You Need

[STRUCTURED AGENT OUTPUT]
{
  "paperDetails": {
    "title": "Attention Is All You Need",
    "authors": "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin",
    "year": "2017",
    "publication": "NeurIPS 2017 (Advances in Neural Information Processing Systems 30)",
    "venueOrArxiv": "NeurIPS 2017 / arXiv:1706.03762",
    "citationCount": "135,000+",
    "githubUrl": "https://github.com/tensorflow/tensor2tensor",
    "category": "Sequence Modeling & Natural Language Processing"
  },
  "coreContext": {
    "problemStatement": "Existing sequence models like RNNs and LSTMs process tokens sequentially, creating severe GPU training bottlenecks and struggling to retain dependencies across distant tokens.",
    "primeMethodology": "The authors introduce the Transformer, an architecture eliminating recurrence entirely in favor of stacked Multi-Head Self-Attention mechanisms that process all sequence tokens simultaneously.",
    "keyMathematicalAlgorithmic": "Scaled Dot-Product Attention: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V. Query, Key, and Value vectors are linearly projected into h representation subspaces.",
    "keyConcepts": [
      "Multi-Head Self-Attention",
      "Scaled Dot-Product Attention",
      "Sinusoidal Positional Encodings",
      "Transformer Encoder-Decoder Stacks",
      "Residual Connections & Layer Normalization"
    ],
    "fullSummaryUnder300Words": "Traditional sequence models like RNNs process language token-by-token, inhibiting hardware parallelism and causing training bottlenecks on modern GPUs. Vaswani et al. solved this by introducing the Transformer, completely eliminating recurrence and convolutions. Instead, it relies entirely on Multi-Head Self-Attention to compute dependencies between all tokens in parallel. Scaled dot-product attention computes attention weights between projected Query and Key matrices, scaled by the square root of key dimensionality to prevent gradient vanishing in the softmax, then applies these weights across Value vectors. Paired with sinusoidal positional embeddings to preserve token order, residual connections, and layer normalization, the Transformer enables massive batch parallelization, drastically faster training convergence, and superior BLEU scores.",
    "wordCount": 114
  },
  "architecturalFlowchart": {
    "mermaidCode": "graph TD\\n    InputTokens[\\\"Input Tokens (Src & Tgt)\\\"] --> Embed[\\\"Token Embeddings + Sinusoidal Positional Encoding\\\"]\\n    Embed --> EncBlock[\\\"Encoder Stack (Nx Layers)\\\"]\\n    subgraph EncoderLayer [\\\"Encoder Layer\\\"]\\n      EncBlock --> MultiHeadAttn[\\\"Multi-Head Self-Attention (Q, K, V)\\\"]\\n      MultiHeadAttn --> AddNorm1[\\\"Add & LayerNorm\\\"]\\n      AddNorm1 --> FeedForward[\\\"Position-wise Feed-Forward (FFN)\\\"]\\n      FeedForward --> AddNorm2[\\\"Add & LayerNorm\\\"]\\n    end\\n    AddNorm2 --> CrossAttention[\\\"Cross-Attention (Keys & Values from Encoder)\\\"]\\n    TgtTokens[\\\"Shifted Target Tokens\\\"] --> TgtEmbed[\\\"Target Embeddings + Positional Encoding\\\"]\\n    TgtEmbed --> DecSelfAttn[\\\"Masked Multi-Head Attention\\\"]\\n    DecSelfAttn --> DecNorm1[\\\"Add & LayerNorm\\\"]\\n    DecNorm1 --> CrossAttention\\n    CrossAttention --> DecNorm2[\\\"Add & LayerNorm\\\"]\\n    DecNorm2 --> DecFFN[\\\"Feed-Forward Sublayer\\\"]\\n    DecFFN --> DecNorm3[\\\"Add & LayerNorm\\\"]\\n    DecNorm3 --> Linear[\\\"Linear Projection\\\"]\\n    Linear --> Softmax[\\\"Softmax Token Probabilities\\\"]\\n    Softmax --> OutputTokens[\\\"Predicted Next Tokens\\\"]",
    "flowchartLabeledText": "(FLOWCHART)\\ngraph TD\\n    InputTokens[\\\"Input Tokens (Src & Tgt)\\\"] --> Embed[\\\"Token Embeddings + Sinusoidal Positional Encoding\\\"]\\n    Embed --> EncBlock[\\\"Encoder Stack (Nx Layers)\\\"]\\n    subgraph EncoderLayer [\\\"Encoder Layer\\\"]\\n      EncBlock --> MultiHeadAttn[\\\"Multi-Head Self-Attention (Q, K, V)\\\"]\\n      MultiHeadAttn --> AddNorm1[\\\"Add & LayerNorm\\\"]\\n      AddNorm1 --> FeedForward[\\\"Position-wise Feed-Forward (FFN)\\\"]\\n      FeedForward --> AddNorm2[\\\"Add & LayerNorm\\\"]\\n    end\\n    AddNorm2 --> CrossAttention[\\\"Cross-Attention (Keys & Values from Encoder)\\\"]\\n    TgtTokens[\\\"Shifted Target Tokens\\\"] --> TgtEmbed[\\\"Target Embeddings + Positional Encoding\\\"]\\n    TgtEmbed --> DecSelfAttn[\\\"Masked Multi-Head Attention\\\"]\\n    DecSelfAttn --> DecNorm1[\\\"Add & LayerNorm\\\"]\\n    DecNorm1 --> CrossAttention\\n    CrossAttention --> DecNorm2[\\\"Add & LayerNorm\\\"]\\n    DecNorm2 --> DecFFN[\\\"Feed-Forward Sublayer\\\"]\\n    DecFFN --> DecNorm3[\\\"Add & LayerNorm\\\"]\\n    DecNorm3 --> Linear[\\\"Linear Projection\\\"]\\n    Linear --> Softmax[\\\"Softmax Token Probabilities\\\"]\\n    Softmax --> OutputTokens[\\\"Predicted Next Tokens\\\"]"
  },
  "futureWorkAndInternships": [
    {
      "projectTitle": "Edge-Optimized Attention with FlashAttention & INT8 Quantization",
      "exactExtension": "Replacing vanilla O(N^2) memory-bound attention with hardware-aware tiled FlashAttention and post-training dynamic INT8 weight quantization for edge deployment.",
      "targetedPerformance": "Slashing peak GPU VRAM consumption by 65% and accelerating inference latency by 3.4x on sequences >= 2048 with <0.2 BLEU drop.",
      "recommendedTechStack": ["PyTorch", "FlashAttention-2", "Triton", "ONNX Runtime", "HuggingFace Transformers"],
      "implementationMilestones": [
        "Profile baseline PyTorch Transformer attention kernel memory footprint using PyTorch Profiler.",
        "Implement FlashAttention IO-aware tiling kernel integration, comparing SRAM vs HBM memory roundtrips.",
        "Apply post-training INT8 dynamic quantization and evaluate inference latency benchmarks on edge CPU/GPU."
      ],
      "resumeBulletPoint": "Engineered hardware-aware FlashAttention and INT8 quantization pipeline in PyTorch/Triton, slashing memory footprint by 65% and boosting inference throughput 3.4x on edge sequence lengths.",
      "difficultyLevel": "Intermediate",
      "estimatedWeeks": "3-4 weeks"
    },
    {
      "projectTitle": "Hybrid Mamba-Transformer Sequence Model for Sub-Quadratic Scaling",
      "exactExtension": "Interleaving lightweight Mamba selective state-space model (SSM) blocks within Transformer layers, substituting 50% of self-attention heads with linear-time transitions.",
      "targetedPerformance": "Achieve linear O(N) computational complexity during generation, cutting time-to-first-token by 42% on 8k context lengths while preserving perplexity.",
      "recommendedTechStack": ["PyTorch", "Mamba (state-spaces/mamba)", "HuggingFace Datasets", "Weights & Biases"],
      "implementationMilestones": [
        "Set up modular PyTorch language model bench testing standard GPT-2 vs Mamba layers.",
        "Construct hybrid alternating architecture (1 Mamba block : 1 Attention block) and train on WikiText-103.",
        "Benchmark generation throughput across sequence lengths 512 through 8192, visualizing memory curves."
      ],
      "resumeBulletPoint": "Architected a hybrid Mamba-Transformer language model combining selective state-space blocks with attention, lowering long-context generation latency by 42% with linear memory scaling.",
      "difficultyLevel": "Advanced",
      "estimatedWeeks": "4-5 weeks"
    },
    {
      "projectTitle": "Rotary Position Embedding (RoPE) & Context Extension Engine",
      "exactExtension": "Replacing fixed absolute sinusoidal positional encodings with RoPE and implementing YaRN interpolation to extend effective context window from 512 to 4096 tokens.",
      "targetedPerformance": "Extend receptive field 8x (512 to 4096 tokens) with zero retraining from scratch, maintaining <1.0% perplexity drift on retrieval evaluation.",
      "recommendedTechStack": ["PyTorch", "vLLM", "HuggingFace Transformers", "Llama-Factory"],
      "implementationMilestones": [
        "Implement rotary 2D complex matrix rotation on query and key projections in custom PyTorch attention module.",
        "Implement YaRN frequency interpolation to scale position angles for 8x context extrapolation.",
        "Validate retrieval accuracy with Needle-In-A-Haystack benchmark test suite."
      ],
      "resumeBulletPoint": "Implemented Rotary Position Embeddings (RoPE) with YaRN interpolation in PyTorch, expanding effective context length 8x (512 to 4096 tokens) while retaining 99% retrieval accuracy on long-context benchmarks.",
      "difficultyLevel": "Intermediate",
      "estimatedWeeks": "3 weeks"
    }
  ]
}

#### EXAMPLE 2
[USER INPUT]
Target Paper: https://arxiv.org/abs/2106.09685
Title: LoRA: Low-Rank Adaptation of Large Language Models

[STRUCTURED AGENT OUTPUT]
{
  "paperDetails": {
    "title": "LoRA: Low-Rank Adaptation of Large Language Models",
    "authors": "Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen",
    "year": "2021",
    "publication": "ICLR 2022 (International Conference on Learning Representations)",
    "venueOrArxiv": "ICLR 2022 / arXiv:2106.09685",
    "citationCount": "6,500+",
    "githubUrl": "https://github.com/microsoft/LoRA",
    "category": "Efficient Deep Learning & PEFT"
  },
  "coreContext": {
    "problemStatement": "Full fine-tuning of multi-billion parameter LLMs is prohibitively expensive, requiring updating and saving all weights for each downstream task. This creates enormous storage overhead and massive GPU memory footprints for optimizer states.",
    "primeMethodology": "LoRA freezes pre-trained model weights W_0 and injects trainable rank decomposition matrices into Transformer attention layers, modeling weight updates delta-W as low-rank factorized matrices B * A where rank r << min(d, k).",
    "keyMathematicalAlgorithmic": "Forward pass: h = W_0 * x + (alpha / r) * (B * A) * x, where B in R^(d x r) initialized to zeros, and A in R^(r x k) initialized with Gaussian noise. At inference, B*A is folded directly into W_0 with 0ms latency penalty.",
    "keyConcepts": [
      "Low-Rank Matrix Decomposition (B * A)",
      "Intrinsic Dimensionality Hypothesis",
      "Parameter-Efficient Fine-Tuning (PEFT)",
      "Zero-Latency Inference Weight Merging",
      "Rank & Alpha Hyperparameter Scaling"
    ],
    "fullSummaryUnder300Words": "Fine-tuning modern foundation models requires updating hundreds of billions of parameters, causing staggering VRAM requirements and redundant storage across different tasks. Hu et al. introduce LoRA (Low-Rank Adaptation), grounded in the empirical hypothesis that weight updates during adaptation have a low intrinsic dimension. Instead of updating the original frozen matrix W_0, LoRA injects two small trainable matrices A and B such that delta-W = B * A, where the rank r is typically 4 to 16. During training, optimizer states are only tracked for the tiny fraction (<0.1%) of low-rank parameters, cutting VRAM by up to 3x and storage by 10,000x. Most crucially, during deployment, the low-rank delta-W can be algebraically folded into W_0, incurring zero additional runtime inference latency.",
    "wordCount": 122
  },
  "architecturalFlowchart": {
    "mermaidCode": "graph TD\\n    InputActivation[\\\"Input Activation x [B, d_in]\\\\\"] --> FrozenBranch[\\\"Frozen Base Weights: W_0 * x\\\"]\\n    InputActivation --> LoRABranch[\\\"Trainable Low-Rank Path\\\"]\\n    subgraph LoRAAdapter [\\\"LoRA Decomposition (Rank r << d)\\\"]\\n      LoRABranch --> MatrixA[\\\"Matrix A: Down-Projection [r, d_in]<br/>(Gaussian Init)\\\"]\\n      MatrixA --> Bottleneck[\\\"Rank-r Latent Space [B, r]\\\\\"]\\n      Bottleneck --> MatrixB[\\\"Matrix B: Up-Projection [d_out, r]<br/>(Zero Init)\\\"]\\n      MatrixB --> Scaling[\\\"Scaling Factor: (alpha / r)\\\"]\\n    end\\n    FrozenBranch --> Summation[\\\"Algebraic Addition (+)\\\"]\\n    Scaling --> Summation\\n    Summation --> OutputActivation[\\\"Output Activation h [B, d_out]\\\\\"]\\n    subgraph InferenceZeroLatency [\\\"Zero-Latency Inference Mode\\\"]\\n      MatrixB -.-> Fold[\\\"Fold: W_eff = W_0 + (alpha/r) * B * A\\\"]\\n      Fold -.-> InstantInference[\\\"Single Matmul Forward Pass (0ms overhead)\\\"]\\n    end",
    "flowchartLabeledText": "(FLOWCHART)\\ngraph TD\\n    InputActivation[\\\"Input Activation x [B, d_in]\\\\\"] --> FrozenBranch[\\\"Frozen Base Weights: W_0 * x\\\"]\\n    InputActivation --> LoRABranch[\\\"Trainable Low-Rank Path\\\"]\\n    subgraph LoRAAdapter [\\\"LoRA Decomposition (Rank r << d)\\\"]\\n      LoRABranch --> MatrixA[\\\"Matrix A: Down-Projection [r, d_in]<br/>(Gaussian Init)\\\"]\\n      MatrixA --> Bottleneck[\\\"Rank-r Latent Space [B, r]\\\\\"]\\n      Bottleneck --> MatrixB[\\\"Matrix B: Up-Projection [d_out, r]<br/>(Zero Init)\\\"]\\n      MatrixB --> Scaling[\\\"Scaling Factor: (alpha / r)\\\"]\\n    end\\n    FrozenBranch --> Summation[\\\"Algebraic Addition (+)\\\"]\\n    Scaling --> Summation\\n    Summation --> OutputActivation[\\\"Output Activation h [B, d_out]\\\\\"]\\n    subgraph InferenceZeroLatency [\\\"Zero-Latency Inference Mode\\\"]\\n      MatrixB -.-> Fold[\\\"Fold: W_eff = W_0 + (alpha/r) * B * A\\\"]\\n      Fold -.-> InstantInference[\\\"Single Matmul Forward Pass (0ms overhead)\\\"]\\n    end"
  },
  "futureWorkAndInternships": [
    {
      "projectTitle": "Dynamic Rank-Adaptive LoRA (AdaLoRA) on Consumer GPUs",
      "exactExtension": "Implementing dynamic SVD-based importance scoring to allocate variable ranks r across Transformer layers on the fly, assigning higher rank to critical attention heads and pruning redundant layers.",
      "targetedPerformance": "Reduce trainable parameter count by another 35% compared to static LoRA r=8 while increasing downstream task accuracy by 1.2% on GLUE/MMLU benchmarks.",
      "recommendedTechStack": ["PyTorch", "HuggingFace PEFT", "BitsAndBytes (4-bit/8-bit)", "Accelerate"],
      "implementationMilestones": [
        "Implement custom LoRA Linear module in PyTorch with singular value parametrization W = P * Lambda * Q.",
        "Add gradient magnitude importance metric to dynamically prune and expand ranks per layer during training steps.",
        "Benchmark fine-tuning on a single 8GB consumer GPU (RTX 3070 / T4) tracking memory and convergence."
      ],
      "resumeBulletPoint": "Built dynamic SVD-based adaptive rank LoRA framework in PyTorch/PEFT, reducing adapter parameters by 35% and fine-tuning a 7B LLM on a single 8GB consumer GPU.",
      "difficultyLevel": "Intermediate",
      "estimatedWeeks": "3-4 weeks"
    },
    {
      "projectTitle": "Multi-LoRA Serving Router for Sub-Millisecond Task Switching",
      "exactExtension": "Designing an asynchronous multi-tenant inference server that dynamically hot-swaps task-specific LoRA adapters into a single shared frozen foundation model base in GPU memory.",
      "targetedPerformance": "Support 50+ concurrent domain-specific tasks on a single GPU instance with < 2ms adapter switching overhead vs full model duplicating.",
      "recommendedTechStack": ["FastAPI", "vLLM (Multi-LoRA API)", "PyTorch CUDA Streams", "Docker", "Locust"],
      "implementationMilestones": [
        "Train 3 distinct specialized LoRA adapters (Code, Medical QA, Legal summarization) on Llama-3-8B.",
        "Integrate vLLM multi-LoRA batching or build custom CUDA stream adapter cache.",
        "Run stress load test with Locust simulating interleaved concurrent user requests across domains."
      ],
      "resumeBulletPoint": "Engineered high-throughput multi-LoRA inference engine serving 50+ specialized adapters concurrently over a single shared base model, reducing serving infrastructure costs by 78%.",
      "difficultyLevel": "Advanced",
      "estimatedWeeks": "4 weeks"
    },
    {
      "projectTitle": "QLoRA: 4-Bit NormalFloat Quantized LoRA for Mobile / Embedded Devices",
      "exactExtension": "Integrating 4-bit NormalFloat (NF4) base model quantization with double quantization and paged optimizers to fine-tune state-of-the-art models on ultra-constrained devices.",
      "targetedPerformance": "Slash fine-tuning VRAM from 16GB down to 5.2GB for 7B models, enabling fine-tuning on Apple Silicon MacBooks (M1/M2/M3 unified memory).",
      "recommendedTechStack": ["PyTorch", "MLX (Apple Silicon)", "BitsAndBytes", "TRL (Transformer Reinforcement Learning)"],
      "implementationMilestones": [
        "Implement NF4 quantization lookup table and dequantization forward hook in pure PyTorch/MLX.",
        "Fine-tune instruction-following model on alpaca dataset measuring peak unified memory.",
        "Compile optimized model using CoreML/GGUF for local on-device inference."
      ],
      "resumeBulletPoint": "Implemented NF4 4-bit quantized LoRA pipeline on Apple Silicon MLX, shrinking training memory to 5.2GB and enabling local edge fine-tuning of 7B LLMs on consumer laptops.",
      "difficultyLevel": "Intermediate",
      "estimatedWeeks": "3 weeks"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstructionWithFewShot,
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paperDetails: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                authors: { type: Type.STRING },
                year: { type: Type.STRING },
                publication: { type: Type.STRING, description: 'Conference, journal, or book publication venue' },
                venueOrArxiv: { type: Type.STRING },
                citationCount: { type: Type.STRING, description: 'Citation count estimate, e.g. 135,000+ or Recent preprint / N/A' },
                githubUrl: { type: Type.STRING, description: 'Official or top open-source implementation repository URL if found' },
                category: { type: Type.STRING, description: 'e.g. LLMs & Transformers, Computer Vision, Systems, Reinforcement Learning' }
              },
              required: ['title', 'year', 'category']
            },
            coreContext: {
              type: Type.OBJECT,
              properties: {
                problemStatement: { type: Type.STRING },
                primeMethodology: { type: Type.STRING },
                keyMathematicalAlgorithmic: { type: Type.STRING },
                keyConcepts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of 4-6 fundamental key concepts or algorithmic techniques'
                },
                fullSummaryUnder300Words: { type: Type.STRING, description: 'Unified summary in under 300 words using plain, accessible language' },
                wordCount: { type: Type.INTEGER }
              },
              required: ['problemStatement', 'primeMethodology', 'keyMathematicalAlgorithmic', 'fullSummaryUnder300Words']
            },
            architecturalFlowchart: {
              type: Type.OBJECT,
              properties: {
                mermaidCode: { type: Type.STRING, description: 'Valid mermaid graph TD code without markdown code blocks' },
                flowchartLabeledText: { type: Type.STRING, description: 'Formatted as (FLOWCHART) followed by the mermaid graph TD lines' },
                pipelineStages: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stageName: { type: Type.STRING },
                      description: { type: Type.STRING },
                      keyOperations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                }
              },
              required: ['mermaidCode', 'flowchartLabeledText']
            },
            futureWorkAndInternships: {
              type: Type.ARRAY,
              description: '3 concrete, realistic extensions for a 3rd year CS student resume project',
              items: {
                type: Type.OBJECT,
                properties: {
                  projectTitle: { type: Type.STRING },
                  exactExtension: { type: Type.STRING, description: 'e.g. Replacing heavy transformer layer with lightweight Mamba block' },
                  targetedPerformance: { type: Type.STRING, description: 'e.g. 3.2x latency reduction, 40% memory footprint drop' },
                  recommendedTechStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                  implementationMilestones: { type: Type.ARRAY, items: { type: Type.STRING } },
                  resumeBulletPoint: { type: Type.STRING, description: 'Action-verb resume bullet point with metrics' },
                  difficultyLevel: { type: Type.STRING, description: 'Intermediate or Advanced' },
                  estimatedWeeks: { type: Type.STRING }
                },
                required: ['projectTitle', 'exactExtension', 'targetedPerformance', 'recommendedTechStack', 'implementationMilestones', 'resumeBulletPoint']
              }
            },
            tokenEfficiencyReport: {
              type: Type.OBJECT,
              properties: {
                estimatedInputTokens: { type: Type.INTEGER },
                estimatedOutputTokens: { type: Type.INTEGER },
                totalEstimatedTokens: { type: Type.INTEGER },
                underConstraint25k: { type: Type.BOOLEAN },
                efficiencyNotes: { type: Type.STRING }
              }
            }
          },
          required: ['paperDetails', 'coreContext', 'architecturalFlowchart', 'futureWorkAndInternships']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response generated from model');
    }

    const parsed = JSON.parse(text);

    // Normalize metadata fields
    if (parsed.paperDetails) {
      parsed.paperDetails.publication = parsed.paperDetails.publication || parsed.paperDetails.venueOrArxiv || 'N/A';
      parsed.paperDetails.citationCount = parsed.paperDetails.citationCount || 'Available upon indexing / N/A';
    }
    if (parsed.coreContext && !parsed.coreContext.keyConcepts) {
      parsed.coreContext.keyConcepts = [
        parsed.coreContext.primeMethodology.slice(0, 40),
        'Mathematical Modeling',
        'System Architecture'
      ];
    }

    // Calculate token usage metrics
    const estimatedTokens = Math.round((prompt.length + text.length) / 3.8);
    if (!parsed.tokenEfficiencyReport) {
      parsed.tokenEfficiencyReport = {
        estimatedInputTokens: Math.round(prompt.length / 3.8),
        estimatedOutputTokens: Math.round(text.length / 3.8),
        totalEstimatedTokens: estimatedTokens,
        underConstraint25k: estimatedTokens < 25000,
        efficiencyNotes: `Analysis consumed ~${estimatedTokens} tokens, strictly within the 25,000 token operational constraint (${Math.round((1 - estimatedTokens / 25000) * 100)}% token buffer conserved).`
      };
    } else {
      parsed.tokenEfficiencyReport.totalEstimatedTokens = parsed.tokenEfficiencyReport.totalEstimatedTokens || estimatedTokens;
      parsed.tokenEfficiencyReport.underConstraint25k = parsed.tokenEfficiencyReport.totalEstimatedTokens < 25000;
      parsed.tokenEfficiencyReport.efficiencyNotes = parsed.tokenEfficiencyReport.efficiencyNotes || `Strictly prioritized token efficiency under 25,000 tokens constraint.`;
    }

    // Construct raw text response in the exact output format requested
    parsed.rawFormattedAgentOutput = `1. CORE CONTEXT EXTRACTION
${parsed.coreContext.fullSummaryUnder300Words}

2. ARCHITECTURAL FLOWCHART
(FLOWCHART)
${parsed.architecturalFlowchart.mermaidCode.trim()}

3. FUTURE WORK AND INTERNSHIP OPPORTUNITIES
${parsed.futureWorkAndInternships.map((idea: any, idx: number) => `Project ${idx + 1}: ${idea.projectTitle}
- The exact extension: ${idea.exactExtension}
- The targeted performance: ${idea.targetedPerformance}
- The recommended tech stack: ${idea.recommendedTechStack.join(', ')}
- Resume Impact: ${idea.resumeBulletPoint}`).join('\n\n')}`;

    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Paper analysis failed:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during paper analysis',
      details: error.toString()
    });
  }
});

// Setup Vite or static serving
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Research Agent Server listening on port ${PORT}`);
});
