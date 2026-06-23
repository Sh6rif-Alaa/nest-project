class SuccessResponseOptions {
    message?: string;
    data?: any;
    token?: any;
}

const successResponse = ({ message = "Done", data = undefined, token = undefined }: SuccessResponseOptions) => {
    return { message, data, token }
}

export default successResponse