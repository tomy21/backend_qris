const response = (statusCode, data, message, res, pagination) => {
    res.status(statusCode).json({
        payload: {
            statusCode: statusCode,
            message: message,
            data: data
        },
        pagination: pagination
    })
}

module.exports = response;