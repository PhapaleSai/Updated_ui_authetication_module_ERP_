import sys

try:
    import fitz  # PyMuPDF
    doc = fitz.open(sys.argv[1])
    with open(sys.argv[2], 'w', encoding='utf-8') as f:
        for page in doc:
            f.write(page.get_text())
except ImportError:
    print("PyMuPDF is not installed.")
