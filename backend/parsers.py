import io
import pypdf
import pandas as pd

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        text_list = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_list.append(text)
        return "\n".join(text_list)
    except Exception as e:
        return f"Error parsing PDF: {str(e)}"

def extract_data_from_csv(file_bytes: bytes) -> str:
    try:
        df = pd.read_csv(io.BytesIO(file_bytes))
        return df.to_string()
    except Exception as e:
        return f"Error parsing CSV: {str(e)}"
