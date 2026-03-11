// Rich article content mapped by slug
export const ARTICLE_CONTENT: Record<string, string> = {
  "bygga-rag-pipelines-langchain": `## Introduktion till RAG

Retrieval-Augmented Generation (RAG) kombinerar sökning i en kunskapsbas med generativ AI. Istället för att förlita sig enbart på en LLM:s interna kunskap, hämtar RAG relevant kontext från dina egna datakällor innan modellen genererar ett svar.

![Neural network data flow](https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop)

## Varför RAG?

- **Aktuell information**: LLM:er har en kunskapscutoff, men RAG ger tillgång till realtidsdata
- **Domänspecifik kunskap**: Använd företagets interna dokument som kunskapskälla
- **Minskad hallucination**: Modellen baserar svaren på faktisk data
- **Kostnadseffektivt**: Billigare än att finjustera hela modellen

## Arkitektur

En typisk RAG-pipeline består av tre steg:

1. **Indexering** — Dokument delas upp i chunks och omvandlas till vektorer
2. **Retrieval** — Användarens fråga matchas mot relevanta chunks
3. **Generation** — LLM genererar svar baserat på hämtad kontext

\`\`\`python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import SupabaseVectorStore
from langchain.chains import RetrievalQA
from langchain.llms import ChatOpenAI

# Skapa embeddings
embeddings = OpenAIEmbeddings()

# Anslut till vektordatabas
vectorstore = SupabaseVectorStore(
    client=supabase_client,
    embedding=embeddings,
    table_name="documents",
)

# Bygg RAG-chain
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"),
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
)
\`\`\`

## Chunking-strategier

Hur du delar upp dokument påverkar kvaliteten avsevärt:

### Fixed-size chunks
Enklast att implementera. Dela text i block om 500-1000 tokens med viss överlappning.

### Semantisk chunking
Använd NLP för att identifiera naturliga gränser i texten — stycken, rubriker, meningsgrupper.

\`\`\`python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\\n\\n", "\\n", ". ", " "]
)
chunks = splitter.split_documents(documents)
\`\`\`

![AI code visualization](https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop)

## Optimering

### Hybrid search
Kombinera vektorsökning med BM25 keyword search för bättre precision:

\`\`\`python
from langchain.retrievers import EnsembleRetriever

ensemble = EnsembleRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    weights=[0.6, 0.4]
)
\`\`\`

### Re-ranking
Använd en cross-encoder för att ranka om de hämtade dokumenten:

\`\`\`python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker

reranker = CrossEncoderReranker(model_name="cross-encoder/ms-marco-MiniLM-L-6-v2")
compression_retriever = ContextualCompressionRetriever(
    base_retriever=vectorstore.as_retriever(),
    base_compressor=reranker
)
\`\`\`

## Utvärdering

Mät din RAG-pipelines kvalitet med:

- **Faithfulness** — Stämmer svaret med källdokumenten?
- **Answer relevancy** — Besvarar svaret frågan?
- **Context precision** — Är de hämtade dokumenten relevanta?

## Sammanfattning

RAG är en kraftfull teknik som låter dig bygga AI-applikationer med tillgång till dina egna data. Med rätt chunking, retrieval och re-ranking kan du skapa system som ger korrekta, kontextuella svar baserade på aktuell information.`,

  "fine-tuning-llm-svenska": `## Varför finjustera?

Att finjustera en LLM innebär att fortsätta träna en förtränad modell på din egen data. Detta ger modellen domänspecifik kunskap och anpassat beteende.

![Machine learning training](https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop)

## Förberedelser

### Välj basmodell
- **Llama 3** — Metas open source-modell, stark baseline
- **Mistral** — Effektiv och snabb, bra för svenska
- **GPT-SW3** — AI Swedens svenska språkmodell

### Datapreparering

\`\`\`python
import json

# Format: instruction-following
training_data = [
    {
        "instruction": "Sammanfatta följande text på svenska",
        "input": "The transformer architecture...",
        "output": "Transformer-arkitekturen revolutionerade..."
    }
]

with open("training_data.jsonl", "w") as f:
    for item in training_data:
        f.write(json.dumps(item, ensure_ascii=False) + "\\n")
\`\`\`

## LoRA: Effektiv finjustering

Low-Rank Adaptation (LoRA) låter dig finjustera stora modeller med minimal hårdvara genom att bara träna en liten del av parametrarna.

\`\`\`python
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3-8B")

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)
print(f"Träningsbara parametrar: {model.print_trainable_parameters()}")
\`\`\`

## Träning med Hugging Face

\`\`\`python
from transformers import TrainingArguments, Trainer

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    learning_rate=2e-5,
    fp16=True,
    save_strategy="epoch",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
)
trainer.train()
\`\`\`

## Utvärdering

Använd BLEU, ROUGE och perplexitet för att mäta kvalitet. Testa alltid med verkliga svenska meningar.

## Sammanfattning

Finjustering med LoRA gör det möjligt att anpassa stora språkmodeller för svenska med begränsade resurser. Nyckeln är bra träningsdata och rätt hyperparametrar.`,

  "mlops-best-practices-2026": `## Från notebook till produktion

De flesta ML-projekt dör i "notebook-fasen". MLOps handlar om att bygga system som tar modeller hela vägen till produktion — och håller dem där.

![Server infrastructure](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop)

## MLOps-mognadsmodell

### Nivå 0: Manuellt
- Modeller tränas i notebooks
- Deployment via manuell kopiering
- Ingen monitorering

### Nivå 1: ML Pipeline
- Automatiserad träningspipeline
- Versionering av modeller och data
- Grundläggande monitorering

### Nivå 2: CI/CD för ML
- Automatiserade tester
- Continuous training
- A/B-testning i produktion

## Verktygsstack 2026

\`\`\`yaml
# Rekommenderad stack
experiment_tracking: "Weights & Biases"
model_registry: "MLflow"
orchestration: "Kubeflow / Airflow"
serving: "Triton / TorchServe"
monitoring: "Evidently AI"
feature_store: "Feast"
\`\`\`

## Modellversionering

\`\`\`python
import mlflow

with mlflow.start_run():
    mlflow.log_param("learning_rate", 0.001)
    mlflow.log_metric("accuracy", 0.95)
    mlflow.sklearn.log_model(model, "model")
\`\`\`

## Monitorering i produktion

Övervaka:
- **Data drift** — Har inputdata ändrats?
- **Model drift** — Har modellens prestanda försämrats?
- **Latency** — Svarar modellen snabbt nog?

## Sammanfattning

MLOps handlar inte om verktyg utan om processer. Börja enkelt, automatisera stegvis, och övervaka allt.`,
};

// Default content for articles without specific content
export const DEFAULT_ARTICLE_CONTENT = `## Översikt

Den här artikeln ger dig en djupgående förståelse för ämnet och praktiska tips du kan använda direkt i dina projekt.

![AI technology](https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop)

## Bakgrund

AI-utveckling i Sverige växer snabbt. Fler företag än någonsin investerar i maskininlärning och artificiell intelligens för att driva innovation.

## Praktiska tips

- **Börja smått** — Identifiera ett avgränsat problem att lösa
- **Iterera snabbt** — Bygg prototyper och validera tidigt
- **Mät allt** — Definiera framgångsmått från start
- **Samarbeta** — Involvera domänexperter tidigt

\`\`\`python
# Exempel: Enkel ML-pipeline
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', RandomForestClassifier(n_estimators=100))
])
pipeline.fit(X_train, y_train)
\`\`\`

## Nästa steg

Fortsätt utforska mer avancerade tekniker och verktyg. Gå med i Sveriges AI-community för att diskutera med andra utvecklare.

## Sammanfattning

Med rätt verktyg, kunskap och community kan svenska AI-utvecklare bygga världsledande lösningar.`;
