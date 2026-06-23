import pymupdf4llm
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import nltk
import re
from nltk.stem import WordNetLemmatizer


lemmatizer = WordNetLemmatizer()

def lemmatize_text(text):
    words = re.findall(r"\b\w+\b", text.lower())

    lemmas = [
        lemmatizer.lemmatize(word)
        for word in words
    ]

    return " ".join(lemmas)

def chunk_pdf(pdf):
    docs=pymupdf4llm.to_markdown(pdf,page_chunks=True)
    headers_to_split_on=[('#','Header_1'),("##", "Header_2"),("###", "Header_3"),]

    md_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=headers_to_split_on, 
        strip_headers=False
    )

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=["\n\n", "\n", " ", ""]
    )

    final_chunks = []
    docs=docs[4:]
    for page in docs:
        page_text = page["text"]
        
        if "table of contents" in page_text.lower():
            continue
        page_text = page["text"]
        page_metadata = {
            "source": pdf,
            "page": page["metadata"].get("page")
        }
        
        md_sections = md_splitter.split_text(page_text)
        
        for section in md_sections:
            sub_chunks = text_splitter.split_text(section.page_content)
            
            for chunk_content in sub_chunks:
                combined_metadata = {**page_metadata, **section.metadata}
                if "nutrition facts" in chunk_content:
                    continue
                final_chunks.append({
                    "text": chunk_content,
                    "metadata": combined_metadata
                })
                
    return final_chunks

chunks = chunk_pdf("D:/LM/cookbook.pdf")
STmodel = SentenceTransformer(
    "BAAI/bge-base-en-v1.5"
)

texts = []
titles = []

for chunk in chunks:
    if "~~**" not in chunk["metadata"].get("Header_2",""):
        headerVal=chunk["metadata"].get("Header_2","")
        chunk["metadata"].pop("Header_2",None)
        chunk["metadata"]["Header_3"]=headerVal
    meta = chunk.get("metadata", {})

    headers = " ".join(
        value
        for key, value in meta.items()
        if key.startswith("Header")
    )

    metadata_prefix = (
        f"Source: {meta.get('source', '')} | "
        f"Page: {meta.get('page', '')} | "
        f"Header: {headers}\n"
    )

    original = chunk["metadata"].get("Header_2", "")
    normalized_text = lemmatize_text(original)
    text=f"""
        Original:
        {original}

        Normalized:
        {normalized_text}
        """

    texts.append(text)

    title = chunk["metadata"].get("Header_2", "")
    if "~~**" in title:
        titles.append(title)
title_embeddings = STmodel.encode(
    titles,
    normalize_embeddings=True
)

title_embeddings = np.array(
    title_embeddings,
    dtype=np.float32
)
dim = title_embeddings.shape[1]

title_index = faiss.IndexFlatIP(dim)
title_index.add(title_embeddings)