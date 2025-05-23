import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""

    for page in doc:
        text += page.get_text()

    doc.close()
    return text

# 예제 실행
pdf_file_path = "알골 과제6.pdf"  # 🔁 여기에 본인의 PDF 파일 경로 입력
extracted_text = extract_text_from_pdf(pdf_file_path)
with open("output.txt", "w", encoding="utf-8") as f:
    f.write(extracted_text)
