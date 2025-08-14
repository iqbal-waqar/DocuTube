from typing import Dict
from langchain_community.document_loaders import (
    PyMuPDFLoader,
    Docx2txtLoader,
    UnstructuredPowerPointLoader,
    UnstructuredExcelLoader,
    CSVLoader,
    UnstructuredMarkdownLoader,
    TextLoader,
    UnstructuredHTMLLoader,
    UnstructuredXMLLoader,
    JSONLoader
)

class DocumentLoaderService:
    def __init__(self):
        self.supported_extensions = {
            '.pdf': 'PDF Document',
            '.docx': 'Word Document', 
            '.doc': 'Word Document (Legacy)',
            '.pptx': 'PowerPoint Presentation',
            '.ppt': 'PowerPoint Presentation (Legacy)',
            '.xlsx': 'Excel Spreadsheet',
            '.xls': 'Excel Spreadsheet (Legacy)',
            '.csv': 'CSV File',
            '.txt': 'Text File',
            '.md': 'Markdown File',
            '.markdown': 'Markdown File',
            '.html': 'HTML File',
            '.htm': 'HTML File',
            '.xml': 'XML File',
            '.json': 'JSON File'
        }
    
    def is_supported_extension(self, extension: str) -> bool:
        return extension.lower() in self.supported_extensions
    
    def get_file_type_description(self, extension: str) -> str:
        return self.supported_extensions.get(extension.lower(), 'Unknown')
    
    def get_appropriate_loader(self, file_path: str, extension: str):
        extension = extension.lower()
        
        loader_map = {
            '.pdf': lambda: PyMuPDFLoader(file_path),
            '.docx': lambda: Docx2txtLoader(file_path),
            '.doc': lambda: Docx2txtLoader(file_path),
            '.pptx': lambda: UnstructuredPowerPointLoader(file_path),
            '.ppt': lambda: UnstructuredPowerPointLoader(file_path),
            '.xlsx': lambda: UnstructuredExcelLoader(file_path, mode="elements"),
            '.xls': lambda: UnstructuredExcelLoader(file_path, mode="elements"),
            '.csv': lambda: CSVLoader(file_path, encoding='utf-8'),
            '.txt': lambda: TextLoader(file_path, encoding='utf-8'),
            '.md': lambda: UnstructuredMarkdownLoader(file_path),
            '.markdown': lambda: UnstructuredMarkdownLoader(file_path),
            '.html': lambda: UnstructuredHTMLLoader(file_path),
            '.htm': lambda: UnstructuredHTMLLoader(file_path),
            '.xml': lambda: UnstructuredXMLLoader(file_path),
            '.json': lambda: JSONLoader(file_path, jq_schema='.', text_content=False)
        }
        
        if extension not in loader_map:
            raise ValueError(f"Unsupported file type: {extension}")
            
        return loader_map[extension]()
    
    def get_supported_formats(self) -> Dict[str, str]:
        return self.supported_extensions.copy()