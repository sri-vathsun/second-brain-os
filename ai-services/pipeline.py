from sentence_transformers import SentenceTransformer
import chromadb
from transformers import T5Tokenizer, T5ForConditionalGeneration, pipeline
import librosa
import numpy as np

class AIPipeline:
    def __init__(self):
        # Existing models
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.chroma_client = chromadb.Client()
        self.collection = self.chroma_client.get_or_create_collection(name="notes")
        self.summarization_tokenizer = T5Tokenizer.from_pretrained('t5-small')
        self.summarization_model = T5ForConditionalGeneration.from_pretrained('t5-small')

        # New model for speech-to-text
        self.transcription_pipeline = pipeline("automatic-speech-recognition", model="openai/whisper-tiny.en")

    def generate_embedding(self, text):
        # ... existing code ...
        return self.embedding_model.encode(text).tolist()

    def add_embedding(self, note_id: str, text: str):
        # ... existing code ...
        embedding = self.generate_embedding(text)
        self.collection.add(
            embeddings=[embedding],
            documents=[text],
            ids=[str(note_id)]
        )

    def search(self, query: str, n_results: int = 5):
        # ... existing code ...
        query_embedding = self.generate_embedding(query)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        return results

    def summarize(self, text: str):
        # ... existing code ...
        preprocess_text = "summarize: " + text.strip().replace("\n", " ")
        tokenized_text = self.summarization_tokenizer.encode(preprocess_text, return_tensors="pt")
        summary_ids = self.summarization_model.generate(tokenized_text,
                                                    min_length=30,
                                                    max_length=150,
                                                    num_beams=4,
                                                    early_stopping=True)
        summary = self.summarization_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary

    def transcribe_audio(self, audio_data: bytes) -> str:
        """
        Transcribes audio data to text using Whisper.
        """
        # Librosa can read the audio data from bytes
        audio_np, sampling_rate = librosa.load(io.BytesIO(audio_data), sr=16000)
        
        # Perform transcription
        result = self.transcription_pipeline({"sampling_rate": sampling_rate, "raw": audio_np})
        return result['text']

ai_pipeline = AIPipeline()
# Add a simple import for io
import io
