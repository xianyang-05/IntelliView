"""
RAG Policy Ingestion Script for ZeroHR
Loads policies from markdown files and Supabase DB, chunks them,
and stores embeddings in ChromaDB for retrieval.

Usage: python backend/ingest_policies.py
"""

import os
import re
import glob
import chromadb
from dotenv import load_dotenv


load_dotenv()

# ── Config ──────────────────────────────────────────
POLICIES_DIR = os.path.join(os.path.dirname(__file__), "policies")
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
COLLECTION_NAME = "hr_policies"
CHUNK_SIZE = 500        # approx tokens (chars / 4)
CHUNK_OVERLAP = 50      # overlap tokens


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks of ~chunk_size tokens."""
    char_size = chunk_size * 4
    char_overlap = overlap * 4

    # Split on headings for natural boundaries
    sections = re.split(r'\n(?=#{1,3}\s)', text)

    chunks = []
    current_chunk = ""

    for section in sections:
        section = section.strip()
        if not section:
            continue

        if len(current_chunk) + len(section) < char_size:
            current_chunk += "\n" + section if current_chunk else section
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            if len(section) > char_size:
                paragraphs = section.split("\n\n")
                current_chunk = ""
                for para in paragraphs:
                    if len(current_chunk) + len(para) < char_size:
                        current_chunk += "\n\n" + para if current_chunk else para
                    else:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                        current_chunk = para
            else:
                current_chunk = section

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    if len(chunks) <= 1:
        return chunks

    return chunks


def load_markdown_policies() -> list[dict]:
    """Load all .md files from the policies directory."""
    policies = []
    md_files = glob.glob(os.path.join(POLICIES_DIR, "*.md"))

    for filepath in md_files:
        filename = os.path.basename(filepath)
        policy_name = filename.replace(".md", "").replace("_", " ").title()

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        title_match = re.match(r'^#\s+(.+)', content, re.MULTILINE)
        if title_match:
            policy_name = title_match.group(1).strip()

        version_match = re.search(r'v(\d+\.\d+)', content, re.IGNORECASE)
        version = version_match.group(0) if version_match else "1.0"

        policies.append({
            "policy_name": policy_name,
            "content": content,
            "source": "markdown_file",
            "filename": filename,
            "version": version,
            "category": categorize_policy(filename),
        })

    return policies


def load_db_policies() -> list[dict]:
    """Load policies from Firestore hr_policies collection."""
    import firebase_admin
    from firebase_admin import credentials, firestore

    _sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "firebase-service-account.json")
    if not os.path.exists(_sa_path):
        _sa_path = os.path.join(os.path.dirname(__file__), _sa_path)

    if not firebase_admin._apps:
        try:
            cred = credentials.Certificate(_sa_path)
            firebase_admin.initialize_app(cred)
        except Exception:
            print("⚠️  Firebase credentials not found or invalid, skipping DB policies")
            return []

    try:
        db = firestore.client()
        docs = db.collection("hr_policies").where("is_active", "==", True).stream()

        policies = []
        for d in docs:
            row = d.to_dict()
            policies.append({
                "policy_name": row.get("policy_name", "Unknown Policy"),
                "content": row.get("content", ""),
                "source": "database",
                "filename": None,
                "version": row.get("version", "1.0"),
                "category": row.get("category", "other"),
            })

        return policies
    except Exception as e:
        print(f"⚠️  Firestore error (skipping DB policies): {e}")
        return []


def categorize_policy(filename: str) -> str:
    """Guess category from filename."""
    name = filename.lower()
    if "leave" in name:
        return "leave"
    elif "expense" in name:
        return "expense"
    elif "remote" in name:
        return "remote_work"
    elif "promotion" in name or "career" in name:
        return "promotion"
    elif "compliance" in name or "employment_act" in name:
        return "compliance"
    elif "benefit" in name:
        return "benefits"
    elif "address" in name or "personal" in name:
        return "other"
    return "other"


def ingest_policies() -> int:
    """Main ingestion pipeline. Returns count of chunks indexed."""
    print("🔄 Starting policy ingestion...")

    md_policies = load_markdown_policies()
    db_policies = load_db_policies()

    print(f"  📁 Loaded {len(md_policies)} markdown policies")
    print(f"  🗄️  Loaded {len(db_policies)} database policies")

    all_policies = md_policies + db_policies

    if not all_policies:
        print("❌ No policies found!")
        return 0

    client = chromadb.PersistentClient(path=CHROMA_DIR)

    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    all_chunks = []
    all_ids = []
    all_metadatas = []

    for policy in all_policies:
        chunks = chunk_text(policy["content"])
        for i, chunk in enumerate(chunks):
            chunk_id = f"{policy['source']}_{policy['policy_name']}_{i}".replace(" ", "_").lower()
            all_chunks.append(chunk)
            all_ids.append(chunk_id)
            all_metadatas.append({
                "policy_name": policy["policy_name"],
                "source": policy["source"],
                "category": policy["category"],
                "version": policy["version"],
                "chunk_index": i,
                "total_chunks": len(chunks),
            })

    batch_size = 50
    for i in range(0, len(all_chunks), batch_size):
        end = min(i + batch_size, len(all_chunks))
        collection.add(
            documents=all_chunks[i:end],
            ids=all_ids[i:end],
            metadatas=all_metadatas[i:end],
        )

    total = len(all_chunks)
    print(f"✅ Indexed {total} chunks from {len(all_policies)} policies")
    print(f"   📂 ChromaDB path: {CHROMA_DIR}")

    for policy in all_policies:
        chunks_count = len(chunk_text(policy["content"]))
        print(f"   • {policy['policy_name']} ({policy['source']}) → {chunks_count} chunks")

    return total


if __name__ == "__main__":
    count = ingest_policies()
    print(f"\n🎉 Done! {count} total chunks indexed.")
