import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path):
    """
    PDF 파일 경로를 받아 텍스트를 추출해 문자열로 반환합니다.
    """
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

def save_text_to_file(text, filename="output.txt"):
    """
    추출된 텍스트를 파일로 저장합니다.
    기본 파일명은 output.txt이며, UTF-8 인코딩을 사용합니다.
    """
    with open(filename, "w", encoding="utf-8") as f:
        f.write(text)
