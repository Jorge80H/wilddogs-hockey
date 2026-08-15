import fitz
import os

pdf_path = r"g:\EMPLEADOS DIGITALES\CLIENTES\WILDDOGS_WEB\Estatutos\RESOLUCION_No._304_DE_09_DE_ABRIL_DE_2026 PERSONERIA JURIDICA OPWDHC.pdf"
output_path = r"g:\EMPLEADOS DIGITALES\CLIENTES\WILDDOGS_WEB\WildDogsHockey-1\public\images\resolucion-304.png"

try:
    doc = fitz.open(pdf_path)
    page = doc.load_page(0) # First page
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # 2x zoom for better resolution
    pix.save(output_path)
    print(f"Successfully saved image to {output_path}")
except Exception as e:
    print(f"Error: {e}")
