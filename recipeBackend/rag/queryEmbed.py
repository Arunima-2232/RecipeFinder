import re
from rag.vectorDB import lemmatize_text,titles
titles=titles

def embed_query(query,STmodel,title_index,chunks):
        
    query = lemmatize_text(query)

    query_embedding = STmodel.encode(
        [query],
        normalize_embeddings=True
    )

    D1, I1 = title_index.search(query_embedding, 1)

    context = []

    if D1[0][0] > 0.5:

        recipe_title = titles[I1[0][0]]

        context.append(recipe_title)

        started = False

        for chunk in chunks:

            header2 = chunk["metadata"].get("Header_2", "").strip()

            if header2 == recipe_title:
                started = True

            elif started and header2:
                break

            if started:

                header3 = chunk["metadata"].get(
                    "Header_3",
                    ""
                ).strip()

                if header3 != "Nutrition Facts":

                    context.append(chunk["text"])

    return context