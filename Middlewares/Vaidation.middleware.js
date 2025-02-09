export const validation = (schema) => {
    return (req, res, next) => {
        console.log(req.body);

        const inputs = { ...req.body, ...req.params, ...req.query };
        const { error } = schema.validate(inputs, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => ({
                message: detail.message,
                field: detail.path.join("."),
        }));
            return res.status(400).json({ errors });
        }
        next();
    };
};
