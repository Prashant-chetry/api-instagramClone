class HttpError extends Error {
    success: boolean;
    message: string;
    statusCode: number;
    constructor(success?: boolean, message?: string, statusCode?: number) {
        super(message);
        this.success = success || false;
        this.message = message || 'Internal Server Error';
        this.statusCode = statusCode || 505;
    }
}
export default HttpError;
