from fastapi import HTTPException

class AppExceptions:

    def raise_unsupported_file_type(extension: str):
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {extension}. Supported formats: PDF, DOCX, TXT, MD"
        )

    def raise_invalid_vector_db_type(vector_db_type: str, supported_databases: list):
        raise HTTPException(
            status_code=400, 
            detail=f"vector_db must be one of: {', '.join(supported_databases)}. Got: {vector_db_type}"
        )

    def raise_document_upload_error(error_message: str):
        raise HTTPException(
            status_code=500, 
            detail=f"Error uploading document: {error_message}"
        )

    def raise_document_processing_error(error_message: str):
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing document: {error_message}"
        )

    def raise_no_processed_document():
        raise HTTPException(
            status_code=404, 
            detail="No processed document found. Please upload a document first."
        )

    def raise_document_not_ready(status: str):
        raise HTTPException(
            status_code=400, 
            detail=f"Document processing is {status}. Cannot answer questions yet."
        )

    def raise_question_processing_error(error_message: str):
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing question: {error_message}"
        )

    def raise_no_relevant_information():
        raise HTTPException(
            status_code=404, 
            detail="No relevant information found in the document to answer your question."
        )

    def raise_youtube_processing_error(error_message: str):
        raise HTTPException(
            status_code=400, 
            detail=f"Error processing YouTube video: {error_message}"
        )

    def raise_youtube_summarization_error(error_message: str):
        raise HTTPException(
            status_code=500, 
            detail=f"Error summarizing YouTube video: {error_message}"
        )

    def raise_invalid_youtube_url():
        raise HTTPException(
            status_code=400, 
            detail="Invalid YouTube URL provided. Please provide a valid YouTube video URL."
        )

    def raise_internal_server_error(error_message: str):
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {error_message}"
        )
