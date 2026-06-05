export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.slice(1).join('.'), message: i.message }));
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }
  req.validated = result.data;
  next();
};
