const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(
          `Security Restriction: Your designated profile role [${req.user?.role || "Guest"}] does not have permission.`,
        ),
      );
    }
    next();
  };
};

export { authorize };
